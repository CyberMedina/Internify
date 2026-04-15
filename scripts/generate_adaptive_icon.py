"""
Genera el foreground del adaptive icon de Android a partir de InternifyV4NoLogo.png:
  1. Convierte el artwork a blanco puro (preservando anti-aliasing via alpha)
  2. Recorta bordes transparentes
  3. Centra el logo al 58% del canvas en 1024x1024 (padding seguro para Android)
  4. Guarda sobre el mismo archivo

Spec Android Adaptive Icon:
  - Canvas total: 108dp (Expo usa 1024px de fuente)
  - Safe zone visible: 72dp = 66.7% del canvas
  - Logo al 58% => queda al 87% de la safe zone => bien proporcionado con breathing room
"""

import os
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_PATH  = os.path.join(BASE_DIR, "src", "assets", "images", "InternifyV4NoLogo.png")
OUTPUT_PATH = INPUT_PATH  # sobreescribir

CANVAS_SIZE = 1024
LOGO_RATIO  = 0.58   # logo ocupa 58% del canvas total


def process():
    img = Image.open(INPUT_PATH).convert("RGBA")
    print(f"Original: {img.size}, mode={img.mode}")

    # 1. Convertir artwork a blanco puro, preservando alpha (anti-aliasing)
    r, g, b, a = img.split()
    white_img = Image.merge("RGBA", (
        Image.new("L", img.size, 255),  # R = 255
        Image.new("L", img.size, 255),  # G = 255
        Image.new("L", img.size, 255),  # B = 255
        a,                               # A = original
    ))

    # 2. Recortar bordes transparentes
    bbox = white_img.getbbox()
    if bbox:
        white_img = white_img.crop(bbox)
        print(f"Recortado a bbox: {bbox} -> {white_img.size}")

    # 3. Escalar logo al LOGO_RATIO del canvas manteniendo aspect ratio
    logo_max = int(CANVAS_SIZE * LOGO_RATIO)
    white_img.thumbnail((logo_max, logo_max), Image.LANCZOS)
    print(f"Logo escalado: {white_img.size}")

    # 4. Centrar en canvas transparente
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    x = (CANVAS_SIZE - white_img.width)  // 2
    y = (CANVAS_SIZE - white_img.height) // 2
    canvas.paste(white_img, (x, y), white_img)
    print(f"Pegado en ({x}, {y}) sobre canvas {CANVAS_SIZE}x{CANVAS_SIZE}")

    # 5. Guardar
    canvas.save(OUTPUT_PATH, "PNG")
    print(f"Guardado: {OUTPUT_PATH}")


if __name__ == "__main__":
    process()
