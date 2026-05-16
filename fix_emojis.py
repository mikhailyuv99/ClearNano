# -*- coding: utf-8 -*-
import re
from pathlib import Path

p = Path(__file__).parent / "index.html"
t = p.read_text(encoding="utf-8", errors="replace")

problem_icons = ["\U0001f9a0", "\U0001f637", "\U0001f3cb\ufe0f", "\u274c"]
for ic in problem_icons:
    t, _ = re.subn(r'<motion class="icon">\?+</div>', f'<div class="icon">{ic}</motion>', t, count=1)
    t, _ = re.subn(r'<div class="icon">\?+</motion>', f'<div class="icon">{ic}</motion>', t, count=1)

subs = [
    ("360\u2014.", "360\u00b0."),
    ("360\u2014 coverage", "360\u00b0 coverage"),
    ("VR caf\u2014s", "VR cafes"),
    ("<span class=\"emoji\">???</span><h3>Motorbike", "<span class=\"emoji\">\U0001f3cd\ufe0f</span><h3>Motorbike"),
    ("<span class=\"emoji\">??</span><h3>Boxing", "<span class=\"emoji\">\U0001f94a</span><h3>Boxing"),
    ("<span class=\"emoji\">??</span><h3>Sports", "<span class=\"emoji\">\U0001f45f</span><h3>Sports"),
    ("<span class=\"emoji\">??</span><h3>Knee", "<span class=\"emoji\">\U0001f9b5</span><h3>Knee"),
    ("<span class=\"emoji\">??</span><h3>Riding", "<span class=\"emoji\">\U0001f9e4</span><h3>Riding"),
    ("<span class=\"emoji\">??</span><h3>Bicycle", "<span class=\"emoji\">\U0001f6b2</span><h3>Bicycle"),
    ("<span class=\"emoji\">??</span><h3>VR", "<span class=\"emoji\">\U0001f3ae</span><h3>VR"),
    ("<span class=\"emoji\">??</span><h3>Masks", "<span class=\"emoji\">\U0001f637</span><h3>Masks"),
    ("<span class=\"emoji\">??</span><h3>Ice", "<span class=\"emoji\">\u26f8\ufe0f</span><h3>Ice"),
    ("<span class=\"emoji\">???</span><h3>Gym", "<span class=\"emoji\">\U0001f3cb\ufe0f</span><h3>Gym"),
    ("<span class=\"emoji\">??</span><h3>Hard", "<span class=\"emoji\">\U0001f477</span><h3>Hard"),
    ("<span class=\"emoji\">?</span><h3>And more", "<span class=\"emoji\">\u2728</span><h3>And more"),
    ("<h3>??? Parking", "<h3>\U0001f17f\ufe0f Parking"),
    ("<h3>??? Gyms", "<h3>\U0001f3cb\ufe0f Gyms"),
    ("<h3>?? Repair", "<h3>\U0001f527 Repair"),
    ("<h3>?? Malls", "<h3>\U0001f3ec Malls"),
    ('<span class="emoji">??</span><h3>Made', '<span class="emoji">\U0001f3ed</span><h3>Made'),
    ('<span class="emoji">????</span><h3>US', '<span class="emoji">\U0001f1fa\U0001f1f8</span><h3>US'),
    ('<span class="emoji">??</span><h3>Zero', '<span class="emoji">\U0001f4b0</span><h3>Zero'),
    ('<span class="emoji">??</span><h3>IoT', '<span class="emoji">\U0001f4ca</span><h3>IoT'),
    ('<span class="emoji">??</span><h3>Transparent', '<span class="emoji">\U0001f91d</span><h3>Transparent'),
    ('<span class="emoji">??</span><h3>Growing', '<span class="emoji">\U0001f680</span><h3>Growing'),
    ("\ufffd", "\u2014"),
]
for a, b in subs:
    t = t.replace(a, b)

p.write_text(t, encoding="utf-8")
print("ok")
