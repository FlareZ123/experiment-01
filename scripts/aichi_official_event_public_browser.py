"""Single public, anonymous JS-rendered source check for event 981404.

This is provenance-only. It does not certify standings, deck registrations or identity.
"""
from __future__ import annotations

import hashlib
import json
import os
import tempfile
from pathlib import Path
from urllib.parse import urlsplit

from filelock import FileLock
from playwright.sync_api import sync_playwright

URL = "https://players.pokemon-card.com/event/detail/981404/result"
OUT = Path(__file__).resolve().parents[1] / "results/aichi-2026/official-event-981404-public-browser"


def atomic_write(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(dir=path.parent, mode="wb", delete=False) as stream:
            try:
                stream.write(content)
                stream.flush()
                os.fsync(stream.fileno())
                temporary = stream.name
            except BaseException:
                Path(stream.name).unlink(missing_ok=True)
                raise
        os.replace(temporary, path)


def deck_code(url: str) -> str | None:
    parts = urlsplit(url)
    if parts.scheme != "https" or parts.hostname != "www.pokemon-card.com":
        return None
    marker = "/deck/confirm.html/deckID/"
    if not parts.path.startswith(marker):
        return None
    value = parts.path[len(marker):]
    if not 5 <= len(value) <= 40 or not all(c.isalnum() or c == "-" for c in value):
        return None
    return value


def summarize(body: str, links: list[dict]) -> dict:
    decks = sorted({code for link in links
                    if (code := deck_code(link.get("href", ""))) is not None})
    recognized = [link for link in links
                  if link.get("href", "").startswith(URL) or deck_code(link.get("href", ""))]
    return {
        "body_preview": body[:7000],
        "body_length": len(body),
        "links_examined": len(links),
        "deck_codes_exposed_publicly": decks[:50],
        "relevant_public_links": recognized[:50],
        "registration_verified": False,
        "entry_attributions_verified": False,
        "benchmarked_original_60s_added": 0,
        "status": "unverified-public-js-render-probe"
    }


def run() -> dict:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            page = browser.new_page(locale="ja-JP",
                                    viewport={"width": 1365, "height": 900})
            response = page.goto(URL, wait_until="domcontentloaded", timeout=40_000)
            page.wait_for_timeout(8000)
            title = page.title()
            body = page.locator("body").inner_text(timeout=10_000)
            links = page.locator("a").evaluate_all(
                "(nodes) => nodes.map(n => ({text: n.innerText.slice(0, 120), href: n.href}))"
            )
            picture = page.screenshot(full_page=False, timeout=10_000)
            result = {
                "source": URL,
                "resolved_url": page.url,
                "http_status": response.status if response else None,
                "title": title[:300],
                "screenshot_sha256": hashlib.sha256(picture).hexdigest(),
                "browser_family": "Playwright bundled chromium headless",
                "source_scope": "Public anonymous rendered DOM, single event, no authentication",
                **summarize(body, links)
            }
            atomic_write(OUT / "preview.png", picture)
            atomic_write(OUT / "manifest.json",
                         (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
            print(json.dumps({k: v for k, v in result.items() if k != "body_preview"},
                             ensure_ascii=False))
            return result
        finally:
            browser.close()


if __name__ == "__main__":
    run()
