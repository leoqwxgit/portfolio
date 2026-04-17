#!/usr/bin/env python3
import os
from PIL import Image

def compress_image(input_path, output_path, max_width=1200, quality=85):
    """Compress an image and save it to the output path"""
    try:
        with Image.open(input_path) as img:
            # Calculate new dimensions while maintaining aspect ratio
            width, height = img.size
            if width > max_width:
                ratio = max_width / width
                new_height = int(height * ratio)
                img = img.resize((max_width, new_height), Image.LANCZOS)
            
            # Convert RGBA to RGB if necessary
            if img.mode == 'RGBA':
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            
            # Get the correct file format
            ext = os.path.splitext(output_path)[1].lower()
            format = 'JPEG' if ext in ['.jpg', '.jpeg'] else None
            
            # Save with compression
            img.save(output_path, format=format, optimize=True, quality=quality)
            print(f"Compressed: {os.path.basename(input_path)} -> {os.path.basename(output_path)}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

def main():
    """Main function to compress all images"""
    input_dir = "assets/images"
    output_dir = "assets/images/optimized"
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Get all image files
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    image_files = []
    
    for filename in os.listdir(input_dir):
        ext = os.path.splitext(filename)[1].lower()
        if ext in image_extensions:
            image_files.append(filename)
    
    # Compress each image
    for filename in image_files:
        input_path = os.path.join(input_dir, filename)
        output_path = os.path.join(output_dir, filename)
        compress_image(input_path, output_path)
    
    print(f"\nCompression completed. {len(image_files)} images processed.")

if __name__ == "__main__":
    main()