import re
from datetime import datetime
from pathlib import Path

html = Path(r"c:\Users\mikha\Downloads\Telegram Desktop\ChatExport_2026-05-15\messages.html").read_text(encoding="utf-8")
dates = re.findall(r'title="(\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2})', html)
parsed = [datetime.strptime(d, "%d.%m.%Y %H:%M:%S") for d in dates]
oldest = min(parsed)
newest = max(parsed)
print("Oldest:", oldest)
print("Newest:", newest)
for d in sorted(set(dates)):
    print(d)
