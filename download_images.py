import urllib.request
import re
import os

url = 'https://petmania.vamtam.com/'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    images = list(set(re.findall(r'src=[\"\'](https?://[^\"\']+\.(?:png|jpg|jpeg|svg|webp))[\"\']', html)))
    
    os.makedirs('public/theme-images', exist_ok=True)
    print(f"Found {len(images)} images.")
    for img in images:
        try:
            filename = img.split('/')[-1]
            # Handle query params if any
            filename = filename.split('?')[0]
            print(f"Downloading {filename} from {img}...")
            urllib.request.urlretrieve(img, f'public/theme-images/{filename}')
        except Exception as e:
            print(f"Failed to download {img}: {e}")
except Exception as e:
    print(f"Failed to fetch url: {e}")
