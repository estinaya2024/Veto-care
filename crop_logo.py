from PIL import Image
import numpy as np

img = Image.open('src/assets/images/logo.png').convert('RGBA')
arr = np.array(img)

# Find non-transparent pixels
alpha = arr[:,:,3]
y_coords, x_coords = np.where(alpha > 0)

if len(y_coords) > 0:
    min_y = np.min(y_coords)
    max_y = np.max(y_coords)
    # The text is usually at the bottom. We can look for a gap in the vertical profile
    # to separate the icon from the text.
    row_alphas = np.sum(alpha > 0, axis=1)
    
    # We expected a gap (row_alphas == 0) between the icon and text,
    # or at least a significant drop.
    # Start looking from the middle downwards
    middle = (min_y + max_y) // 2
    gap_y = None
    
    for y in range(middle, max_y):
        if row_alphas[y] < 5: # Threshold for gap
            gap_y = y
            break
            
    if gap_y is not None:
        crop_box = (0, 0, img.width, gap_y)
        cropped_img = img.crop(crop_box)
        cropped_img.save('src/assets/images/logo-icon-only.png')
        print(f"Cropped at gap {gap_y}")
    else:
        # If no gap found, just crop the bottom 25%
        crop_box = (0, 0, img.width, int(img.height * 0.75))
        cropped_img = img.crop(crop_box)
        cropped_img.save('src/assets/images/logo-icon-only.png')
        print("No clear gap found. Cropped bottom 25%.")
else:
    print("Empty image?")
