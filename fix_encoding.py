# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(__file__).parent / "index.html"
text = p.read_text(encoding="utf-8", errors="replace")
dong = "\u20ab"
em = "\u2014"

text = text.replace("\ufffd", em)
if "20,000?" in text:
    text = text.replace("20,000?", "20,000" + dong)
for suffix in ["500,000", "1,200,000", "2,000,000", "3,000,000", "12,000,000",
               "25,000,000", "1,500,000", "4,500,000", "6,000,000", "9,000,000",
               "13,500,000", "18,000,000", "800,000"]:
    text = text.replace(suffix + "?", suffix + dong)

text = text.replace("Turn 1?2 m? into", "Turn 1\u20132 m\u00b2 into")
text = text.replace("m? into passive", "m\u00b2 into passive")
text = text.replace("dry ? ready", "dry " + em + " ready")
text = text.replace("venue ? we", "venue " + em + " we")
text = text.replace("required ? works", "required " + em + " works")
text = text.replace("malls ? Clear", "malls " + em + " Clear")
text = text.replace("ozone ? then", "ozone " + em + " then")
text = text.replace("Clear Nano ? ", "Clear Nano " + em + " ")
text = text.replace("Helmet clean in 5 minutes |", "Helmet clean in 5 minutes \u00b7")

p.write_text(text, encoding="utf-8")
print("Done")
