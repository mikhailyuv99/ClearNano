# -*- coding: utf-8 -*-
from pathlib import Path

path = Path(__file__).parent / "index.html"
text = path.read_text(encoding="utf-8", errors="replace")

bad_end = "</" + "mo" + "tion>"
bad_start = "<" + "mo" + "tion" + " "
good_end = "</" + "di" + "v>"
good_start = "<" + "di" + "v" + " "

text = text.replace(bad_end, good_end)
text = text.replace(bad_start, good_start)
text = text.replace("\ufffd", "\u2014")

path.write_text(text, encoding="utf-8")
print("bad_end left:", text.count(bad_end))
print("bad_start left:", text.count(bad_start))
