"""SFT: printing-sensitive Japanese Expanded bans and May 2026 field audit."""
import json
import unittest

from scripts.japanese_expanded_audit import (
    BANLIST, MANIFEST, audit_repository, classify_card, load_english_index
)


class JapaneseExpandedBanAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bans = json.loads(BANLIST.read_text(encoding="utf-8"))["banned_identities"]
        cls.index = load_english_index()

    def card(self, name, set_code, number):
        return classify_card(
            {"name": name, "printing": {"set": set_code, "number": number}},
            self.index, self.bans
        )

    def test_official_list_has_27_distinct_banned_identities(self):
        self.assertEqual(len(self.bans), 27)

    def test_marshadow_resetting_hole_is_not_let_loose(self):
        self.assertEqual(self.card("Marshadow", "UNB", "81")["status"], "different-identity")
        self.assertEqual(self.card("Marshadow", "sm35", "45")["status"], "banned")

    def test_unown_and_duskull_variants(self):
        self.assertEqual(self.card("Unown", "AOR", "30")["status"], "different-identity")
        self.assertEqual(self.card("Unown", "sm8", "90")["status"], "banned")
        self.assertEqual(self.card("Unown", "sm8", "91")["status"], "banned")
        self.assertEqual(self.card("Duskull", "CEC", "83")["status"], "banned")
        self.assertEqual(self.card("Duskull", "PRE", "35")["status"], "different-identity")

    def test_name_bans_and_indeterminate_printings(self):
        self.assertEqual(self.card("Reset Stamp", "sm11", "206")["status"], "banned")
        self.assertEqual(self.card("Medicham V", "no-set", "x")["status"], "banned")
        self.assertEqual(self.card("Marshadow", "no-set", "x")["status"], "indeterminate-identity")

    def test_exact_top_32_published_field(self):
        report = audit_repository()
        self.assertEqual(report["decks_audited"], 29)
        self.assertEqual(report["status_rows"].get("banned", 0), 0)
        self.assertEqual(report["status_rows"].get("indeterminate-identity", 0), 0)
        self.assertEqual(report["exclusive_supporter_conflicts"], [])
        self.assertGreaterEqual(
            report["status_rows"].get("different-identity", 0), 10
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
