from PIL import Image

def crop_right_half(img_path, out_path, crop_percent=0.4):
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    
    # Crop the right %
    crop_w = int(w * (1 - crop_percent))
    cropped = img.crop((0, 0, crop_w, h))
    cropped.save(out_path)

def crop_left_half(img_path, out_path, crop_percent=0.4):
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    
    # Crop the left %
    crop_w = int(w * crop_percent)
    cropped = img.crop((crop_w, 0, w, h))
    cropped.save(out_path)

try:
    # illustration-medical-new.png: vet is likely on left, so crop right side (cat)
    crop_right_half('src/assets/images/illustration-medical-new.png', 'src/assets/images/illustration-medical-new.png', crop_percent=0.4)
    # illustration-medical-2.png: mirrored! so vet is on right, crop left side (cat)
    crop_left_half('src/assets/images/illustration-medical-2.png', 'src/assets/images/illustration-medical-2.png', crop_percent=0.4)
    print("Cropped successfully to remove the cats.")
except Exception as e:
    print("Error:", e)
