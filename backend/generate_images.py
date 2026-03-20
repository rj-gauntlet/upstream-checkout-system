"""Generate professional product images for Upstream Literacy e-commerce store."""

import math
import os

from PIL import Image, ImageDraw, ImageFont

# Brand colors
TEAL_DARK = (23, 58, 63)       # #173A3F - nav bar
TEAL_MID = (30, 80, 88)        # #1E5058
TEAL_LIGHT = (42, 120, 130)    # #2A7882
GOLD = (226, 183, 74)          # #E2B74A - accent
WHITE = (255, 255, 255)
OFF_WHITE = (240, 248, 248)    # light teal tint
CREAM = (252, 248, 240)

# Category color schemes
CATEGORY_COLORS = {
    "Curriculum Materials": {
        "bg_top": (20, 55, 65),
        "bg_bottom": (35, 95, 105),
        "accent": GOLD,
        "icon_color": (226, 183, 74),
    },
    "Assessment Tools": {
        "bg_top": (45, 25, 70),
        "bg_bottom": (75, 45, 110),
        "accent": (180, 140, 255),
        "icon_color": (200, 170, 255),
    },
    "Professional Development": {
        "bg_top": (25, 60, 45),
        "bg_bottom": (40, 100, 75),
        "accent": (100, 220, 160),
        "icon_color": (130, 235, 180),
    },
    "Classroom Resources": {
        "bg_top": (60, 35, 20),
        "bg_bottom": (110, 65, 35),
        "accent": (255, 180, 100),
        "icon_color": (255, 200, 130),
    },
}

# Product definitions with icons (Unicode symbols)
PRODUCTS = [
    # Curriculum Materials
    {"sku": "UL-CM-001", "name": "Structured Literacy\nFoundations K-2", "category": "Curriculum Materials", "icon": "ABC", "subtitle": "Complete Bundle"},
    {"sku": "UL-CM-002", "name": "Advanced Phonics\nIntervention", "category": "Curriculum Materials", "icon": "Ph", "subtitle": "Grades 3-5"},
    {"sku": "UL-CM-003", "name": "Writing Workshop\nComplete Guide", "category": "Curriculum Materials", "icon": "Wr", "subtitle": "Grades 3-8"},
    {"sku": "UL-CM-004", "name": "Morphology Matters\nVocabulary", "category": "Curriculum Materials", "icon": "Mx", "subtitle": "Grades 4-8"},
    # Assessment Tools
    {"sku": "UL-AT-001", "name": "Diagnostic Reading\nAssessment Kit", "category": "Assessment Tools", "icon": "Dx", "subtitle": "Complete Kit"},
    {"sku": "UL-AT-002", "name": "Progress Monitoring\nProbes Pack", "category": "Assessment Tools", "icon": "PM", "subtitle": "36 Probes"},
    {"sku": "UL-AT-003", "name": "Spelling Inventory\n& Analysis Tool", "category": "Assessment Tools", "icon": "Sp", "subtitle": "Developmental"},
    # Professional Development
    {"sku": "UL-PD-001", "name": "Science of Reading\nCertification", "category": "Professional Development", "icon": "SoR", "subtitle": "40-Hour Course"},
    {"sku": "UL-PD-002", "name": "Dyslexia Awareness\nWorkshop Series", "category": "Professional Development", "icon": "DA", "subtitle": "4-Part Series"},
    {"sku": "UL-PD-003", "name": "Literacy Coaching\nToolkit", "category": "Professional Development", "icon": "LC", "subtitle": "For Coaches"},
    # Classroom Resources
    {"sku": "UL-CR-001", "name": "Decodable Readers\nLibrary Set", "category": "Classroom Resources", "icon": "60", "subtitle": "60 Readers"},
    {"sku": "UL-CR-002", "name": "Phoneme-Grapheme\nMapping Cards", "category": "Classroom Resources", "icon": "PG", "subtitle": "44 Phonemes"},
    {"sku": "UL-CR-003", "name": "Syllable Division\nStrategy Posters", "category": "Classroom Resources", "icon": "Sy", "subtitle": "8 Posters"},
    {"sku": "UL-CR-004", "name": "Word Study\nNotebook Kit", "category": "Classroom Resources", "icon": "WS", "subtitle": "Pack of 30"},
    {"sku": "UL-CR-005", "name": "Fluency Practice\nPartner Reads", "category": "Classroom Resources", "icon": "Fl", "subtitle": "40 Passages"},
]

IMG_WIDTH = 800
IMG_HEIGHT = 800


