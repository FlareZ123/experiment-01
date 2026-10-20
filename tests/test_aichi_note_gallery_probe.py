"""Falsifiable synthetic DOM tests for article-body, rank-unassigned media extraction."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("gallery_probe", Path(__file__).resolve().parents[1] / "scripts" / "aichi_note_gallery_probe.py")
assert SPEC and SPEC.loader
probe = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(probe)


class GalleryProbeTests(unittest.TestCase):
    def test_isolates_top32_and_deduplicates_without_attributing_rank(self):
        html = '''<h2>目次</h2><p>TOP32</p><p>レジドラゴ</p><img src="/fake.png">
        <h2>トップカット</h2><p>優勝</p><img src="/champ.png">
        <p>TOP32 レジドラゴ</p><img src="https://example.org/a.png" alt="deck A">
        <p>レジドラゴ</p><img data-src="https://example.org/a.png">
        <img src="https://example.org/b.png" />
        <p>テツノイバラ単</p><img src="https://example.org/no.png">
        <p>エレキレイン</p><a href="https://example.org/source"><img src="https://example.org/c.png"></a>
        <h2>レジドラゴ(メガトンブロアー)</h2><img src="https://example.org/after.png">'''
        x = probe.extract_gallery(html)
        self.assertEqual(x["matched_article_headings"], 1)
        self.assertTrue(x["top32_heading_found"])
        self.assertEqual([x["url"] for x in x["images_by_unassigned_archetype"]["Regidrago"]],
                         ["https://example.org/a.png", "https://example.org/b.png"])
        self.assertEqual(x["images_by_unassigned_archetype"]["Raichu Electrode Combo"][0]["linked_source"],
                         "https://example.org/source")
        self.assertTrue(all("rank" not in image for group in x["images_by_unassigned_archetype"].values() for image in group))

    def test_missing_article_heading_returns_no_assigned_media(self):
        result = probe.extract_gallery('<p>TOP32</p><p>レジドラゴ</p><img src="/x.png">')
        self.assertFalse(result["top32_heading_found"])
        self.assertEqual(result["images_by_unassigned_archetype"]["Regidrago"], [])


if __name__ == "__main__":
    unittest.main()
