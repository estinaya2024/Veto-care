from PIL import Image
import numpy as np
import sys

def remove_white(image_path, out_path):
    img = Image.open(image_path).convert("RGBA")
    arr = np.array(img)
    
    # Identify "white" pixels (e.g., r,g,b > 240)
    # The pure white background is usually [255, 255, 255] or close.
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    white_mask = (r > 240) & (g > 240) & (b > 240)
    
    # Set alpha channel to 0 for white pixels
    arr[white_mask, 3] = 0
    
    out_img = Image.fromarray(arr)
    out_img.save(out_path)
    print(f"Processed {image_path}")

try:
    remove_white('src/assets/images/illustration-medical-new.png', 'src/assets/images/illustration-medical-new.png')
    remove_white('src/assets/images/illustration-medical-2.png', 'src/assets/images/illustration-medical-2.png')
except Exception as e:
    print("Error:", e)
    sys.exit(1)
