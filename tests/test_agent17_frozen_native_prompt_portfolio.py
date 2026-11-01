"""Synthetic tests for the frozen bilateral prompt-family inventory."""
import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from agent17_frozen_native_prompt_portfolio import audit_native, public_energy_transfer_shape, source_thorns_volt_cyclone_base_cost_shape


def fixture():
    ledger = [
        {"actionOrdinal": 0, "action": "PlayCardAction",
         "playerSlot": 1, "initiatingRootActionOrdinal": 0},
        {"actionOrdinal": 1, "action": "ResolvePromptAction",
         "pendingPrompt": "SelectOptionPrompt", "playerSlot": 1,
         "initiatingRootActionOrdinal": 0},
        {"actionOrdinal": 2, "action": "ResolvePromptAction",
         "pendingPrompt": "ChooseCardsPrompt", "playerSlot": 1,
         "initiatingRootActionOrdinal": 0},
    ]
    row = {
        "trial": {"id": "synthetic"},
        "rootActionLedger": ledger,
        "rootActionCount": 3, "actionCount": 3,
        "sourceSeat": 1, "finished": False,
        "nativePromptChoices": {"events": [
            {"ordinal": 1, "kind": "SelectOptionPrompt",
             "actorSeat": 1, "selectedOption": 1},
            {"ordinal": 2, "kind": "ChooseCardsPrompt",
             "actorSeat": 1, "selectedCards": ["A", "B"],
             "selectedIndices": None, "nativePromptMin": 2,
             "nativePromptMax": 2},
        ]},
        "nativeAcceptedTargetSidecar": {"events": [
            {"rootActionOrdinal": 0,
             "declared": {"ownerHandPrinting": "Guzma & Hala CEC"}}
        ]},
        "nativeAcceptedEnergyPromptSidecar": {
            "events": [], "acceptedEnergyPromptResolutions": 0,
            "publiclyChangedResolutions": 0,
            "publicDeltaUnobserved": 0
        }
    }
    return {"rows": [row], "attempted": 1, "expectedAttempts": 1,
            "researchHeadCommit": "synthetic", "nativePin": "synthetic"}


