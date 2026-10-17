"""Capture the published New Moon official Japanese deck-viewer identity if retrievable.

The deck code originates in the May 13, 2026 first-person tournament report.
This capture is a research artifact, not an assertion that official registration
is retained, that the code is currently served, or that cards are legal.
"""

import hashlib
import json
import os
import re
import tempfile
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from filelock import FileLock

DECK_CODE = "GxxDYx-a4rD4W-a8xYxc"
URL = f"https://www.pokemon-card.com/deck/confirm.html/deckID/{DECK_CODE}/"


def capture() -> dict:
    """Download once, retaining response provenance and source-language rows."""
    result = {
        "source": "Japanese official saved-deck viewer",
        "source_deck_code": DECK_CODE,
        "source_url": URL,
        "retrievable": False,
        "http_status": None,
        "error": None,
        "sha256": None,
        "candidate_rows": [],
    }
    html = ""
    try:
        response = requests.get(
            URL,
            timeout=25,
            headers={"User-Agent": "Mozilla/5.0 (compatible; PokemonExpandedResearch/1.0)"},
        )
        result["http_status"] = response.status_code
        response.raise_for_status()
        html = response.text
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(" ", strip=True)
        visible_strings = list(soup.stripped_strings)
        result["visible_string_count"] = len(visible_strings)
        result["visible_strings"] = visible_strings[:500]
        result["sha256"] = hashlib.sha256(response.content).hexdigest()
        result["title"] = soup.title.get_text(" ", strip=True) if soup.title else None
        result["text_excerpt"] = text[:1000]
        result["retrievable"] = DECK_CODE in text and (
            "60枚デッキ" in text or "60枚" in text
        )
        for row in soup.select("tr"):
            cells = [td.get_text(" ", strip=True) for td in row.select("th, td")]
            if cells and (re.search(r"\d+[/／]\d+", " ".join(cells)) or
                          any(re.search(r"(?:BW|XY|SM|SV|SWSH|M)[\w-]*", c) for c in cells)):
                result["candidate_rows"].append(cells)
    except requests.RequestException as exc:
        result["error"] = f"{type(exc).__name__}: {exc}"

    path = Path("results/als/deck-code-retrieval")
    path.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path / "capture.lock"), timeout=30):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path, prefix="new-moon-",
            suffix=".tmp", delete=False
        ) as handle:
            temp_path = Path(handle.name)
            json.dump(result, handle, indent=2, ensure_ascii=False)
            handle.write("\n")
        os.replace(temp_path, path / "new-moon-official-viewer.json")
        if html:
            with tempfile.NamedTemporaryFile(
                mode="w", encoding="utf-8", dir=path, prefix="new-moon-html-",
                suffix=".tmp", delete=False
            ) as handle:
                temp_path = Path(handle.name)
                handle.write(html)
            os.replace(temp_path, path / "new-moon-official-viewer.html")

    return result


if __name__ == "__main__":
    report = capture()
    print(json.dumps({
        "source_url": report["source_url"],
        "http_status": report["http_status"],
        "retrievable": report["retrievable"],
        "sha256": report["sha256"],
        "candidate_rows": len(report["candidate_rows"]),
        "visible_strings": report.get("visible_strings", [])[:260],
        "error": report["error"],
    }, ensure_ascii=False))
