import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image, ImageOps
import matplotlib.pyplot as plt
import numpy as np
import subprocess
import os
import sys
import glob

# ================= CONFIGURATION =================
MODEL_PATH = "Standard_UNet_Best.pth" 
PATCH_SIZE = 512
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Path to Ground Truths
GT_DIR = "/mnt/d/Rana Muhammad Adeel/Final Year Project/Segmentation/A. Segmentation/2. All Segmentation Groundtruths/b. Testing Set"
GT_SUBFOLDERS_TO_CHECK = ["3. Hard Exaduates", "3. Hard Exudates", "3. Hard Exudate"]

# OVERLAY COLOR (R, G, B) - Green is standard for medical
OVERLAY_COLOR = (0, 255, 0) 
# Transparency of the color (0.0 = invisible, 1.0 = solid color)
OVERLAY_ALPHA = 0.4
# =================================================

# --- 1. Define Model ---
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

# --- 2. Robust File Picker ---
def open_file_dialog():
    print("📂 Opening Windows File Explorer...")
    try:
        ps_command = (
            "Add-Type -AssemblyName System.Windows.Forms; "
            "$f = New-Object System.Windows.Forms.OpenFileDialog; "
            "$f.Filter = 'Images|*.jpg;*.png;*.tif;*.jpeg'; "
            "$f.ShowDialog() | Out-Null; "
            "$f.FileName"
        )
        cmd = ["powershell.exe", "-NoProfile", "-Command", ps_command]
        output = subprocess.check_output(cmd, shell=False).decode().strip()
        if not output: sys.exit()
        return output.replace('D:\\', '/mnt/d/').replace('C:\\', '/mnt/c/').replace('\\', '/')
    except Exception as e:
        print(f"⚠️ Picker Failed: {e}")
        raw = input("Paste image path manually: ").strip('"').strip("'")
        return raw.replace('D:\\', '/mnt/d/').replace('C:\\', '/mnt/c/').replace('\\', '/')

# --- 3. Mask Finder ---
def find_ground_truth(img_path):
    print(f"🔍 Searching for mask in: {GT_DIR}...")
    filename = os.path.basename(img_path)
    img_id = os.path.splitext(filename)[0]
    
    search_paths = [GT_DIR]
    for sub in GT_SUBFOLDERS_TO_CHECK: search_paths.append(os.path.join(GT_DIR, sub))

    for sp in search_paths:
        if not os.path.exists(sp): continue
        candidates = glob.glob(os.path.join(sp, f"*{img_id}*EX*.*"))
        if not candidates: candidates = glob.glob(os.path.join(sp, f"*{img_id}*.*"))
        candidates = [c for c in candidates if c != img_path and "jpg" not in c.lower()]
        if candidates:
            print(f"✅ Found Mask: {os.path.basename(candidates[0])}")
            return candidates[0]
    return None

# --- 4. Prediction Logic ---
def predict_full_image(model, img_path):
    print(f"⏳ Processing: {os.path.basename(img_path)}")
    original_img = Image.open(img_path).convert("RGB")
    w, h = original_img.size
    full_mask = Image.new("L", (w, h))
    
    transform = transforms.Compose([transforms.Resize((PATCH_SIZE, PATCH_SIZE)), transforms.ToTensor()])

    print("⚙️  Running AI...", end="")
    for y in range(0, h, PATCH_SIZE):
        for x in range(0, w, PATCH_SIZE):
            patch = original_img.crop((x, y, x + PATCH_SIZE, y + PATCH_SIZE))
            if patch.size != (PATCH_SIZE, PATCH_SIZE):
                new_p = Image.new("RGB", (PATCH_SIZE, PATCH_SIZE)); new_p.paste(patch, (0,0)); patch = new_p

            with torch.no_grad():
                pred = model(transform(patch).unsqueeze(0).to(DEVICE))
                pred = (torch.sigmoid(pred) > 0.5).float().squeeze().cpu().numpy()

            pred_img = Image.fromarray((pred * 255).astype(np.uint8))
            full_mask.paste(pred_img.crop((0, 0, min(PATCH_SIZE, w-x), min(PATCH_SIZE, h-y))), (x, y))
            print(".", end="", flush=True)
    print(" Done!")
    return original_img, full_mask

# --- 5. NEW: Overlay Generator ---
def create_overlay(original, mask):
    """
    Creates a green overlay on the original image wherever the mask is white.
    """
    # 1. Create a solid green image of the same size
    color_layer = Image.new("RGB", original.size, OVERLAY_COLOR)
    
    # 2. Create an alpha mask from our prediction
    # If mask is white -> Alpha is High (Visible)
    # If mask is black -> Alpha is 0 (Invisible)
    mask_np = np.array(mask)
    alpha_mask = (mask_np > 0) * int(255 * OVERLAY_ALPHA)
    alpha_mask = Image.fromarray(alpha_mask.astype(np.uint8), mode="L")
    
    # 3. Composite the Green Layer onto the Original using the Alpha Mask
    return Image.composite(color_layer, original, alpha_mask)

# --- 6. Main Execution ---
if __name__ == "__main__":
    img_path = open_file_dialog()
    mask_path = find_ground_truth(img_path)

    model = UNet().to(DEVICE)
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        model.eval()
    except:
        print(f"❌ Error: Model {MODEL_PATH} not found.")
        sys.exit()

    original, pred_mask = predict_full_image(model, img_path)
    
    # Generate the Overlay
    overlay_img = create_overlay(original, pred_mask)

    # Display 4-Panel Plot
    plt.figure(figsize=(24, 6))
    
    plt.subplot(1, 4, 1); plt.title("1. Original"); plt.imshow(original); plt.axis('off')
    
    plt.subplot(1, 4, 2); plt.title("2. Ground Truth"); 
    if mask_path:
        true_mask = Image.open(mask_path).convert("L").resize(original.size)
        plt.imshow(true_mask, cmap='gray')
    else: plt.text(0.5, 0.5, "Not Found", ha='center')
    plt.axis('off')

    plt.subplot(1, 4, 3); plt.title("3. Prediction"); plt.imshow(pred_mask, cmap='gray'); plt.axis('off')
    
    # NEW PANEL
    plt.subplot(1, 4, 4); plt.title("4. Result Overlay"); plt.imshow(overlay_img); plt.axis('off')

    # Save Results
    plt.savefig("final_overlay_comparison.png", dpi=300)
    
    # Also save the overlay by itself for your presentation
    overlay_img.save("just_overlay.png")
    
    print(f"\n📸 SUCCESS!")
    print(f"   - Combined View: final_overlay_comparison.png")
    print(f"   - Overlay Only:  just_overlay.png")