class FrozenPromptPortfolioTests(unittest.TestCase):
    def test_full_synthetic_coverage_and_printing(self):
        result = audit_native(fixture())
        self.assertEqual(result["root_actions"], 3)
        self.assertEqual(result["prompt_resolutions"], 2)
        self.assertEqual(result["choose_cards"]["native-bounds-consistent"], 1)
        self.assertEqual(result["select_option"]["recorded"], 1)
        self.assertEqual(result["families"][0]["paper_verified"], 0)
        self.assertEqual(result["played_card_printings"][0]["printing"],
                         "Guzma & Hala CEC")

    def test_unobserved_selected_cards_stay_unverified(self):
        data = fixture()
        event = data["rows"][0]["nativePromptChoices"]["events"][1]
        event["selectedCards"] = None
        event["selectedIndices"] = None
        result = audit_native(data)
        self.assertEqual(result["choose_cards"]["selection-payload-unobserved"], 1)
        self.assertEqual(result["families"][0]["paper_unverified"], 1)

    def test_out_of_bounds_is_separate_from_paper_illegality(self):
        data = fixture()
        data["rows"][0]["nativePromptChoices"]["events"][1]["selectedCards"] = []
        result = audit_native(data)
        self.assertEqual(result["choose_cards"]["native-bounds-inconsistent"], 1)
        self.assertEqual(result["families"][0]["paper_invalid"], 0)

    def test_missing_or_duplicate_prompt_receipt_rejected(self):
        data = fixture()
        data["rows"][0]["nativePromptChoices"]["events"].pop()
        with self.assertRaisesRegex(ValueError, "Missing/misaligned"):
            audit_native(data)
        data = fixture()
        data["rows"][0]["nativePromptChoices"]["events"].append(
            copy.deepcopy(data["rows"][0]["nativePromptChoices"]["events"][0]))
        with self.assertRaisesRegex(ValueError, "Duplicate choice"):
            audit_native(data)

    def test_root_count_and_ordinal_mismatch_rejected(self):
        data = fixture()
        data["rows"][0]["rootActionCount"] = 2
        with self.assertRaisesRegex(ValueError, "incomplete"):
            audit_native(data)
        data = fixture()
        data["rows"][0]["rootActionLedger"][1]["actionOrdinal"] = 8
        with self.assertRaisesRegex(ValueError, "discontinuous"):
            audit_native(data)

    def test_energy_resolution_needs_matching_sidecar(self):
        data = fixture()
        data["rows"][0]["rootActionLedger"].append({
            "actionOrdinal": 3, "action": "ResolvePromptAction",
            "pendingPrompt": "AttachEnergyPrompt", "playerSlot": 1,
            "initiatingRootActionOrdinal": 0})
        data["rows"][0]["rootActionCount"] = 4
        data["rows"][0]["actionCount"] = 4
        with self.assertRaisesRegex(ValueError, "Energy prompt sidecar"):
            audit_native(data)


    def test_public_volt_cyclone_energy_move_and_impossible_moves(self):
        event = {
            "nativeDispatchAccepted": True, "playerSlot": 1,
            "publicChanges": [
                {"seat": 1, "position": "active", "index": 0,
                 "before": {"pokemon": "Iron Thorns ex TWM",
                            "energies": ["Double Colorless Energy SUM",
                                         "Speed Lightning Energy RCL"]},
                 "after": {"pokemon": "Iron Thorns ex TWM",
                           "energies": ["Speed Lightning Energy RCL"]}},
                {"seat": 1, "position": "bench", "index": 0,
                 "before": {"pokemon": "Iron Thorns ex TWM", "energies": []},
                 "after": {"pokemon": "Iron Thorns ex TWM",
                           "energies": ["Double Colorless Energy SUM"]}},
                {"seat": 0, "position": "active", "index": 0,
                 "before": {"pokemon": "Klefki SVI", "energies": []},
                 "after": {"pokemon": None, "energies": []}},
            ],
        }
        self.assertEqual(public_energy_transfer_shape(event),
                         "single-energy-moved-active-to-own-bench")
        modified = copy.deepcopy(event)
        modified["publicChanges"][1]["after"]["energies"] = [
            "Speed Lightning Energy RCL"
        ]
        self.assertEqual(public_energy_transfer_shape(modified),
                         "not-one-matching-active-bench-energy")
        modified = copy.deepcopy(event)
        modified["publicChanges"][1]["position"] = "active"
        self.assertEqual(public_energy_transfer_shape(modified),
                         "not-one-matching-active-bench-energy")
        modified = copy.deepcopy(event)
        modified["publicChanges"][0]["before"]["pokemon"] = "Other ex"
        self.assertEqual(public_energy_transfer_shape(modified),
                         "incorrect-source-or-recipient-pokemon")


    def test_original_source_volt_cyclone_printed_base_energy_cost(self):
        attack = {
            "attackName": "Volt Cyclone",
            "publicBoardBefore": [
                {"stadium": [], "active": {"name": "Other",
                                          "energyCards": []}},
                {"stadium": [], "active": {
                    "name": "Iron Thorns ex",
                    "energyCards": ["Speed Lightning Energy",
                                    "Double Colorless Energy"]}}
            ],
        }
        self.assertEqual(source_thorns_volt_cyclone_base_cost_shape(
            attack, 1), "observed-base-cost-payable")
        changed = copy.deepcopy(attack)
        changed["publicBoardBefore"][1]["active"]["energyCards"] = [
            "Double Colorless Energy"
        ]
        self.assertEqual(source_thorns_volt_cyclone_base_cost_shape(
            changed, 1), "observed-base-cost-unpayable")
        changed["publicBoardBefore"][1]["stadium"] = [
            "Thunder Mountain Prism Star"
        ]
        self.assertEqual(source_thorns_volt_cyclone_base_cost_shape(
            changed, 1), "observed-base-cost-payable")
        changed["publicBoardBefore"][0]["stadium"] = [
            "Temple of Sinnoh"
        ]
        self.assertEqual(source_thorns_volt_cyclone_base_cost_shape(
            changed, 1), "unmodeled-stadium")
        changed = copy.deepcopy(attack)
        changed["publicBoardBefore"][1]["active"]["energyCards"] = [
            "Unknown Energy"
        ]
        self.assertEqual(source_thorns_volt_cyclone_base_cost_shape(
            changed, 1), "unmodeled-energy")


if __name__ == "__main__":
    unittest.main()
