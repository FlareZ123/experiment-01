"""Synthetic falsification tests for the printed-category native search screen."""
import io
import json
from pathlib import Path
import sys
import unittest
from zipfile import ZipFile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from agent17_frozen_prompt_printed_target_screen import (
    matches_printed_category, resolve_printing, screen_native
)


def test_card_zip():
    content = io.BytesIO()
    with ZipFile(content, "w") as zipfile:
        zipfile.writestr("sets/en.json", json.dumps([
            {"id": "test", "ptcgoCode": "TST"}
        ]))
        zipfile.writestr("cards/en/test.json", json.dumps([
            {"name": "Psy", "supertype": "Pokémon",
             "subtypes": ["Basic"], "types": ["Psychic"]},
            {"name": "Fire", "supertype": "Pokémon",
             "subtypes": ["Basic"], "types": ["Fire"]},
            {"name": "Thunder Mountain ◇", "supertype": "Trainer",
             "subtypes": ["Stadium", "Prism Star"]},
            {"name": "Team Helper", "supertype": "Trainer",
             "subtypes": ["Supporter", "TAG TEAM"]},
            {"name": "Special P", "supertype": "Energy",
             "subtypes": ["Special"]},
        ]))
    content.seek(0)
    return ZipFile(content)


def test_native(target="Psy TST", parent="Fog Crystal CRE"):
    return json.dumps({
        "attempted": 1,
        "rows": [{
            "trial": {"id": "test"},
            "actionCount": 2,
            "rootActionCount": 2,
            "rootActionLedger": [
                {"actionOrdinal": 0, "action": "PlayCardAction",
                 "initiatingRootActionOrdinal": 0},
                {"actionOrdinal": 1, "action": "ResolvePromptAction",
                 "initiatingRootActionOrdinal": 0}
            ],
            "nativeAcceptedTargetSidecar": {"events": [{
                "rootActionOrdinal": 0,
                "declared": {"ownerHandPrinting": parent}
            }]},
            "nativePromptChoices": {"events": [{
                "ordinal": 1, "kind": "ChooseCardsPrompt",
                "sourceZone": "deck", "selectedCards": [target]
            }]}
        }]
    }).encode("utf-8")


