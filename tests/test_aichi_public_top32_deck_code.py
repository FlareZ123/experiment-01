"""Offline fail-closed tests for a publicly posted, rank-unassigned deck code."""
import unittest

from scripts.aichi_public_top32_deck_code import (
    PUBLIC_SOURCES,
    SECTIONS,
    parse_saved_deck,
)


def viewer(pokemon=20, trainer=30, energy=10, duplicate=False):
    """Synthetic saved-deck HTML with a complete eight-section inventory."""
    code = PUBLIC_SOURCES["itoko"]["code"]
    ids = (101, 101 if duplicate else 102, 103)
    rows = {
        "deck_pke": f"{ids[0]}_{pokemon}_1-",
        "deck_gds": f"{ids[1]}_{trainer}_1-",
        "deck_ene": f"{ids[2]}_{energy}_1-",
    }
    html = "".join(
        f'<input name="{section}" id="{section}" value="{rows.get(section, "")}">'
        for section in SECTIONS
    )
    for card_id in set(ids):
        html += f"PCGDECK.searchItemName[{card_id}]='カード{card_id}(TEST 001/002)';"
        html += f"PCGDECK.searchItemCardPict[{card_id}]='/large/TEST/{card_id}_card.jpg';"
    return (code + " 60枚デッキ " + html).encode("utf-8")


class PublicOfficialSavedDeckTests(unittest.TestCase):
    def test_60_and_printing_fields_with_strict_unranked_provenance(self):
        x = parse_saved_deck(viewer(), "itoko")
        self.assertEqual(x["total_physical_copies"], 60)
        self.assertEqual(x["japanese_printing_rows"], 3)
        self.assertEqual(x["category_counts"],
                         {"pokemon": 20, "trainer": 30, "energy": 10})
        self.assertEqual(x["published_code"], "ySpy2S-Ey5WAe-RX3Rpp")
        self.assertEqual(x["entries"][0]["japanese_name"], "カード101")
        self.assertFalse(x["source_rank_authenticated"])
        self.assertFalse(x["field_source_approved"])
        self.assertFalse(x["official_event_registered_identity_authenticated"])
        self.assertFalse(x["official_saved_deck_equals_event_registration_authenticated"])
        self.assertFalse(x["full_printing_level_card_legality_verified"])

    def test_wrong_code_and_absent_sixty_marker_fail_closed(self):
        with self.assertRaisesRegex(ValueError, "code or sixty-card"):
            parse_saved_deck(viewer().replace(b"ySpy2S", b"wrong_"), "itoko")
        with self.assertRaisesRegex(ValueError, "code or sixty-card"):
            parse_saved_deck(viewer().replace("60枚デッキ".encode(), b""), "itoko")

    def test_missing_section_and_printing_map_fail_closed(self):
        html = viewer()
        with self.assertRaisesRegex(ValueError, "required section"):
            parse_saved_deck(html.replace(b'name="deck_tool"', b'name="bad_tool"'),
                             "itoko")
        with self.assertRaisesRegex(ValueError, "printing dictionaries"):
            parse_saved_deck(html.replace(b"PCGDECK.searchItemName", b"REMOVED"),
                             "itoko")

    def test_duplicate_ids_and_incomplete_sixity_fail_closed(self):
        with self.assertRaisesRegex(ValueError, "repeated"):
            parse_saved_deck(viewer(duplicate=True), "itoko")
        with self.assertRaisesRegex(ValueError, "physical slots"):
            parse_saved_deck(viewer(energy=9), "itoko")

    def test_source_key_must_be_predeclared(self):
        with self.assertRaises(KeyError):
            parse_saved_deck(viewer(), "unknown-poster")


if __name__ == "__main__":
    unittest.main()
