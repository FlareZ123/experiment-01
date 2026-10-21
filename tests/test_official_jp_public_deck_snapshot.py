"""Pure regressions for published Japanese deck-code snapshot decoding."""
from __future__ import annotations

import unittest

from scripts.official_jp_public_deck_snapshot import parse_viewer

CODE = "4xYGc4-dWhjRd-G8c8GD"
KINDS = (
    "deck_pke", "deck_gds", "deck_tool", "deck_tech",
    "deck_sup", "deck_sta", "deck_ene", "deck_ajs",
)


def fixture(*, energy_count: int = 53, omit: str = "") -> bytes:
    rows = []
    for index, kind in enumerate(KINDS, 1):
        if kind == omit:
            continue
        count = energy_count if kind == "deck_ene" else 1
        if kind == "deck_ajs":
            count = 0
        value = "" if count == 0 else f"{index}_{count}_1"
        rows.append(
            f'<input name="{kind}" id="{kind}" value="{value}">'
        )
        rows.append(
            f"PCGDECK.searchItemName[{index}]='\u30dd\u30b1{index}';"
        )
        rows.append(
            "PCGDECK.searchItemCardPict["
            + str(index) + "]='/card_images/large/S0/1.jpg';"
        )
    return (CODE + "\n" + "\n".join(rows)).encode("utf-8")


class SnapshotTests(unittest.TestCase):
    def test_decodes_one_complete_official_60(self) -> None:
        observed = parse_viewer(fixture(), CODE)
        self.assertEqual(observed["cards"], 60)
        self.assertEqual(len(observed["entries"]), 7)
        self.assertEqual(observed["entries"][6]["count"], 53)
        self.assertEqual(
            observed["entries"][6]["japanese_set_slug"], "S0"
        )

    def test_rejects_partial_or_wrong_viewer(self) -> None:
        with self.assertRaises(ValueError):
            parse_viewer(fixture(energy_count=52), CODE)
        with self.assertRaises(ValueError):
            parse_viewer(fixture(omit="deck_sta"), CODE)
        with self.assertRaises(ValueError):
            parse_viewer(fixture(), "GxxDYx-a4rD4W-a8xYxc")

    def test_rejects_invalid_deck_code(self) -> None:
        with self.assertRaises(ValueError):
            parse_viewer(fixture(), "4xYGc4-not-a-code")


if __name__ == "__main__":
    unittest.main()
