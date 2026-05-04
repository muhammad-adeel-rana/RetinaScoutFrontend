import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import numpy as np
import os
import glob
from tqdm import tqdm

# ================= CONFIGURATION =================
# 1. Path to your Hard Exudates Model (Check the name!)
MODEL_PATH = "Standard_UNet_Best.pth" 
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
PATCH_SIZE = 512

# 2. Path to Test Images
TEST_IMG_DIR = "/mnt/d/Rana Muhammad Adeel/Final Year Project/Segmentation/A. Segmentation/1. Original Images/b. Testing Set"

# 3. Path to Hard Exudate Ground Truths
# (Adjust this path if your folder structure is slightly different)
TEST_MASK_DIR = "/mnt/d/Rana Muhammad Adeel/Final Year Project/Segmentation/A. Segmentation/2. All Segmentation Groundtruths/b. Testing Set/3. Hard Exudates"
# =================================================

# --- 1. Define Model Architecture (Must match training) ---
class DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1),
            nn.BatchNorm2d(out_channels), nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1),
            nn.BatchNorm2d(out_channels), nn.ReLU(inplace=True),
        )
    def forward(self, x): return self.conv(x)

class UNet(nn.Module):
    def __init__(self, in_ch=3, out_ch=1):
        super().__init__()
        self.downs = nn.ModuleList([DoubleConv(3,64), DoubleConv(64,128), DoubleConv(128,256), DoubleConv(256,512)])
        self.bottleneck = DoubleConv(512, 1024)
        self.ups = nn.ModuleList([
            nn.ConvTranspose2d(1024, 512, 2, 2), DoubleConv(1024, 512),
            nn.ConvTranspose2d(512, 256, 2, 2), DoubleConv(512, 256),
            nn.ConvTranspose2d(256, 128, 2, 2), DoubleConv(256, 128), 
            nn.ConvTranspose2d(128, 64, 2, 2), DoubleConv(128, 64)    
        ])
        self.final = nn.Conv2d(64, out_ch, 1)
        self.pool = nn.MaxPool2d(2, 2)
    def forward(self, x):
        skips = []; 
        for down in self.downs: x = down(x); skips.append(x); x = self.pool(x)
        x = self.bottleneck(x); skips = skips[::-1]
        for i in range(0, len(self.ups), 2):
            x = self.ups[i](x); skip = skips[i//2]
            if x.shape != skip.shape: x = transforms.functional.resize(x, size=skip.shape[2:])
            x = self.ups[i+1](torch.cat((skip, x), dim=1))
        return self.final(x)

# --- 2. Metric Calculations ---
def calculate_metrics(pred_mask, true_mask):
    # Flatten arrays
    pred = pred_mask.flatten()
    true = true_mask.flatten()
    
    # Calculate Intersection and Union
    intersection = np.logical_and(pred, true).sum()
    union = np.logical_or(pred, true).sum()
    
    # IoU
    if union == 0:
        iou = 1.0 if intersection == 0 else 0.0
    else:
        iou = intersection / union

    # Dice Coefficient (F1 Score)
    # Dice = 2 * Intersection / (Sum of pixels in Pred + Sum of pixels in True)
    dice_denom = pred.sum() + true.sum()
    if dice_denom == 0:
        dice = 1.0 # Both empty
    else:
        dice = (2. * intersection) / dice_denom

    return iou, dice

# --- 3. Prediction Logic (Patch-Based) ---
def predict_full_mask(model, img_path):
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    full_mask = Image.new("L", (w, h))
    transform = transforms.Compose([transforms.Resize((PATCH_SIZE, PATCH_SIZE)), transforms.ToTensor()])
    
    for y in range(0, h, PATCH_SIZE):
        for x in range(0, w, PATCH_SIZE):
            patch = img.crop((x, y, x + PATCH_SIZE, y + PATCH_SIZE))
            # Handle edge cases
            if patch.size != (PATCH_SIZE, PATCH_SIZE):
                new_p = Image.new("RGB", (PATCH_SIZE, PATCH_SIZE))
                new_p.paste(patch, (0,0))
                patch = new_p

            with torch.no_grad():
                patch_t = transform(patch).unsqueeze(0).to(DEVICE)
                pred = model(patch_t)
                pred = (torch.sigmoid(pred) > 0.5).float().squeeze().cpu().numpy()
            
            # Paste back
            pred_img = Image.fromarray((pred * 255).astype(np.uint8))
            full_mask.paste(pred_img.crop((0, 0, min(PATCH_SIZE, w-x), min(PATCH_SIZE, h-y))), (x, y))
            
    return np.array(full_mask) // 255 # Convert to 0 and 1

# --- 4. Main Evaluation Loop ---
def evaluate():
    print(f"🚀 Loading Model: {MODEL_PATH}")
    model = UNet().to(DEVICE)
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        model.eval()
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return

    # Find test images
    test_images = glob.glob(os.path.join(TEST_IMG_DIR, "*.*"))
    print(f"📂 Found {len(test_images)} test images. Starting evaluation...")
    
    total_iou = 0
    total_dice = 0
    count = 0

    print(f"{'Image ID':<15} | {'IoU':<10} | {'Dice':<10}")
    print("-" * 40)

    for img_path in tqdm(test_images):
        filename = os.path.basename(img_path)
        img_id = os.path.splitext(filename)[0]

        # Find Matching Mask
        # Look for *ID*_EX.tif or similar
        mask_candidates = glob.glob(os.path.join(TEST_MASK_DIR, f"*{img_id}*.*"))
        # Filter for likely mask extensions
        mask_candidates = [m for m in mask_candidates if m.lower().endswith(('.tif', '.png', '.jpg'))]
        
        if not mask_candidates:
            # Skip if no ground truth (cannot evaluate)
            continue
        
        mask_path = mask_candidates[0]
        
        # Load Ground Truth
        true_mask_img = Image.open(mask_path).convert("L")
        # Resize ground truth to match original image if needed (usually they match)
        # But ensure it is binary 0 and 1
        true_mask = np.array(true_mask_img)
        true_mask = (true_mask > 0).astype(np.uint8) # Force binary

        # Predict
        pred_mask = predict_full_mask(model, img_path)
        
        # Ensure dimensions match (resize pred if slight mismatch due to patching)
        if pred_mask.shape != true_mask.shape:
             # This rarely happens if original image size was preserved, 
             # but we can crop/pad if necessary. For now assume match.
             pass

        # Calculate Metrics
        iou, dice = calculate_metrics(pred_mask, true_mask)
        
        print(f"{img_id:<15} | {iou:.4f}     | {dice:.4f}")
        
        total_iou += iou
        total_dice += dice
        count += 1

    if count > 0:
        avg_iou = total_iou / count
        avg_dice = total_dice / count
        print("\n" + "="*40)
        print(f"📊 FINAL RESULTS ({count} images)")
        print(f"✅ Average IoU:  {avg_iou:.4f}")
        print(f"✅ Average Dice: {avg_dice:.4f}")
        print("="*40)
    else:
        print("❌ No matching masks found to evaluate.")

if __name__ == "__main__":
    evaluate()