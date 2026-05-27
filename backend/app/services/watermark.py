from PIL import Image, ImageDraw, ImageFont
from app.core.config import settings
import os

def apply_watermark(input_path: str, output_path: str, club_name: str, event_name: str, user_role: str) -> str:
    img = Image.open(input_path).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    watermark_text = f"{club_name}  |  {event_name}  |  {user_role.upper()}"

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size=max(16, img.width // 40))
    except Exception:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), watermark_text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    margin = 20
    x = img.width - text_w - margin
    y = img.height - text_h - margin

    draw.rectangle([x - 8, y - 4, x + text_w + 8, y + text_h + 4], fill=(0, 0, 0, 120))
    draw.text((x, y), watermark_text, fill=(255, 255, 255, 220), font=font)

    watermarked = Image.alpha_composite(img, overlay).convert("RGB")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    watermarked.save(output_path, "JPEG", quality=90)
    return output_path