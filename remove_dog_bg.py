import numpy as np
from PIL import Image

def remove_background(img_path, out_path, bg_color, tolerance=15):
    img = Image.open(img_path).convert("RGBA")
    data = np.array(img)
    
    r, c, _ = data.shape
    
    # Extract RGB channels
    R, G, B = data[:,:,0], data[:,:,1], data[:,:,2]
    
    # Create mask for pixels that match background color within tolerance
    mask = (np.abs(R.astype(int) - bg_color[0]) <= tolerance) & \
           (np.abs(G.astype(int) - bg_color[1]) <= tolerance) & \
           (np.abs(B.astype(int) - bg_color[2]) <= tolerance)
    
    # Create an alpha channel based on the mask
    # 0 for background, 255 for foreground
    data[mask, 3] = 0
    
    # Anti-aliasing / slight softening around edges (optional, but good for flat colors)
    # Using simple morphological operations if needed, but a tight tolerance usually works.
    
    Image.fromarray(data).save(out_path)
    print("Background removed from", img_path)

remove_background('src/assets/images/hero_dog.png', 'src/assets/images/hero_dog.png', (193, 204, 222), 25)
