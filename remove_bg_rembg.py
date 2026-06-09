import os
from PIL import Image
from rembg import remove

src_path = r"C:\Users\Dashdoi\.gemini\antigravity-ide\brain\3dd7b2e2-37a9-4029-81e3-2d968028e9b7\media__1780224070492.png"
dest_path = r"d:\CODING\WEBPAGE\secretary_sachiv.png"

# Open the image
input_image = Image.open(src_path)

# Remove the background
output_image = remove(input_image)

# Resize to standard height of 320px to keep it compact
max_height = 320
if output_image.height > max_height:
    aspect_ratio = output_image.width / output_image.height
    new_height = max_height
    new_width = int(new_height * aspect_ratio)
    output_image = output_image.resize((new_width, new_height), Image.Resampling.LANCZOS)

# Save optimized transparent PNG
output_image.save(dest_path, "PNG", optimize=True)
print("Background removed successfully using rembg.")
print(f"Original size: {input_image.size}, New size: {output_image.size}")
print(f"Compressed file size: {os.path.getsize(dest_path)} bytes")