class PrintedTargetScreenTests(unittest.TestCase):
    def test_correct_fog_basic_psychic(self):
        with test_card_zip() as cards:
            summary = screen_native(test_native(), cards)
        self.assertEqual(summary["total_selected"], 1)
        self.assertEqual(summary["total_exact_category_matches"], 1)
        self.assertEqual(summary["total_exact_category_mismatches"], 0)
        self.assertEqual(summary["paper_prompt_verdict"],
                         "PAPER_PROMPT_UNVERIFIED")

    def test_disallowed_fog_basic_fire(self):
        with test_card_zip() as cards:
            summary = screen_native(test_native("Fire TST"), cards)
        self.assertEqual(summary["total_exact_category_mismatches"], 1)

    def test_missing_set_is_unverified_not_invalid(self):
        with test_card_zip() as cards:
            summary = screen_native(test_native("Psy NEW"), cards)
        self.assertEqual(summary["total_printing_unresolved"], 1)
        self.assertEqual(summary["total_exact_category_mismatches"], 0)

    def test_capture_and_tag_and_guzma(self):
        for parent, target in [
            ("Capture Energy RCL", "Fire TST"),
            ("Tag Call CEC", "Team Helper TST"),
            ("Guzma & Hala CEC", "Special P TST"),
            ("Guzma & Hala CEC", "Thunder Mountain Prism Star TST"),
        ]:
            with self.subTest(parent=parent, target=target):
                with test_card_zip() as cards:
                    summary = screen_native(test_native(target, parent), cards)
                self.assertEqual(summary["total_exact_category_matches"], 1)

    def test_shared_ptcgo_code_across_main_and_gallery_sets(self):
        bio = io.BytesIO()
        with ZipFile(bio, "w") as archive:
            archive.writestr("sets/en.json", json.dumps([
                {"id": "main", "ptcgoCode": "TST"},
                {"id": "gallery", "ptcgoCode": "TST"}
            ]))
            archive.writestr("cards/en/main.json", json.dumps([{
                "name": "Psy", "supertype": "Pokémon",
                "subtypes": ["Basic"], "types": ["Psychic"]
            }]))
            archive.writestr("cards/en/gallery.json", json.dumps([{
                "name": "Other", "supertype": "Trainer",
                "subtypes": ["Supporter"]
            }]))
        bio.seek(0)
        with ZipFile(bio) as cards:
            result = screen_native(test_native(), cards)
        self.assertEqual(result["total_exact_category_matches"], 1)

    def test_exact_promo_archive_aliases_and_wrong_collector_negative(self):
        raw = io.BytesIO()
        with ZipFile(raw, "w") as archive:
            archive.writestr("sets/en.json", json.dumps([
                {"id": "bwp", "ptcgoCode": "PR-BLW"},
                {"id": "smp", "ptcgoCode": "PR-SM"}
            ]))
            archive.writestr("cards/en/bwp.json", json.dumps([
                {"id": "bwp-BW28", "number": "BW28",
                 "name": "Tropical Beach", "supertype": "Trainer",
                 "subtypes": ["Stadium"]},
                {"id": "bwp-BW50", "number": "BW50",
                 "name": "Tropical Beach", "supertype": "Trainer",
                 "subtypes": ["Stadium"]}
            ]))
            archive.writestr("cards/en/smp.json", json.dumps([{
                "id": "smp-SM217", "number": "SM217",
                "name": "Trevenant & Dusknoir-GX", "supertype": "Pokémon",
                "subtypes": ["Basic", "TAG TEAM", "GX"],
                "types": ["Psychic"]
            }]))
        raw.seek(0)
        with ZipFile(raw) as cards:
            summary = screen_native(test_native(
                "Tropical Beach BWP 50", "Guzma & Hala CEC"), cards)
            self.assertEqual(summary["total_exact_category_matches"], 1)
            code_to_id, cache = {
                "PR-BLW": ["bwp"], "PR-SM": ["smp"]}, {}
            resolved, why = resolve_printing(
                "Trevenant & Dusknoir-GX SMP",
                cards, code_to_id, cache)
            self.assertEqual(why, "resolved-exact-archive-alias")
            self.assertIn("Basic", resolved["subtypes"])
            invalid, why = resolve_printing(
                "Tropical Beach BWP 28", cards, code_to_id, cache)
            self.assertIsNone(invalid)
            self.assertEqual(why, "unlisted-set")
            ambiguous, why = resolve_printing(
                "Tropical Beach BWP", cards, code_to_id, cache)
            self.assertIsNone(ambiguous)
            self.assertEqual(why, "unlisted-set")

    def test_false_capture_evolution_and_untagged_supporter(self):
        self.assertFalse(matches_printed_category(
            "Capture Energy RCL", {
                "name": "Evolved", "supertype": "Pokémon",
                "subtypes": frozenset(["Stage 1"]),
                "types": frozenset(["Psychic"]),
            }))
        self.assertFalse(matches_printed_category(
            "Tag Call CEC", {
                "name": "Non-tag", "supertype": "Trainer",
                "subtypes": frozenset(["Supporter"]),
                "types": frozenset(),
            }))

    def test_setup_basic_selections_across_both_seats(self):
        data = json.loads(test_native())
        row = data["rows"][0]
        row["sourceSeat"] = 1
        row["rootActionLedger"][1]["initiatingRootActionOrdinal"] = None
        row["nativePromptChoices"]["events"][0].update({
            "sourceZone": "hand",
            "actorSeat": 1,
            "selectedCards": ["Psy TST", "Fire TST", "Special P TST"]
        })
        with test_card_zip() as cards:
            result = screen_native(json.dumps(data).encode(), cards)
        source = result["initial_basic_selection_screen"]["source"]
        self.assertEqual(source["hand_selection_prompts"], 1)
        self.assertEqual(source["selected_card_instances"], 3)
        self.assertEqual(source["exact_print_basic_matches"], 2)
        self.assertEqual(source["exact_print_basic_mismatches"], 1)
        self.assertEqual(result["total_selected"], 0)

    def test_duplicate_trials_or_incomplete_ledger_rejected(self):
        data = json.loads(test_native())
        data["rows"] = data["rows"] * 2
        data["attempted"] = 2
        with test_card_zip() as cards:
            with self.assertRaisesRegex(ValueError, "duplicate trial"):
                screen_native(json.dumps(data).encode(), cards)
        data["rows"].pop()
        data["attempted"] = 1
        data["rows"][0]["rootActionCount"] = 0
        with test_card_zip() as cards:
            with self.assertRaisesRegex(ValueError, "incomplete"):
                screen_native(json.dumps(data).encode(), cards)


if __name__ == "__main__":
    unittest.main()
