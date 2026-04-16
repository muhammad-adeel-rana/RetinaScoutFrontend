import os
import numpy as np
import pandas as pd
import random

# ================= CONFIGURATION =================
# Inputs (Where your patches are)
PATCHES_IMG_DIR =  r"/mnt/d/Rana Muhammad Adeel/Final Year Project/Final_Year_Project/Hard_Exudates_Segmentation/Processed_Data/Patches/Images"
PATCHES_MASK_DIR = r"/mnt/d/Rana Muhammad Adeel/Final Year Project/Final_Year_Project/Hard_Exudates_Segmentation/Processed_Data/Patches/Masks"

# Split Ratio (0.85 means 85% of patients go to Training, 15% to Validation)
# IDRiD Training has 54 images. 
# 0.85 ratio ≈ 46 Patients for Train, 8 Patients for Validation.
TRAIN_RATIO = 0.85
# =================================================

def create_patient_level_split():
    # 1. Verify Directories
    if not os.path.exists(PATCHES_IMG_DIR):
        print(f"❌ Error: Directory not found: {PATCHES_IMG_DIR}")
        return

    # Get list of .png files (since we switched to PNG)
    all_patches = [f for f in os.listdir(PATCHES_IMG_DIR) if f.endswith('.png')]
    
    if len(all_patches) == 0:
        print("❌ No patches found! Did you run extract_patches.py?")
        return

    print(f"🔍 Found {len(all_patches)} total patches.")

    # 2. Extract Unique Patient IDs to prevent Leakage
    # Filename format: "IDRiD_01_p12.png" -> We extract "IDRiD_01"
    patient_ids = set()
    for patch_name in all_patches:
        # Split by "_p" to separate ID from patch number
        pid = patch_name.split('_p')[0]
        patient_ids.add(pid)
    
    patient_ids = list(patient_ids)
    patient_ids.sort()
    
    print(f"👤 Found {len(patient_ids)} unique patients.")

    # 3. Shuffle PATIENTS (Not patches)
    # This ensures Patient 01 is entirely in Train OR entirely in Val
    random.seed(42) # Fixed seed so your split is always the same
    random.shuffle(patient_ids)

    # 4. Split Patients
    split_idx = int(len(patient_ids) * TRAIN_RATIO)
    train_patients = set(patient_ids[:split_idx])
    val_patients = set(patient_ids[split_idx:])

    print(f"✅ Training Patients: {len(train_patients)} (e.g., {list(train_patients)[:3]}...)")
    print(f"✅ Validation Patients: {len(val_patients)} (e.g., {list(val_patients)[:3]}...)")

    # 5. Assign Patches based on Patient ID
    train_data = []
    val_data = []

    for patch_name in all_patches:
        pid = patch_name.split('_p')[0]
        
        # Construct full paths
        img_path = os.path.join(PATCHES_IMG_DIR, patch_name)
        mask_path = os.path.join(PATCHES_MASK_DIR, patch_name)
        
        # Verify mask exists
        if not os.path.exists(mask_path):
            continue

        if pid in train_patients:
            train_data.append([img_path, mask_path])
        else:
            val_data.append([img_path, mask_path])

    # 6. Save to CSV
    print(f"\n📊 Final Split Stats:")
    print(f"   Train Patches: {len(train_data)}")
    print(f"   Val Patches:   {len(val_data)}")

    # Save without header/index for the Pytorch Dataset loader
    pd.DataFrame(train_data).to_csv("train.csv", index=False, header=False)
    pd.DataFrame(val_data).to_csv("val.csv", index=False, header=False)
    
    print("\n🚀 Success! Created 'train.csv' and 'val.csv'.")
    print("   You can now start training.")

if __name__ == "__main__":
    create_patient_level_split()