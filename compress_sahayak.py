import os
from PIL import Image

src_path = r"d:\CODING\WEBPAGE\panchayat_sahayak.png"
img = Image.open(src_path)

# Resize to max height 400px for web
max_height = 400
if img.height > max_height:
    aspect_ratio = img.width / img.height
    new_width = int(max_height * aspect_ratio)
    img = img.resize((new_width, max_height), Image.Resampling.LANCZOS)

img.save(src_path, "PNG", optimize=True, compress_level=9)
print(f"Compressed! Size: {img.size}, File: {os.path.getsize(src_path)} bytes")
