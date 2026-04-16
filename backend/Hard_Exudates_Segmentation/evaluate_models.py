import os
import torch
import torch.nn as nn
import numpy as np
from PIL import Image
from tqdm import tqdm
import torchvision.transforms.functional as TF

# --- CONFIGURATION ---
CONFIG = {
    # PASTE YOUR PATHS HERE
    "TEST_IMG_DIR":  "/mnt/d/Rana Muhammad Adeel/Final Year Project/Segmentation/A. Segmentation/1. Original Images/b. Testing Set",
    "TEST_MASK_DIR": "/mnt/d/Rana Muhammad Adeel/Final Year Project/Segmentation/A. Segmentation/2. All Segmentation Groundtruths/b. Testing Set/3. Hard Exudates",
    
    # Updated to your training size
    "PATCH_SIZE": 512, 
    "STRIDE": 256,
    "DEVICE": "cuda" if torch.cuda.is_available() else "cpu"
}

# ==========================================
# 1. STANDARD U-NET (Matches saved weights: bias=False)
# ==========================================
class StdDoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, 1, 1, bias=False), # Important: False
            nn.BatchNorm2d(out_channels), nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, 1, 1, bias=False), # Important: False
            nn.BatchNorm2d(out_channels), nn.ReLU(inplace=True),
        )
    def forward(self, x): return self.conv(x)

class StandardUNet(nn.Module):
    def __init__(self, in_channels=3, out_channels=1):
        super().__init__()
        self.downs = nn.ModuleList()
        self.ups = nn.ModuleList()
        self.pool = nn.MaxPool2d(2, 2)
        features = [64, 128, 256, 512]
        
        for feature in features:
            self.downs.append(StdDoubleConv(in_channels, feature))
            in_channels = feature
            
        for feature in reversed(features):
            self.ups.append(nn.ConvTranspose2d(feature*2, feature, 2, 2))
            self.ups.append(StdDoubleConv(feature*2, feature))
            
        self.bottleneck = StdDoubleConv(features[-1], features[-1]*2)
        self.final_conv = nn.Conv2d(features[0], out_channels, 1)

    def forward(self, x):
        skip_connections = []
        for down in self.downs:
            x = down(x)
            skip_connections.append(x)
            x = self.pool(x)
        x = self.bottleneck(x)
        skip_connections = skip_connections[::-1]
        for idx in range(0, len(self.ups), 2):
            x = self.ups[idx](x)
            skip = skip_connections[idx//2]
            if x.shape != skip.shape: x = TF.resize(x, skip.shape[2:])
            x = self.ups[idx+1](torch.cat((skip, x), dim=1))
        return self.final_conv(x)

# ==========================================
# 2. ATTENTION U-NET (Matches saved weights: bias=True)
# ==========================================
class AttConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1), # Default Bias=True
            nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1), # Default Bias=True
            nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True)
        )
    def forward(self, x): return self.conv(x)

class AttnBlock(nn.Module):
    def __init__(self, F_g, F_l, F_int):
        super().__init__()
        self.W_g = nn.Sequential(nn.Conv2d(F_g, F_int, 1), nn.BatchNorm2d(F_int))
        self.W_x = nn.Sequential(nn.Conv2d(F_l, F_int, 1), nn.BatchNorm2d(F_int))
        self.psi = nn.Sequential(nn.Conv2d(F_int, 1, 1), nn.BatchNorm2d(1), nn.Sigmoid())
        self.relu = nn.ReLU(inplace=True)
    def forward(self, g, x):
        return x * self.psi(self.relu(self.W_g(g) + self.W_x(x)))

class AttentionUNet(nn.Module):
    def __init__(self, in_channels=3, out_channels=1):
        super().__init__()
        self.pool = nn.MaxPool2d(2, 2)
        self.e1 = AttConvBlock(in_channels, 64)
        self.e2 = AttConvBlock(64, 128)
        self.e3 = AttConvBlock(128, 256)
        self.e4 = AttConvBlock(256, 512)
        self.b = AttConvBlock(512, 1024)
        
        self.up1 = nn.ConvTranspose2d(1024, 512, 2, stride=2); self.att1 = AttnBlock(512, 512, 256); self.d1 = AttConvBlock(1024, 512)
        self.up2 = nn.ConvTranspose2d(512, 256, 2, stride=2); self.att2 = AttnBlock(256, 256, 128); self.d2 = AttConvBlock(512, 256)
        self.up3 = nn.ConvTranspose2d(256, 128, 2, stride=2); self.att3 = AttnBlock(128, 128, 64); self.d3 = AttConvBlock(256, 128)
        self.up4 = nn.ConvTranspose2d(128, 64, 2, stride=2); self.att4 = AttnBlock(64, 64, 32); self.d4 = AttConvBlock(128, 64)
        self.out = nn.Conv2d(64, out_channels, 1)

    def forward(self, x):
        x1 = self.e1(x); p1 = self.pool(x1)
        x2 = self.e2(p1); p2 = self.pool(x2)
        x3 = self.e3(p2); p3 = self.pool(x3)
        x4 = self.e4(p3); p4 = self.pool(x4)
        b = self.b(p4)
        d1 = self.up1(b); x4 = self.att1(d1, x4); d1 = self.d1(torch.cat((x4, d1), 1))
        d2 = self.up2(d1); x3 = self.att2(d2, x3); d2 = self.d2(torch.cat((x3, d2), 1))
        d3 = self.up3(d2); x2 = self.att3(d3, x2); d3 = self.d3(torch.cat((x2, d3), 1))
        d4 = self.up4(d3); x1 = self.att4(d4, x1); d4 = self.d4(torch.cat((x1, d4), 1))
        return self.out(d4)

