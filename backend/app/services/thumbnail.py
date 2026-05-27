from PIL import Image
import os

THUMB_SIZE = (400, 400)

def generate_thumbnail(source_path: str, thumb_path: str) -> str:
    os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
    img = Image.open(source_path)
    img.thumbnail(THUMB_SIZE, Image.LANCZOS)
    img = img.convert("RGB")
    img.save(thumb_path, "JPEG", quality=85)
    return thumb_path