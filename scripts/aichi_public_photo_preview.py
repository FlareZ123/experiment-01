"""Preview an already downloaded public tournament photo in bounded CI logs.

The image is retained as an unverified lead. This diagnostic never converts
pixels into card identities or modifies the source-field manifest.
"""
import base64
import hashlib
import io
import json
import sys
from pathlib import Path

from PIL import Image


def preview(folder: Path, key: str) -> None:
    manifest = json.loads((folder / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["provenanceOnly"] is True
    matching = [row for row in manifest["results"] if row["key"] == key]
    assert len(matching) == 1
    row = matching[0]
    assert row["retrievalStatus"] == "post-resolved"
    assert row["certifiedRanked60"] is False
    photos = [photo for photo in row["photos"] if "file" in photo]
    assert photos, f"No archived public photo for {key}"

    for index, photo in enumerate(photos):
        data = (folder / photo["file"]).read_bytes()
        sha = hashlib.sha256(data).hexdigest()
        assert sha == photo["sha256"], "Photo differs from archived evidence"
        with Image.open(io.BytesIO(data)) as source:
            original_dimensions = source.size
            image = source.convert("RGB")
        image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        image.save(buf, "JPEG", quality=85, optimize=True)
        encoded = base64.b64encode(buf.getvalue()).decode("ascii")
        print(
            f"PRIMARY_PHOTO_META:{key}:{index}:"
            f"{original_dimensions[0]}x{original_dimensions[1]}:"
            f"{image.width}x{image.height}:{sha}:{len(encoded)}"
        )
        for offset in range(0, len(encoded), 3200):
            print(f"PRIMARY_PHOTO_B64:{key}:{index}:{offset // 3200:05d}:"
                  + encoded[offset:offset + 3200])
        print(f"PRIMARY_PHOTO_END:{key}:{index}")


if __name__ == "__main__":
    assert len(sys.argv) == 3, "expected folder and pinned lead key"
    assert sys.argv[2] in {"rank28-replica", "rank25-kume"}
    preview(Path(sys.argv[1]), sys.argv[2])
