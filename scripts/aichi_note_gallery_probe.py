"""Read-only provenance probe for the May 2026 Aichi Top-32 image gallery.

Image presence does not establish a complete 60-card list or a participant match.
"""
from __future__ import annotations

import hashlib
import json
import os
import tempfile
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, Tag
from filelock import FileLock

SOURCE = "https://note.com/nayuta_poke/n/n7e3d0552090b"
SUBGROUPS = {"レジドラゴ": "Regidrago", "エレキレイン": "Raichu Electrode Combo"}


def _asset(tag: Tag) -> str | None:
    for key in ("data-original", "data-src", "src"):
        value = tag.get(key)
        if isinstance(value, str) and value and not value.startswith("data:"):
            return urljoin(SOURCE, value)
    return None


def extract_gallery(html: str) -> dict:
    """Extract candidate URLs only between literal headings in the article body."""
    soup = BeautifulSoup(html, "html.parser")
    headings = [tag for tag in soup.find_all("h2") if tag.get_text(" ", strip=True) == "トップカット"]
    gallery: dict[str, list[dict]] = {name: [] for name in SUBGROUPS.values()}
    state = {"top32": False, "group": None}
    if len(headings) == 1:
        for element in headings[0].next_elements:
            if not isinstance(element, Tag):
                continue
            if element.name == "h2":
                break
            if element.name in ("p", "h3", "h4", "strong"):
                heading = element.get_text(" ", strip=True)
                if heading == "TOP32" or heading.startswith("TOP32 "):
                    state.update(top32=True, group=None)
                    heading = heading.removeprefix("TOP32").strip()
                if state["top32"] and heading in SUBGROUPS:
                    state["group"] = SUBGROUPS[heading]
                elif state["top32"] and heading in (
                    "テツノイバラ単", "アブソルダスト", "ボムチリーン",
                    "リーリエのピッピ", "三神ライコ", "メロエッタワンキル",
                ):
                    state["group"] = None
            if element.name != "img" or state["group"] is None:
                continue
            url = _asset(element)
            if not url or any(x["url"] == url for x in gallery[state["group"]]):
                continue
            parent_link = element.find_parent("a")
            gallery[state["group"]].append({
                "url": url,
                "alt": element.get("alt") or "",
                "linked_source": urljoin(SOURCE, parent_link["href"])
                if parent_link and parent_link.has_attr("href") else None,
            })
    return {
        "source": SOURCE,
        "html_sha256": hashlib.sha256(html.encode("utf-8")).hexdigest(),
        "matched_article_headings": len(headings),
        "top32_heading_found": state["top32"],
        "images_by_unassigned_archetype": gallery,
        "status": "unassigned-gallery-image-leads-only",
        "source_registration_policy": (
            "Never associate an image with ranks 23/25/28 without independent "
            "player identity, complete 60-card transcription and verification."
        ),
    }


def atomic_write(path: Path, contents: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as handle:
            handle.write(contents)
            handle.flush()
            os.fsync(handle.fileno())
            temp_path = handle.name
        os.replace(temp_path, path)


def main() -> None:
    response = requests.get(SOURCE, timeout=30, headers={"User-Agent": "Aichi-public-source-provenance/1.0"})
    response.raise_for_status()
    result = extract_gallery(response.text)
    if not result["top32_heading_found"]:
        soup = BeautifulSoup(response.text, "html.parser")
        heading = next((h for h in soup.find_all("h2") if h.get_text(" ", strip=True) == "トップカット"), None)
        outline = []
        if heading is not None:
            for tag in heading.find_all_next(["h2", "h3", "h4", "p", "figure", "img"], limit=120):
                if tag.name == "h2":
                    break
                outline.append({"tag": tag.name, "text": tag.get_text(" ", strip=True)[:72],
                                "image": bool(tag.find("img") if tag.name == "figure" else tag.name == "img")})
        print(json.dumps({"structural_diagnostic": outline[:60]}, ensure_ascii=False))
    destination = Path("results/aichi-2026/gallery-provenance-probe.json")
    atomic_write(destination, json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"source": SOURCE, "heading_count": result["matched_article_headings"],
                      "top32": result["top32_heading_found"],
                      "counts": {key: len(rows) for key, rows in result["images_by_unassigned_archetype"].items()},
                      "output": str(destination)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
