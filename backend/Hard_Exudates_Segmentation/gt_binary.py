#!/usr/bin/env python3
import os
import sys
from PIL import Image

# ================= CONFIGURATION =================
# 1. INPUT: The exact folder from your path
INPUT_FOLDER = r"/mnt/d/Rana Muhammad Adeel/Final Year Project/Segmentation/A. Segmentation/2. All Segmentation Groundtruths/a. Training Set/3. Hard Exudates"

# 2. OUTPUT: Creating a clean 'Processed' folder in your project root
# This will save to: D:\Rana Muhammad Adeel\Final Year Project\Processed_Data\Hard_Exudates_Masks
OUTPUT_FOLDER = r"/mnt/d/Rana Muhammad Adeel/Final Year Project/Final_Year_Project/Hard_Exudates_Segmentation/Processed_Data/Hard_Exudates_Masks"
# =================================================

def process_image(infile, input_dir, output_dir):
    filename, extension = os.path.splitext(infile)
    
    # IDRiD uses .tif, so we explicitly check for it
    if extension.lower() not in ['.tif', '.tiff', '.png', '.jpg']:
        return

    try:
        input_path = os.path.join(input_dir, infile)
        
        # Open the image
        im = Image.open(input_path)
        
        # Convert to Grayscale (L mode)
        gray = im.convert('L')
        
        # BINARIZATION:
        # Values < 50 become 0 (black background)
        # Values >= 50 become 255 (white lesion)
        bw = gray.point(lambda x: 0 if x < 50 else 255, '1')
        
        # Save as JPG (Required by the old repo logic)
        # We also remove the "_EX" suffix if you want cleaner names, 
        # but for now, we keep it to match the original filenames.
        outfile = filename + ".png"
        save_path = os.path.join(output_dir, outfile)
        
        bw.save(save_path, "PNG", quality=100)
        print(f"Converted: {infile} -> {outfile}")
        
    except IOError as e:
        print(f"Error processing {infile}: {e}")

if __name__ == "__main__":
    # 1. Verify Input Path exists
    if not os.path.exists(INPUT_FOLDER):
        print("ERROR: Input path not found.")
        print(f"Checked: {INPUT_FOLDER}")
        sys.exit(1)

    # 2. Create Output Path if missing
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
        print(f"Created output folder: {OUTPUT_FOLDER}")

    print("Starting processing...")
    
    # 3. Process all files in the directory
    files = os.listdir(INPUT_FOLDER)
    count = 0
    for file in files:
        process_image(file, INPUT_FOLDER, OUTPUT_FOLDER)
        count += 1
        
    print(f"\nDone! Processed {count} images.")
    print(f"Check your masks here: {OUTPUT_FOLDER}")