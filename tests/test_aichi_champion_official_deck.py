"""Offline schema tests for exact official Aichi champion print retrieval."""
import re
import unittest

from scripts.aichi_official_champion_deck import CODE, SECTIONS, parse_page


def fixture(pokemon=18, trainer=31, energy=11, same_id=False):
    a = 101
    b = 101 if same_id else 102
    inventories = {section: "" for section in SECTIONS}
    inventories["deck_pke"] = f"{a}_{pokemon}_1-"
    inventories["deck_gds"] = f"{b}_{trainer}_1-"
    inventories["deck_ene"] = f"103_{energy}_1-"
    fields = "".join(
        f'<input name="{section}" id="{section}" value="{inventories[section]}">'
        for section in SECTIONS
    )
    names = "".join(
        f"PCGDECK.searchItemName[{number}]='カード{number}(test)';"
        for number in {a, b, 103}
    )
    pics = "".join(
        f"PCGDECK.searchItemCardPict[{number}]='/large/TEST/{number}_card.png';"
        for number in {a, b, 103}
    )
    return (CODE + " 60枚デッキ " + fields + names + pics).encode("utf-8")


class OfficialChampionPrintGate(unittest.TestCase):
    def test_complete_60_and_category_partition(self):
        result = parse_page(fixture())
        self.assertEqual(result["printed_copies"], 60)
        self.assertEqual(result["official_card_rows"], 3)
        self.assertEqual(result["category_counts"],
                         {"pokemon": 18, "trainer": 31, "energy": 11})
        self.assertFalse(result["source_english_name_mapping_verified"])
        self.assertFalse(result["field_simulation_qualified"])

    def test_duplicated_official_id_fail_closed(self):
        with self.assertRaisesRegex(AssertionError, "repeated"):
            parse_page(fixture(same_id=True))

    def test_category_count_mismatch_fail_closed(self):
        with self.assertRaisesRegex(AssertionError, "disagrees"):
            parse_page(fixture(trainer=30))

    def test_code_absent_fail_closed(self):
        raw = fixture().replace(CODE.encode(), b"wrong registration")
        with self.assertRaisesRegex(AssertionError, "Wrong deck code"):
            parse_page(raw)


if __name__ == "__main__":
    unittest.main()
