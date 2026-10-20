"""No-network source whitelist and nonpromotion for anonymous official event probe."""
from __future__ import annotations

import unittest

from scripts import aichi_official_event_public_browser as probe


class OfficialPublicEventTest(unittest.TestCase):
    def test_only_literal_official_public_deck_codes(self):
        valid = "https://www.pokemon-card.com/deck/confirm.html/deckID/YGY8xx-nL5gwk-Gc8GcY"
        self.assertEqual(probe.deck_code(valid), "YGY8xx-nL5gwk-Gc8GcY")
        for url in (
            "https://evil.example/deck/confirm.html/deckID/YGY8xx-nL5gwk-Gc8GcY",
            "http://www.pokemon-card.com/deck/confirm.html/deckID/abcde",
            "https://www.pokemon-card.com/deck/other/abcde",
            "https://www.pokemon-card.com/deck/confirm.html/deckID/../abc",
        ):
            with self.subTest(url=url):
                self.assertIsNone(probe.deck_code(url))

    def test_observed_links_do_not_auto_admit_a_ranked_source(self):
        data = probe.summarize("Official page body", [
            {"text": "open", "href": "https://www.pokemon-card.com/deck/confirm.html/deckID/YGY8xx-nL5gwk-Gc8GcY"},
            {"text": "other", "href": "https://example.net/deck/confirm.html/deckID/false-code"},
        ])
        self.assertEqual(data["deck_codes_exposed_publicly"], ["YGY8xx-nL5gwk-Gc8GcY"])
        self.assertFalse(data["registration_verified"])
        self.assertFalse(data["entry_attributions_verified"])
        self.assertEqual(data["benchmarked_original_60s_added"], 0)


if __name__ == "__main__":
    unittest.main()
