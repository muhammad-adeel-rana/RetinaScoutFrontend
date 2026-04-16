import io
import base64
import numpy as np
import cv2
import torch
import segmentation_models_pytorch as smp
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import albumentations as A
from albumentations.pytorch import ToTensorV2

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
MODEL_PATH = "models/RetinaScout_ResNet34_Best.pth"
IMG_SIZE   = 512
DEVICE     = "cuda" if torch.cuda.is_available() else "cpu"

# Hard-exudate overlay colour  (RGBA – blue-ish)
MASK_COLOR = (59, 130, 246, 200)   # R, G, B, A

# ─────────────────────────────────────────────
# MODEL LOADING  (once at startup)
# ─────────────────────────────────────────────
def load_model() -> torch.nn.Module:
    model = smp.Unet(
        encoder_name="resnet34",
        encoder_weights=None,       # weights come from our .pth
        in_channels=3,
        classes=1,
        activation=None,
    )
    state = torch.load(MODEL_PATH, map_location=DEVICE)
    model.load_state_dict(state)
    model.to(DEVICE)
    model.eval()
    return model

model = load_model()
print(f"✅ Model loaded on {DEVICE}")

# ─────────────────────────────────────────────
# PREPROCESSING  (mirrors RetinalDataset val transform)
# ─────────────────────────────────────────────
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

val_transform = A.Compose([
    A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2(),
])

def preprocess(image_bgr: np.ndarray) -> torch.Tensor:
    """BGR numpy → model-ready tensor (1, 3, H, W)."""
    # Resize to training size
    image_bgr = cv2.resize(image_bgr, (IMG_SIZE, IMG_SIZE))

    # Green channel + CLAHE (same as training)
    green   = image_bgr[:, :, 1]
    enhanced = clahe.apply(green)
    image_3ch = cv2.merge([enhanced, enhanced, enhanced])

    # Albumentations normalise + to tensor
    augmented = val_transform(image=image_3ch)
    tensor = augmented["image"].unsqueeze(0).to(DEVICE)   # (1, 3, H, W)
    return tensor

# ─────────────────────────────────────────────
# INFERENCE
# ─────────────────────────────────────────────
def run_inference(image_bgr: np.ndarray) -> np.ndarray:
    """Returns binary mask (H, W) with values 0 or 1 (uint8)."""
    tensor = preprocess(image_bgr)
    with torch.no_grad():
        logits = model(tensor)                        # (1, 1, H, W)
        probs  = torch.sigmoid(logits)
        binary = (probs > 0.5).squeeze().cpu().numpy().astype(np.uint8)
    return binary   # shape (512, 512)

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def ndarray_to_base64_png(arr: np.ndarray) -> str:
    """Convert numpy image (H,W,C) or (H,W) to base64 PNG data-URI."""
    success, buf = cv2.imencode(".png", arr)
    if not success:
        raise RuntimeError("cv2.imencode failed")
    b64 = base64.b64encode(buf.tobytes()).decode("utf-8")
    return f"data:image/png;base64,{b64}"

def colorize_mask(binary_mask: np.ndarray) -> np.ndarray:
    """
    Convert 0/1 binary mask → RGBA overlay image.
    Pixels where mask==1 get MASK_COLOR, others are transparent.
    Returns (H, W, 4) uint8 array.
    """
    h, w = binary_mask.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[binary_mask == 1] = MASK_COLOR
    return rgba

def compute_detection_percent(binary_mask: np.ndarray) -> float:
    """Percentage of retinal pixels classified as hard exudate."""
    total = binary_mask.size
    positive = int(binary_mask.sum())
    return round((positive / total) * 100, 1)

# ─────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI(title="RetinaScout API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "device": DEVICE}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Accept a retinal fundus image.
    Returns:
      - original_image : base64 PNG (resized to 512×512)
      - mask_overlay   : base64 PNG RGBA (coloured mask, transparent background)
      - detection      : { hard_exudates: <float percent> }
    """
    # ── Read uploaded bytes ──
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    np_arr   = np.frombuffer(contents, np.uint8)
    image_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image_bgr is None:
        raise HTTPException(status_code=400, detail="Could not decode image. Send a valid JPG/PNG.")

    # ── Resize original for display (match model input size) ──
    display_bgr = cv2.resize(image_bgr, (IMG_SIZE, IMG_SIZE))

    # ── Run model ──
    binary_mask = run_inference(image_bgr)

    # ── Build outputs ──
    original_b64 = ndarray_to_base64_png(display_bgr)
    mask_rgba    = colorize_mask(binary_mask)

    # cv2 expects BGRA for PNG encoding
    mask_bgra = cv2.cvtColor(mask_rgba, cv2.COLOR_RGBA2BGRA)
    mask_b64  = ndarray_to_base64_png(mask_bgra)

    detection_pct = compute_detection_percent(binary_mask)

    return JSONResponse({
        "original_image": original_b64,
        "mask_overlay":   mask_b64,
        "detection": {
            "hard_exudates": detection_pct
        }
    })