# --- 3. SLIDING WINDOW PREDICTION ---
def predict_full_image(model, img_path, patch_size=512, stride=512, device="cuda"):
    model.eval()
    
    # 1. Load Image
    image = Image.open(img_path).convert("RGB")
    w, h = image.size
    
    # 2. Pad Image to be divisible by patch_size (512)
    #    If image is 4288x2848:
    #    4288 % 512 = 192, so we need 512-192 = 320 padding
    pad_w = (patch_size - w % patch_size) % patch_size
    pad_h = (patch_size - h % patch_size) % patch_size
    
    full_image = TF.pad(image, (0, 0, pad_w, pad_h)) # Pad right and bottom
    full_w, full_h = full_image.size
    
    # 3. Create Canvas for result
    full_mask = torch.zeros((full_h, full_w))
    img_tensor = TF.to_tensor(full_image) # (3, H, W)
    
    with torch.no_grad():
        # Loop through patches
        for y in range(0, full_h, stride):
            for x in range(0, full_w, stride):
                
                # Extract 512x512 Patch
                patch = img_tensor[:, y:y+patch_size, x:x+patch_size]
                
                # Check if patch is somehow smaller (shouldn't happen with padding)
                if patch.shape[1] != patch_size or patch.shape[2] != patch_size:
                    continue

                patch = patch.unsqueeze(0).to(device) # Add batch dim -> (1, 3, 512, 512)
                
                # Predict
                pred = torch.sigmoid(model(patch))
                pred = (pred > 0.5).float().squeeze().cpu() # (512, 512)
                
                # Paste into canvas
                full_mask[y:y+patch_size, x:x+patch_size] = pred
                
    # 4. Crop back to original size (remove padding)
    final_mask = full_mask[:h, :w]
    return final_mask

# --- 4. MAIN ---
def main():
    print(f"--- Sliding Window Evaluation (Patch: {CONFIG['PATCH_SIZE']}) ---")
    
    # Get File Lists
    valid_ext = ('.png', '.jpg', '.jpeg', '.tif')
    images = sorted([f for f in os.listdir(CONFIG["TEST_IMG_DIR"]) if f.lower().endswith(valid_ext)])
    masks = sorted([f for f in os.listdir(CONFIG["TEST_MASK_DIR"]) if f.lower().endswith(valid_ext)])
    
    count = min(len(images), len(masks))
    print(f"Found {count} image pairs to evaluate.")

    # Load Models
    models = {}
    if os.path.exists("Standard_UNet_best.pth"):
        print("Loading Standard U-Net...")
        m = StandardUNet().to(CONFIG["DEVICE"])
        m.load_state_dict(torch.load("Standard_UNet_best.pth", map_location=CONFIG["DEVICE"]))
        models["Standard"] = m
        
    if os.path.exists("Attention_UNet_best.pth"):
        print("Loading Attention U-Net...")
        m = AttentionUNet().to(CONFIG["DEVICE"])
        m.load_state_dict(torch.load("Attention_UNet_best.pth", map_location=CONFIG["DEVICE"]))
        models["Attention"] = m

    if not models:
        print("No models found! (Make sure .pth files are in this folder)")
        return

    results = {name: {"dice": 0, "iou": 0} for name in models}
    
    # Process Images
    pbar = tqdm(range(count), desc="Evaluating")
    for i in pbar:
        img_name = images[i]
        mask_name = masks[i]
        
        img_path = os.path.join(CONFIG["TEST_IMG_DIR"], img_name)
        mask_path = os.path.join(CONFIG["TEST_MASK_DIR"], mask_name)
        
        # Load GT Mask
        gt_mask = Image.open(mask_path).convert("L")
        gt_tensor = TF.to_tensor(gt_mask).squeeze()
        gt_tensor = (gt_tensor > 0.5).float()
        
        for name, model in models.items():
            # PREDICT (Sliding Window 512x512)
            pred_mask = predict_full_image(model, img_path, CONFIG["PATCH_SIZE"], CONFIG["STRIDE"], CONFIG["DEVICE"])
            
            # METRICS
            intersection = (pred_mask * gt_tensor).sum()
            union = pred_mask.sum() + gt_tensor.sum() - intersection
            
            dice = (2 * intersection) / (pred_mask.sum() + gt_tensor.sum() + 1e-8)
            iou = intersection / (union + 1e-8)
            
            results[name]["dice"] += dice.item()
            results[name]["iou"] += iou.item()
            
            # Live update progress bar
            if name == "Attention":
                 pbar.set_postfix({"Attn_Dice": f"{dice.item():.4f}"})

    # FINAL REPORT
    print("\n\n" + "="*35)
    print(f"{'MODEL':<15} | {'DICE':<7} | {'IOU':<7}")
    print("-" * 35)
    for name, metrics in results.items():
        avg_dice = metrics["dice"] / count
        avg_iou = metrics["iou"] / count
        print(f"{name:<15} | {avg_dice:.4f}  | {avg_iou:.4f}")
    print("="*35 + "\n")

if __name__ == "__main__":
    main()