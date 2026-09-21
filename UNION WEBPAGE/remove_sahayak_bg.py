import os
from PIL import Image, ImageFilter

src_path = r"C:\Users\Dashdoi\.gemini\antigravity-ide\brain\3dd7b2e2-37a9-4029-81e3-2d968028e9b7\panchayat_sahayak_nobg_1780224388535.png"
dest_path = r"d:\CODING\WEBPAGE\panchayat_sahayak.png"

img = Image.open(src_path)
rgba = img.convert("RGBA")
width, height = rgba.size
pixels = rgba.load()

visited = set()
bg_pixels = set()

# BFS from all four corners — white/near-white background
from collections import deque
queue = deque()
corners = [(0,0),(width-1,0),(0,height-1),(width-1,height-1)]
for c in corners:
    if c not in visited:
        queue.append(c)
        visited.add(c)

while queue:
    x, y = queue.popleft()
    r, g, b, a = pixels[x, y]
    if r > 220 and g > 220 and b > 220:
        bg_pixels.add((x, y))
        for nx, ny in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]:
            if 0 <= nx < width and 0 <= ny < height and (nx,ny) not in visited:
                visited.add((nx,ny))
                queue.append((nx,ny))

# Make background transparent
for x, y in bg_pixels:
    pixels[x, y] = (255, 255, 255, 0)

# Smooth alpha edges
r_ch, g_ch, b_ch, a_ch = rgba.split()
a_ch = a_ch.filter(ImageFilter.BoxBlur(0.8))
rgba.putalpha(a_ch)

rgba.save(dest_path, "PNG", optimize=True)
print(f"Done! Saved to: {dest_path}")
print(f"Size: {rgba.size}, File: {os.path.getsize(dest_path)} bytes")
