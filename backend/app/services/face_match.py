"""
Lightweight face-match mock.
Uses pixel-histogram similarity — no PyTorch / OpenCV needed.
"""
from PIL import Image
import os, math

def _histogram(path: str) -> list[float]:
    img = Image.open(path).convert("RGB").resize((64, 64))
    hist = img.histogram()
    total = sum(hist) or 1
    return [v / total for v in hist]

def _cosine(a: list[float], b: list[float]) -> float:
    dot  = sum(x * y for x, y in zip(a, b))
    na   = math.sqrt(sum(x * x for x in a))
    nb   = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb + 1e-9)

def find_matching_photos(selfie_path: str, photo_paths: list[str], threshold: float = 0.92) -> list[str]:
    if not os.path.exists(selfie_path):
        return []
    ref_hist = _histogram(selfie_path)
    matches  = []
    for p in photo_paths:
        try:
            if _cosine(ref_hist, _histogram(p)) >= threshold:
                matches.append(p)
        except Exception:
            continue
    return matches