import random
from PIL import Image

TAG_POOL = {
    "outdoor":   ["nature", "outdoor", "sky", "landscape", "greenery"],
    "crowd":     ["crowd", "people", "group", "event", "gathering"],
    "sport":     ["sports", "action", "competition", "athlete", "energy"],
    "food":      ["food", "feast", "cuisine", "celebration", "dining"],
    "night":     ["nightlife", "lights", "night", "party", "vivid"],
    "portrait":  ["portrait", "face", "smile", "candid", "person"],
    "cultural":  ["culture", "traditional", "festival", "heritage", "dance"],
    "travel":    ["travel", "architecture", "city", "landmark", "exploration"],
}

BRIGHT_TAGS  = ["vibrant", "colorful", "sunlit", "bright"]
DARK_TAGS    = ["moody", "dramatic", "shadow", "contrast"]
SQUARE_TAGS  = ["square", "balanced", "symmetrical"]
WIDE_TAGS    = ["panoramic", "wide-angle", "landscape-shot"]

def generate_tags(file_path: str) -> list[str]:
    tags = set()
    try:
        img  = Image.open(file_path)
        w, h = img.size

        # aspect ratio hints
        if w > h * 1.5:
            tags.update(random.sample(WIDE_TAGS, 2))
        elif abs(w - h) < 50:
            tags.update(random.sample(SQUARE_TAGS, 1))

        # brightness hint
        grey = img.convert("L")
        avg  = sum(grey.getdata()) / (w * h)
        tags.update(random.sample(BRIGHT_TAGS if avg > 128 else DARK_TAGS, 2))

    except Exception:
        pass

    # always add 3-5 random thematic tags
    category = random.choice(list(TAG_POOL.values()))
    tags.update(random.sample(category, min(3, len(category))))
    extra = random.choice(list(TAG_POOL.values()))
    tags.update(random.sample(extra, 2))

    return list(tags)[:8]