def lerp_color(c1, c2, t):
    """Linear interpolation between two colors."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def draw_gradient(draw, width, height, color_top, color_bottom):
    """Draw a vertical gradient."""
    for y in range(height):
        t = y / height
        color = lerp_color(color_top, color_bottom, t)
        draw.line([(0, y), (width, y)], fill=color)


def draw_circle_icon(draw, cx, cy, radius, color, text, font):
    """Draw a circular icon with text."""
    # Outer glow
    for i in range(3):
        r = radius + (3 - i) * 4
        glow_color = (*color[:3], 30 + i * 15)
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=None,
            outline=(*color, 60),
            width=2,
        )

    # Main circle - semi-transparent
    draw.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        fill=(*color[:3],),
        outline=None,
    )

    # Inner circle
    inner_r = radius - 8
    draw.ellipse(
        [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
        fill=None,
        outline=WHITE,
        width=3,
    )

    # Icon text
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((cx - tw // 2, cy - th // 2 - 4), text, fill=WHITE, font=font)


def draw_decorative_dots(draw, width, height, color):
    """Draw subtle decorative dot pattern."""
    dot_color = (*color[:3], 40)
    spacing = 40
    for x in range(0, width, spacing):
        for y in range(0, height, spacing):
            if (x // spacing + y // spacing) % 3 == 0:
                draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=dot_color)


def draw_wave(draw, y_start, width, amplitude, color, thickness=3):
    """Draw a decorative wave line."""
    points = []
    for x in range(0, width + 1, 2):
        y = y_start + amplitude * math.sin(x * math.pi / 120)
        points.append((x, y))

    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=color, width=thickness)


def generate_product_image(product, output_dir):
    """Generate a single product image."""
    colors = CATEGORY_COLORS[product["category"]]

    img = Image.new("RGB", (IMG_WIDTH, IMG_HEIGHT))
    draw = ImageDraw.Draw(img)

    # Background gradient
    draw_gradient(draw, IMG_WIDTH, IMG_HEIGHT, colors["bg_top"], colors["bg_bottom"])

    # Subtle dot pattern
    draw_decorative_dots(draw, IMG_WIDTH, IMG_HEIGHT, colors["accent"])

    # Decorative wave at top
    draw_wave(draw, 60, IMG_WIDTH, 15, (*colors["accent"], 80), 2)

    # Top banner - category label
    try:
        font_cat = ImageFont.truetype("arial.ttf", 22)
        font_title = ImageFont.truetype("arialbd.ttf", 44)
        font_subtitle = ImageFont.truetype("arial.ttf", 26)
        font_icon = ImageFont.truetype("arialbd.ttf", 52)
        font_brand = ImageFont.truetype("arialbd.ttf", 18)
        font_sku = ImageFont.truetype("arial.ttf", 16)
    except OSError:
        font_cat = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()
        font_icon = ImageFont.load_default()
        font_brand = ImageFont.load_default()
        font_sku = ImageFont.load_default()

    # Category pill at top
    cat_text = product["category"].upper()
    cat_bbox = draw.textbbox((0, 0), cat_text, font=font_cat)
    cat_w = cat_bbox[2] - cat_bbox[0]
    pill_x = (IMG_WIDTH - cat_w) // 2 - 20
    pill_y = 100
    draw.rounded_rectangle(
        [pill_x, pill_y, pill_x + cat_w + 40, pill_y + 40],
        radius=20,
        fill=(*colors["accent"], 180),
    )
    draw.text(
        ((IMG_WIDTH - cat_w) // 2, pill_y + 8),
        cat_text,
        fill=WHITE,
        font=font_cat,
    )

    # Main icon circle
    draw_circle_icon(
        draw, IMG_WIDTH // 2, 310, 100, colors["accent"], product["icon"], font_icon
    )

    # Decorative wave below icon
    draw_wave(draw, 440, IMG_WIDTH, 10, (*colors["accent"], 60), 2)

    # Product title
    title_lines = product["name"].split("\n")
    y_pos = 480
    for line in title_lines:
        bbox = draw.textbbox((0, 0), line, font=font_title)
        tw = bbox[2] - bbox[0]
        draw.text(
            ((IMG_WIDTH - tw) // 2, y_pos),
            line,
            fill=WHITE,
            font=font_title,
        )
        y_pos += 56

    # Subtitle
    sub = product["subtitle"]
    sub_bbox = draw.textbbox((0, 0), sub, font=font_subtitle)
    sub_w = sub_bbox[2] - sub_bbox[0]
    draw.text(
        ((IMG_WIDTH - sub_w) // 2, y_pos + 20),
        sub,
        fill=colors["accent"],
        font=font_subtitle,
    )

    # Bottom bar
    draw.rectangle(
        [0, IMG_HEIGHT - 70, IMG_WIDTH, IMG_HEIGHT],
        fill=(*lerp_color(colors["bg_top"], (0, 0, 0), 0.3),),
    )

    # Brand name bottom-left
    draw.text((30, IMG_HEIGHT - 50), "UPSTREAM LITERACY", fill=colors["accent"], font=font_brand)

    # SKU bottom-right
    sku_bbox = draw.textbbox((0, 0), product["sku"], font=font_sku)
    sku_w = sku_bbox[2] - sku_bbox[0]
    draw.text(
        (IMG_WIDTH - sku_w - 30, IMG_HEIGHT - 48),
        product["sku"],
        fill=(*WHITE[:3],),
        font=font_sku,
    )

    # Accent line above bottom bar
    draw.line(
        [(40, IMG_HEIGHT - 72), (IMG_WIDTH - 40, IMG_HEIGHT - 72)],
        fill=colors["accent"],
        width=2,
    )

    # Save
    filename = f"{product['sku'].lower().replace('-', '_')}.jpg"
    filepath = os.path.join(output_dir, filename)
    img.save(filepath, "JPEG", quality=92)
    print(f"  Generated: {filename}")
    return filename


def main():
    output_dir = os.path.join(os.path.dirname(__file__), "media", "products")
    os.makedirs(output_dir, exist_ok=True)

    print(f"Generating {len(PRODUCTS)} product images...")
    for product in PRODUCTS:
        generate_product_image(product, output_dir)
    print(f"\nDone! Images saved to {output_dir}")


if __name__ == "__main__":
    main()
