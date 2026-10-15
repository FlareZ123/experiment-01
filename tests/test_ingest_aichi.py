"""Deterministic tests for the published Aichi deck extractor."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from ingest_aichi import Player, extract_decks, load_field, visible_tokens


class TestAichiIngest(unittest.TestCase):
    def test_field_is_complete(self):
        header = "rank,player,archetype,full_list_published\n"
        lines = [f"{i},Player {i},Deck,{'no' if i in (23,25,28) else 'yes'}"
                 for i in range(1, 33)]
        self.assertEqual(len(load_field(header + "\n".join(lines))), 32)
        with self.assertRaises(ValueError):
            load_field(header + "\n".join(lines[:-1]))

    def test_split_html_tokens(self):
        html = ('<main><h2><span>1st</span><span>Alice A</span></h2>'
                '<div>Pokémon <b>(4)</b></div><p><i>3</i> Mimikyu</p></main>')
        self.assertEqual(visible_tokens(html),
                         ["1st Alice A", "Pokémon (4)", "3 Mimikyu"])

    def test_29_decks_preserve_duplicate_printings(self):
        field = [Player(i, f"Player {i}", "Deck", i not in (23,25,28))
                 for i in range(1, 33)]
        chunks = []
        for p in field:
            if not p.published:
                continue
            i = p.rank
            suffix = ("st" if i % 10 == 1 and i % 100 != 11 else
                      "nd" if i % 10 == 2 and i % 100 != 12 else
                      "rd" if i % 10 == 3 and i % 100 != 13 else "th")
            chunks.append(
                f"<h2>{i}{suffix} {p.player}</h2><p>USD</p>"
                "<h3>Pokémon (10)</h3><a>3 Mimikyu</a><a>7 Mimikyu</a>"
                "<h3>Trainer (40)</h3><a>4 VS Seeker</a><a>36 Item</a>"
                "<h3>Energy (10)</h3><a>10 Psychic Energy</a>"
                "<button>Copy to Clipboard</button>"
            )
        data = extract_decks("<main>" + "".join(chunks) + "</main>", field)
        self.assertEqual(data["published_count"], 29)
        self.assertEqual(data["unpublished_ranks"], [23,25,28])
        self.assertEqual(data["decks"][0]["sections"]["Pokémon"],
                         [{"count": 3, "name": "Mimikyu"},
                          {"count": 7, "name": "Mimikyu"}])

    def test_invalid_total_rejected(self):
        field = [Player(i, f"Player {i}", "Deck", i not in (23,25,28))
                 for i in range(1, 33)]
        html = "".join(
            f"<h2>{i}th Player {i}</h2><h3>Pokémon (10)</h3><p>9 Mimikyu</p>"
            "<h3>Trainer (40)</h3><p>40 Item</p>"
            "<h3>Energy (10)</h3><p>10 Fire Energy</p>"
            for i in range(1,33) if i not in (23,25,28)
        )
        with self.assertRaises(ValueError):
            extract_decks(html, field)


if __name__ == "__main__":
    unittest.main(verbosity=2)
