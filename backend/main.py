import base64
import io
import time
import os
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")

# ─────────────────────────────────────────────
# CONFIG  (mirrors test_overlay.py)
# ─────────────────────────────────────────────
MODEL_PATH    = "models/Standard_UNet_Best.pth"
PATCH_SIZE    = 512
BATCH_SIZE    = 10     # patches per forward pass — balances speed vs RAM
DEVICE        = "cuda" if torch.cuda.is_available() else "cpu"
OVERLAY_COLOR = (0, 255, 0)   # Green  (R, G, B)
OVERLAY_ALPHA = 0.4           # 40 % opacity — same as test_overlay.py

# ─────────────────────────────────────────────
# MODEL ARCHITECTURE  (exact copy from evaluate_models.py / test_overlay.py)
# ─────────────────────────────────────────────
class DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1),
            nn.BatchNorm2d(out_channels), nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1),
            nn.BatchNorm2d(out_channels), nn.ReLU(inplace=True),
        )
    def forward(self, x):
        return self.conv(x)


class UNet(nn.Module):
    def __init__(self, in_ch=3, out_ch=1):
        super().__init__()
        self.downs = nn.ModuleList([
            DoubleConv(3, 64), DoubleConv(64, 128),
            DoubleConv(128, 256), DoubleConv(256, 512),
        ])
        self.bottleneck = DoubleConv(512, 1024)
        self.ups = nn.ModuleList([
            nn.ConvTranspose2d(1024, 512, 2, 2), DoubleConv(1024, 512),
            nn.ConvTranspose2d(512, 256, 2, 2),  DoubleConv(512, 256),
            nn.ConvTranspose2d(256, 128, 2, 2),  DoubleConv(256, 128),
            nn.ConvTranspose2d(128, 64, 2, 2),   DoubleConv(128, 64),
        ])
        self.final = nn.Conv2d(64, out_ch, 1)
        self.pool  = nn.MaxPool2d(2, 2)

    def forward(self, x):
        skips = []
        for down in self.downs:
            x = down(x); skips.append(x); x = self.pool(x)
        x = self.bottleneck(x)
        skips = skips[::-1]
        for i in range(0, len(self.ups), 2):
            x    = self.ups[i](x)
            skip = skips[i // 2]
            if x.shape != skip.shape:
                x = transforms.functional.resize(x, size=skip.shape[2:])
            x = self.ups[i + 1](torch.cat((skip, x), dim=1))
        return self.final(x)


# ─────────────────────────────────────────────
# MODEL LOADING  (once at startup)
# ─────────────────────────────────────────────
def load_model() -> UNet:
    m = UNet().to(DEVICE)
    m.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    m.eval()
    return m

model = load_model()
print(f"✅ Standard UNet loaded on {DEVICE}")

# ─────────────────────────────────────────────
# PATCH-BASED INFERENCE  (mirrors predict_full_image in test_overlay.py)
# ─────────────────────────────────────────────
_transform = transforms.Compose([
    transforms.Resize((PATCH_SIZE, PATCH_SIZE)),
    transforms.ToTensor(),
])

def predict_full_mask(original_pil: Image.Image) -> Image.Image:
    """
    Collects all 512×512 patches, processes them in mini-batches of BATCH_SIZE,
    then stitches results back into a full-resolution mask.
    """
    w, h = original_pil.size
    patches, coords = [], []

    # ── Collect all patches ──
    for y in range(0, h, PATCH_SIZE):
        for x in range(0, w, PATCH_SIZE):
            patch = original_pil.crop((x, y, x + PATCH_SIZE, y + PATCH_SIZE))
            if patch.size != (PATCH_SIZE, PATCH_SIZE):
                padded = Image.new("RGB", (PATCH_SIZE, PATCH_SIZE))
                padded.paste(patch, (0, 0))
                patch = padded
            patches.append(_transform(patch))
            coords.append((x, y))

    print(f"    → {len(patches)} patches, {BATCH_SIZE} per batch = {-(-len(patches)//BATCH_SIZE)} forward passes")

    # ── Process in mini-batches ──
    all_preds = []
    for i in range(0, len(patches), BATCH_SIZE):
        batch = torch.stack(patches[i : i + BATCH_SIZE]).to(DEVICE)
        with torch.no_grad():
            preds = model(batch)
            preds = (torch.sigmoid(preds) > 0.5).float().squeeze(1).cpu().numpy()
        all_preds.extend(preds)

    # ── Stitch results back into full-resolution mask ──
    full_mask = Image.new("L", (w, h))
    for (x, y), pred in zip(coords, all_preds):
        pred_img = Image.fromarray((pred * 255).astype(np.uint8))
        crop_w   = min(PATCH_SIZE, w - x)
        crop_h   = min(PATCH_SIZE, h - y)
        full_mask.paste(pred_img.crop((0, 0, crop_w, crop_h)), (x, y))

    return full_mask


# ─────────────────────────────────────────────
# OVERLAY GENERATOR  (mirrors create_overlay in test_overlay.py)
# ─────────────────────────────────────────────
def create_overlay(original: Image.Image, mask: Image.Image) -> Image.Image:
    """
    Composites a green overlay onto the original wherever the mask is white.
    Identical logic to test_overlay.py → create_overlay().
    """
    color_layer = Image.new("RGB", original.size, OVERLAY_COLOR)
    mask_np     = np.array(mask)
    alpha_arr   = (mask_np > 0) * int(255 * OVERLAY_ALPHA)
    alpha_mask  = Image.fromarray(alpha_arr.astype(np.uint8), mode="L")
    return Image.composite(color_layer, original, alpha_mask)


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def pil_to_base64_png(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def compute_detection_percent(mask: Image.Image) -> float:
    """Percentage of pixels classified as hard exudate."""
    arr     = np.array(mask)
    positive = int((arr > 0).sum())
    total    = arr.size
    return round((positive / total) * 100, 1)


# ─────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI(title="RetinaScout API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "device": DEVICE, "model": "Standard_UNet_Best"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Accept a retinal fundus image.
    Returns:
      - original_image  : base64 PNG  (original, resized to 512×512 for display)
      - mask_overlay    : base64 PNG  (green overlay composited on original)
      - detection       : { hard_exudates: <float percent> }
    """
    t0 = time.time()

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        original_pil = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not decode image. Send a valid JPG/PNG/TIF.")

    print(f"[1] Image loaded {original_pil.size} — {time.time()-t0:.2f}s")

    # ── Run patch-based inference on full resolution ──
    pred_mask = predict_full_mask(original_pil)
    print(f"[2] Inference done — {time.time()-t0:.2f}s")

    # ── Build overlay on full-resolution original ──
    overlay_pil = create_overlay(original_pil, pred_mask)
    print(f"[3] Overlay created — {time.time()-t0:.2f}s")

    # ── Resize both to 512×512 for display ──
    display_original = original_pil.resize((PATCH_SIZE, PATCH_SIZE), Image.LANCZOS)
    display_overlay  = overlay_pil.resize((PATCH_SIZE, PATCH_SIZE), Image.LANCZOS)
    display_mask     = pred_mask.resize((PATCH_SIZE, PATCH_SIZE), Image.NEAREST)

    detection_pct = compute_detection_percent(display_mask)

    result = JSONResponse({
        "original_image": pil_to_base64_png(display_original),
        "mask_overlay":   pil_to_base64_png(display_overlay),
        "detection": {
            "hard_exudates": detection_pct
        }
    })
    print(f"[4] Response ready — {time.time()-t0:.2f}s total")
    return result


# ─────────────────────────────────────────────
# NEWS ENDPOINTS  (proxies NewsAPI to avoid CORS)
# ─────────────────────────────────────────────
NEWS_BASE = "https://newsapi.org/v2/everything"
NEWS_PARAMS_BASE = {
    "language": "en",
    "sortBy": "publishedAt",
    "pageSize": 10,
}


async def fetch_news(query: str, category: str) -> dict:
    if not NEWS_API_KEY:
        raise HTTPException(status_code=503, detail="NEWS_API_KEY not configured in .env")
    params = {**NEWS_PARAMS_BASE, "q": query, "apiKey": NEWS_API_KEY}
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(NEWS_BASE, params=params)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="NewsAPI error")
    data = resp.json()
    # Filter out articles with removed content
    articles = [a for a in data.get("articles", []) if a.get("title") != "[Removed]"]
    return {"category": category, "articles": articles}


@app.get("/news/latest")
async def news_latest():
    """Ophthalmology & diabetic retinopathy news."""
    return await fetch_news(
        query="diabetic retinopathy OR retinal screening OR ophthalmology",
        category="latest"
    )


@app.get("/news/tech")
async def news_tech():
    """Medical AI & healthcare technology news."""
    return await fetch_news(
        query="medical AI OR deep learning healthcare OR medical imaging technology",
        category="tech"
    )


@app.get("/news/world")
async def news_world():
    """Global health & medical innovation news."""
    return await fetch_news(
        query="global health technology OR medical innovation OR healthcare AI",
        category="world"
    )
