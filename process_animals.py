from rembg import remove
from PIL import Image
import os

def process_images():
    input_dir = 'src/assets/images'
    images = ['bunny.jpg', 'cat.jpg', 'cow.jpg', 'duck.jpg']
    
    for img_name in images:
        input_path = os.path.join(input_dir, img_name)
        output_name = img_name.replace('.jpg', '.png')
        output_path = os.path.join(input_dir, output_name)
        
        if os.path.exists(input_path):
            print(f"Processing {img_name}...")
            with open(input_path, 'rb') as i:
                input_data = i.read()
                output_data = remove(input_data)
                with open(output_path, 'wb') as o:
                    o.write(output_data)
            print(f"Saved {output_name}")
        else:
            print(f"File {input_path} not found")

if __name__ == "__main__":
    process_images()
