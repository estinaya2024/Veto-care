import sys
import os
from rembg import remove
from PIL import Image

def process_image(input_path, output_path):
    try:
        input_image = Image.open(input_path)
        # Remove background using AI
        output_image = remove(input_image)
        # Save as PNG to preserve transparency
        output_image.save(output_path, "PNG")
        print(f"Success: {output_path}")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python rembg.py <input_path> <output_path>")
        sys.exit(1)
    process_image(sys.argv[1], sys.argv[2])
