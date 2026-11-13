import sys
import unittest
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.aichi_expanded_identity_audit import (
    audit_entry,
    normalize_name,
    number_candidates,
)


def catalog_for(set_code, set_id, card, release_date="2014/11/05"):
    card = {**card, "_set_id": set_id}
    return {
        "set_to_ids": {set_code: [set_id]},
        "sets_by_id": {set_id: {"id": set_id, "name": set_id, "releaseDate": release_date}},
        "cards_by_set": {set_id: [card]},
        "all_cards": [card],
    }


class AichiExpandedIdentityAuditTests(unittest.TestCase):
    def test_ditto_diamond_variants_normalize_to_same_identity(self):
        self.assertEqual(normalize_name("Ditto ♢"), normalize_name("Ditto ◇"))

    def test_english_promo_number_prefixes_are_recovered(self):
        self.assertIn("SM217", number_candidates("SMP", "217"))
        self.assertIn("XY177", number_candidates("XYP", "177"))
        self.assertIn("BW153", number_candidates("BWP", "153"))

    def test_battle_compressor_name_alias_matches_english_print(self):
        catalog = catalog_for("PHF", "phf", {
            "name": "Battle Compressor Team Flare Gear",
            "number": "92",
            "legalities": {"expanded": "Legal"},
        })
        result = audit_entry({
            "name": "Battle Compressor", "count": 1,
            "printing": {"set": "PHF", "number": "92", "language": "en"},
        }, catalog, date(2026, 5, 10))
        self.assertEqual(result["status"], "english_expanded_legal_normalized")
        self.assertTrue(result["expanded_legal_identity"])

    def test_basic_energy_export_placeholder_is_not_misclassified_as_missing_card(self):
        result = audit_entry({
            "name": "Psychic Energy", "count": 11,
            "printing": {"set": "MEE", "number": "13", "language": "en"},
        }, {"set_to_ids": {}, "sets_by_id": {}, "cards_by_set": {}, "all_cards": []},
           date(2026, 5, 10))
        self.assertEqual(result["status"], "basic_energy_identity_legal_printing_unresolved")
        self.assertTrue(result["expanded_legal_identity"])
        self.assertFalse(result["physical_source_print_verified"])

    def test_post_event_english_special_red_card_uses_pre_event_japanese_counterpart(self):
        catalog = catalog_for("CRI", "me4", {
            "name": "Special Red Card",
            "number": "82",
            "legalities": {"expanded": "Legal"},
        }, release_date="2026/05/22")
        result = audit_entry({
            "name": "Special Red Card", "count": 1,
            "printing": {"set": "CRI", "number": "82", "language": "en"},
        }, catalog, date(2026, 5, 10))
        self.assertEqual(result["event_date_status"], "japanese_counterpart_pre_event_verified")
        self.assertEqual(result["japanese_pre_event_crosswalk"]["number"], "072/083")

    def test_banned_card_pool_flag_is_not_returned_as_legal(self):
        catalog = catalog_for("TST", "tst", {
            "name": "Test Card", "number": "1",
            "legalities": {"expanded": "Banned"},
        })
        result = audit_entry({
            "name": "Test Card", "count": 1,
            "printing": {"set": "TST", "number": "1"},
        }, catalog, date(2026, 5, 10))
        self.assertEqual(result["status"], "expanded_banned")
        self.assertFalse(result["expanded_legal_identity"])

    def test_absent_english_identity_is_not_admitted(self):
        result = audit_entry({
            "name": "Japanese-only promo", "count": 1,
            "printing": {"set": "SP", "number": "127"},
        }, {"set_to_ids": {}, "sets_by_id": {}, "cards_by_set": {}, "all_cards": []},
           date(2026, 5, 10))
        self.assertEqual(result["status"], "no_english_print")
        self.assertFalse(result["expanded_legal_identity"])


if __name__ == "__main__":
    unittest.main()
