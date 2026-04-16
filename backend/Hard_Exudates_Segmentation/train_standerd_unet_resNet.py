import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import cv2 
from tqdm import tqdm
import segmentation_models_pytorch as smp  # <--- THE GAME CHANGER
import albumentations as A  # You need: pip install albumentations
from albumentations.pytorch import ToTensorV2


# ================= CONFIGURATION =================
BATCH_SIZE = 16          
LEARNING_RATE = 1e-4      # Lower LR because the model is already smart
EPOCHS = 30               # You will see results in epoch 5
IMG_SIZE = 512           
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

TRAIN_CSV = "train.csv"
VAL_CSV = "val.csv"
SAVE_DIR = "Processed_Data/Models"
MODEL_NAME = "RetinaScout_ResNet34_Best.pth"
# =================================================

os.makedirs(SAVE_DIR, exist_ok=True)

# --- 1. PREPROCESSING (Keep your Green/CLAHE, it helps!) ---
class RetinalDataset(Dataset):
    def __init__(self, csv_file, img_size=512, mode='train'):
        self.data = pd.read_csv(csv_file, header=None)
        self.img_size = img_size
        self.mode = mode
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        
        # --- AUGMENTATION PIPELINE (The Fix for Overfitting) ---
        if mode == 'train':
            self.transform = A.Compose([
                A.HorizontalFlip(p=0.5),
                A.VerticalFlip(p=0.5),
                A.RandomRotate90(p=0.5),
                A.ShiftScaleRotate(shift_limit=0.0625, scale_limit=0.1, rotate_limit=45, p=0.5),
                A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)), # ImageNet Norm
                ToTensorV2(),
            ])
        else:
            # Validation: No flips, just Normalize
            self.transform = A.Compose([
                A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
                ToTensorV2(),
            ])

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        img_path = str(self.data.iloc[idx, 0])
        mask_path = str(self.data.iloc[idx, 1])

        # Path Fixes
        if "mnt" not in img_path and os.name != 'nt': 
            img_path = img_path.replace('D:\\', '/mnt/d/').replace('\\', '/')
            mask_path = mask_path.replace('D:\\', '/mnt/d/').replace('\\', '/')

        # Load Image
        image = cv2.imread(img_path)
        if image is None: 
            return torch.zeros((3, self.img_size, self.img_size)), torch.zeros((1, self.img_size, self.img_size))

        # Green Channel + CLAHE
        green = image[:, :, 1]
        enhanced = self.clahe.apply(green)
        image = cv2.merge([enhanced, enhanced, enhanced])
        
        # Load Mask
        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
        
        # Resize if needed (albumentations handles this better, but keep for safety)
        if image.shape[0] != self.img_size:
            image = cv2.resize(image, (self.img_size, self.img_size))
            mask = cv2.resize(mask, (self.img_size, self.img_size), interpolation=cv2.INTER_NEAREST)

        # Mask to 0/1 (Binary)
        mask = mask / 255.0
        mask = mask.astype(np.float32)

        # APPLY AUGMENTATION
        augmented = self.transform(image=image, mask=mask)
        image_tensor = augmented['image']
        mask_tensor = augmented['mask'].unsqueeze(0) # Add channel dim

        return image_tensor, mask_tensor

# --- 2. THE NEW ARCHITECTURE (ResNet34 Backbone) ---
def get_model():
    # This downloads weights trained on 14 million images
    model = smp.Unet(
        encoder_name="resnet34",        # The heavy lifter
        encoder_weights="imagenet",     # Pre-trained knowledge
        in_channels=3,                  # Expects 3 channels (our stacked Green)
        classes=1,                      # Binary segmentation
        activation=None                 # We apply sigmoid in Loss/Loop
    )
    return model

# --- 3. LOSS FUNCTION (Keep TFL, it handles imbalance) ---
class FocalTverskyLoss(nn.Module):
    def __init__(self, alpha=0.3, beta=0.7, gamma=2.0, smooth=1.0):
        super(FocalTverskyLoss, self).__init__()
        self.alpha = alpha 
        self.beta = beta    
        self.gamma = gamma 
        self.smooth = smooth

    def forward(self, inputs, targets):
        inputs = inputs.view(-1)
        targets = targets.view(-1)
        inputs = torch.sigmoid(inputs)
        
        TP = (inputs * targets).sum()
        FP = ((1 - targets) * inputs).sum()
        FN = (targets * (1 - inputs)).sum()
        
        Tversky = (TP + self.smooth) / (TP + self.alpha * FP + self.beta * FN + self.smooth)
        return (1 - Tversky)**self.gamma

# --- 4. TRAINING LOOP ---
def train_fn(loader, model, optimizer, loss_fn, scaler):
    loop = tqdm(loader)
    for batch_idx, (data, targets) in enumerate(loop):
        data, targets = data.to(DEVICE), targets.to(DEVICE)

        with torch.amp.autocast('cuda'):
            predictions = model(data)
            loss = loss_fn(predictions, targets)

        optimizer.zero_grad()
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        loop.set_postfix(loss=loss.item())

def main():
    print(f"✅ Hardware Check: Training on {DEVICE}")
    
   # UPDATE THIS PART IN main()
    train_ds = RetinalDataset(csv_file=TRAIN_CSV, mode='train') # Enables Augmentation
    val_ds = RetinalDataset(csv_file=VAL_CSV, mode='val')       # Disables Augmentation
    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0) # Set workers=4 if Linux
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # LOAD THE NEW MODEL
    model = get_model().to(DEVICE)
    
    loss_fn = FocalTverskyLoss(alpha=0.3, beta=0.7, gamma=2.0)
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scaler = torch.amp.GradScaler('cuda')

    best_iou = 0.0

    print("🚀 Starting Transfer Learning with ResNet34...")

    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch+1}/{EPOCHS}")
        model.train()
        train_fn(train_loader, model, optimizer, loss_fn, scaler)

        # Validation
        model.eval()
        dice_score = 0
        iou_score = 0
        
        with torch.no_grad():
            for data, targets in val_loader:
                data, targets = data.to(DEVICE), targets.to(DEVICE)
                preds = torch.sigmoid(model(data))
                preds = (preds > 0.5).float()
                
                intersection = (preds * targets).sum()
                union = preds.sum() + targets.sum()
                
                dice_score += (2 * intersection) / (union + 1e-8)
                iou_score += intersection / (union - intersection + 1e-8)

        avg_dice = dice_score / len(val_loader)
        avg_iou = iou_score / len(val_loader)
        
        print(f"   Validation -> Dice: {avg_dice:.4f} | IoU: {avg_iou:.4f}")

        if avg_iou > best_iou:
            best_iou = avg_iou
            torch.save(model.state_dict(), os.path.join(SAVE_DIR, MODEL_NAME))
            print(f"   --> 🚀 New Best Model! (IoU: {best_iou:.4f})")

if __name__ == "__main__":
    main()