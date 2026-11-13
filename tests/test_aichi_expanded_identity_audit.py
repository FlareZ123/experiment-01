import sys
import unittest
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.aichi_expanded_identity_audit import (
    audit_deck_construction,
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

    def test_post_event_english_trubbish_uses_pre_event_japanese_counterpart(self):
        catalog = catalog_for("CRI", "me4", {
            "name": "Trubbish",
            "number": "56",
            "legalities": {"expanded": "Legal"},
        }, release_date="2026/05/22")
        result = audit_entry({
            "name": "Trubbish", "count": 2,
            "printing": {"set": "CRI", "number": "56", "language": "en"},
        }, catalog, date(2026, 5, 10))
        self.assertEqual(result["event_date_status"], "japanese_counterpart_pre_event_verified")
        self.assertEqual(result["japanese_pre_event_crosswalk"]["number"], "054/083")

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

    def test_basic_energy_is_exempt_from_four_copy_limit(self):
        result = audit_deck_construction([
            {"name": "Psychic Energy", "count": 11, "matched_english_printing": None},
            {"name": "Ultra Ball", "count": 4, "matched_english_printing": {"name": "Ultra Ball", "subtypes": ["Item"]}},
        ], 60)
        self.assertEqual(result["four_copy_violations"], [])
        self.assertTrue(result["sixty_card_total"])

    def test_ace_spec_limit_is_one(self):
        result = audit_deck_construction([
            {"name": "Secret Box", "count": 1, "matched_english_printing": {"name": "Secret Box", "subtypes": ["ACE SPEC"]}},
            {"name": "Unfair Stamp", "count": 1, "matched_english_printing": {"name": "Unfair Stamp", "subtypes": ["ACE SPEC"]}},
        ], 60)
        self.assertEqual(result["ace_spec_count"], 2)
        self.assertFalse(result["ace_spec_pass"])
        self.assertFalse(result["passed"])

    def test_prism_star_and_radiant_limits_are_checked(self):
        prism = audit_deck_construction([
            {"name": "Ditto ◇", "count": 2, "matched_english_printing": {"name": "Ditto ◇", "subtypes": ["Prism Star"]}},
        ], 60)
        radiant = audit_deck_construction([
            {"name": "Radiant Eternatus", "count": 1, "matched_english_printing": {"name": "Radiant Eternatus", "subtypes": ["Radiant"]}},
            {"name": "Radiant Greninja", "count": 1, "matched_english_printing": {"name": "Radiant Greninja", "subtypes": ["Radiant"]}},
        ], 60)
        self.assertEqual(len(prism["prism_star_violations"]), 1)
        self.assertFalse(radiant["radiant_pokemon_pass"])

    def test_four_copy_limit_is_enforced_for_non_basic_cards(self):
        result = audit_deck_construction([
            {"name": "Ultra Ball", "count": 5, "matched_english_printing": {"name": "Ultra Ball", "subtypes": ["Item"]}},
        ], 60)
        self.assertEqual(result["four_copy_violations"], [{"name": "Ultra Ball", "count": 5}])
        self.assertFalse(result["passed"])

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

def test_fairy_energy_is_exempt_from_four_copy_rule():
    cards = [{"name": "Fairy Energy", "count": 5}] + [
        {"name": f"Distinct filler {index}", "count": 1}
        for index in range(55)
    ]

    result = audit_deck_construction(cards, total_copies=60)

    assert result["sixty_card_total"] is True
    assert result["four_copy_violations"] == []
    assert result["passed"] is True

