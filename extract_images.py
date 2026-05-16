import fitz
from pathlib import Path

root = Path(r"c:\Users\mikha\Desktop\Helmet Cleaning")
out = root / "public" / "images"
out.mkdir(parents=True, exist_ok=True)

for pdf in root.glob("*.pdf"):
    doc = fitz.open(pdf)
    stem = pdf.stem.replace(" ", "-").lower()
    for pno in range(doc.page_count):
        pix = doc[pno].get_pixmap(matrix=fitz.Matrix(2, 2))
        pix.save(str(out / f"{stem}-page{pno}.png"))
        for idx, img in enumerate(doc[pno].get_images(full=True)):
            base = doc.extract_image(img[0])
            ext = base["ext"]
            fn = f"{stem}-p{pno}-img{idx}.{ext}"
            (out / fn).write_bytes(base["image"])
    doc.close()

print("Extracted:", len(list(out.iterdir())), "files")
