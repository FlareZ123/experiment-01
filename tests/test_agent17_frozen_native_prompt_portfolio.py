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


    def test_rank6_bench_count_matches_actual_attached_prompt(self):
        data = fixture()
        row = data["rows"][0]
        row["trial"]["rank"] = 6
        row["rootActionLedger"][0]["action"] = "AttackAction"
        row["rootActionLedger"][0]["attack"] = "Volt Cyclone"
        row["rootActionLedger"].append({
            "actionOrdinal": 3, "action": "ResolvePromptAction",
            "pendingPrompt": "AttachEnergyPrompt", "playerSlot": 1,
            "turnBefore": 0, "initiatingRootActionOrdinal": 0})
        row["rootActionCount"] = 4
        row["actionCount"] = 4
        board_before = [
            {"stadium": [], "active": {"name": "Other",
                                      "energyCards": []}, "bench": []},
            {"stadium": [], "active": {
                "name": "Iron Thorns ex",
                "energyCards": ["Speed Lightning Energy",
                                "Double Colorless Energy"]},
             "bench": [{"name": "Iron Thorns ex"}]}
        ]
        row["sourceAttackSettlement"] = {"attacks": [{
            "actionOrdinal": 0, "attackName": "Volt Cyclone",
            "publicBoardBefore": board_before
        }]}
        event = {
            "dispatchOrdinal": 6, "turnBefore": 0, "playerSlot": 1,
            "nativeDispatchAccepted": True,
            "publicChanges": [
                {"seat": 1, "position": "active", "index": 0,
                 "before": {"pokemon": "Iron Thorns ex TWM",
                            "energies": ["Double Colorless Energy SUM"]},
                 "after": {"pokemon": "Iron Thorns ex TWM",
                           "energies": []}},
                {"seat": 1, "position": "bench", "index": 0,
                 "before": {"pokemon": "Iron Thorns ex TWM", "energies": []},
                 "after": {"pokemon": "Iron Thorns ex TWM",
                           "energies": ["Double Colorless Energy SUM"]}}
            ]
        }
        row["nativeAcceptedEnergyPromptSidecar"] = {
            "events": [event], "acceptedEnergyPromptResolutions": 1,
            "publiclyChangedResolutions": 1, "publicDeltaUnobserved": 0
        }
        result = audit_native(data)
        self.assertEqual(result["rank6_volt_cyclone_bench_prompt_branch"],
                         {"own-bench-one-move-prompt": 1})
        self.assertEqual(result["rank6_source_printed_volt_cyclone_base_cost"],
                         {"observed-base-cost-payable": 1})
        self.assertEqual(result["energy_sidecar_minus_root_ordinal"],
                         {"3": 1})

        without_bench = copy.deepcopy(data)
        no = without_bench["rows"][0]
        no["rootActionLedger"].pop()
        no["rootActionCount"] = 3
        no["actionCount"] = 3
        no["sourceAttackSettlement"]["attacks"][0]["publicBoardBefore"][1][
            "bench"] = []
        no["nativeAcceptedEnergyPromptSidecar"] = {
            "events": [], "acceptedEnergyPromptResolutions": 0,
            "publiclyChangedResolutions": 0, "publicDeltaUnobserved": 0
        }
        result = audit_native(without_bench)
        self.assertEqual(result["rank6_volt_cyclone_bench_prompt_branch"],
                         {"no-bench-no-move-prompt": 1})


if __name__ == "__main__":
    unittest.main()
