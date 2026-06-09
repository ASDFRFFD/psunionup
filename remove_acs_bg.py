import os
from PIL import Image
from rembg import remove

src_path = r"C:\Users\Dashdoi\.gemini\antigravity-ide\brain\3dd7b2e2-37a9-4029-81e3-2d968028e9b7\media__1780224070492.png"
dest_path = r"d:\CODING\WEBPAGE\secretary_sachiv.png"

input_image = Image.open(src_path)
output_image = remove(input_image)

# Resize to fit tribute card
max_height = 320
if output_image.height > max_height:
    aspect_ratio = output_image.width / output_image.height
    new_width = int(max_height * aspect_ratio)
    output_image = output_image.resize((new_width, max_height), Image.Resampling.LANCZOS)

output_image.save(dest_path, "PNG", optimize=True)
print(f"Done! Size: {output_image.size}, File: {os.path.getsize(dest_path)} bytes")
