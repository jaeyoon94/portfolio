"""Align intact full-body walk poses to the idle sprites. Never changes image pixels.

Each walk cell is drawn as one complete image with a single *uniform* scale
(no separate x/y stretch, no slicing). Per character and direction the scale is
shared by both poses so the body never changes size between steps, and it is
chosen between the idle head width and idle body height so neither the big
chibi head nor the overall height visibly jumps when walking starts or stops.
Feet rest on the same ground line as the idle sprite and the head stays on the
idle head's centre line, so a wide stride does not push the head sideways.
"""
from PIL import Image
import json
from pathlib import Path

root = Path(__file__).parent
IDLE_CELL, IDLE_DRAW, IDLE_X, IDLE_Y = 256, 128, -64, -124  # matches sprite() in office.js
k_idle = IDLE_DRAW / IDLE_CELL


def mask(img, box):
    return img.getchannel('A').crop(box).point(lambda a: 255 if a > 128 else 0)


def measure(m):
    b = m.getbbox()
    assert b, 'empty sprite cell'
    head = m.crop((b[0], b[1], b[2], b[1] + int((b[3] - b[1]) * .45))).getbbox()
    return {'bottom': b[3], 'height': b[3] - b[1],
            'headW': head[2] - head[0], 'headX': b[0] + (head[0] + head[2]) / 2}


idle = Image.open(root / 'dist/assets/starjourney-characters-v4.png')
walk = Image.open(root / 'dist/assets/starjourney-walk-v1.png')
cols, rows = 6, 8
frames = [[None] * cols for _ in range(rows)]
for char in range(cols):
    for direction in range(4):
        ref = measure(mask(idle, (char * IDLE_CELL, direction * IDLE_CELL, (char + 1) * IDLE_CELL, (direction + 1) * IDLE_CELL)))
        cells = []
        for pose in range(2):
            r = direction * 2 + pose
            box = (round(char * walk.width / cols), round(r * walk.height / rows),
                   round((char + 1) * walk.width / cols), round((r + 1) * walk.height / rows))
            cells.append((r, box, measure(mask(walk, box))))
        head_ratio = sum(ref['headW'] / c[2]['headW'] for c in cells) / 2
        height_ratio = sum(ref['height'] / c[2]['height'] for c in cells) / 2
        k = (head_ratio * height_ratio) ** .5 * k_idle  # one uniform scale for both poses
        ground = IDLE_Y + ref['bottom'] * k_idle
        head_x = IDLE_X + ref['headX'] * k_idle
        for r, box, m in cells:
            w, h = box[2] - box[0], box[3] - box[1]
            frames[r][char] = {'src': [box[0], box[1], w, h],
                               'dst': [round(head_x - m['headX'] * k, 2), round(ground - m['bottom'] * k, 2),
                                       round(w * k, 2), round(h * k, 2)]}

data = {'columns': cols, 'rows': rows, 'poses': 2, 'width': walk.width, 'height': walk.height, 'frames': frames}
(root / 'dist/walk-atlas.js').write_text(
    'const WalkingAtlas=' + json.dumps(data, separators=(',', ':')) +
    ";\nif(typeof module!=='undefined')module.exports=WalkingAtlas;\n", encoding='utf-8')
print('Aligned 48 intact walk frames: uniform scale per character/direction, idle ground line and head centre.')
