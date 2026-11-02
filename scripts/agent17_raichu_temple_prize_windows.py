"""Exact initial six-Prize resource windows conditioned on a Basic-valid opener.

Printed Aichi rank4/rank17 originals and the unchanged Temple candidate are
checked against the bundled English archive. The result is card-location only.
"""

from __future__ import annotations

from fractions import Fraction
from functools import lru_cache
from itertools import combinations
from math import comb
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
CARD_ROOT = ROOT / "resources" / "cards" / "en"


@lru_cache(maxsize=1)
def set_code_index() -> dict[str, list[str]]:
    index: dict[str, list[str]] = {}
    for entry in json.loads((ROOT / "resources" / "sets" / "en.json").read_text(encoding="utf-8")):
        code = entry.get("ptcgoCode")
        if code:
            index.setdefault(code, []).append(entry["id"])
    return index


@lru_cache(maxsize=None)
def card_set(set_id: str) -> list[dict]:
    return json.loads((CARD_ROOT / f"{set_id}.json").read_text(encoding="utf-8"))


def printed_card(card: dict) -> dict:
    """Resolve exact card set/number; reject missing or ambiguous printings."""
    printing = card["printing"]
    code, number = printing["set"], str(printing["number"])
    found: list[dict] = []
    for set_id in set_code_index().get(code, []):
        file = CARD_ROOT / f"{set_id}.json"
        if not file.exists():
            continue
        id_aliases = {f"{set_id}-{number}"}
        if code == "SMP":
            id_aliases.add(f"{set_id}-SM{number}")
        if code == "BWP":
            id_aliases.add(f"{set_id}-BW{number}")
        for entry in card_set(set_id):
            if entry["id"] in id_aliases:
                found.append(entry)
    assert len(found) == 1, f"Printing is missing or ambiguous: {code}{number} / {card['name']}"
    actual = found[0]
    normalized_name = card["name"].replace("♢", "◇")
    assert actual["name"] == normalized_name, (card, actual["name"])
    return actual


def basic_count(deck: dict) -> int:
    assert sum(card["count"] for card in deck["cards"]) == 60
    count = 0
    for card in deck["cards"]:
        if card["category"] != "Pokémon":
            continue
        printed = printed_card(card)
        assert printed["supertype"] == "Pokémon"
        if "Basic" in printed.get("subtypes", []):
            count += card["count"]
    return count


def copies(deck: dict, name: str, set_code: str, number: str) -> int:
    return sum(card["count"] for card in deck["cards"] if
               card["name"] == name and
               card["printing"]["set"] == set_code and
               str(card["printing"]["number"]) == number)


def all_prized_given_valid_opener(
    basic_cards: int, target_cards: int, target_basics: int = 0,
    *, deck_size: int = 60, opener_size: int = 7, prizes: int = 6
) -> Fraction:
    """Exact probability every named target copy is Prized after valid setup.

    Both the hand and Prize subset are drawn without replacement, conditioned
    on a hand containing a Basic. Cards are treated as physically distinct.
    """
    assert 0 <= target_basics <= target_cards <= prizes
    assert 1 <= basic_cards <= deck_size
    assert target_basics <= basic_cards
    assert opener_size + prizes <= deck_size
    assert basic_cards + (target_cards - target_basics) <= deck_size

    valid_hands = comb(deck_size, opener_size) - comb(deck_size - basic_cards, opener_size)
    valid_no_target = (
        comb(deck_size - target_cards, opener_size) -
        comb(deck_size - basic_cards - target_cards + target_basics, opener_size)
    )
    all_target_in_prizes = Fraction(
        comb(deck_size - opener_size - target_cards, prizes - target_cards),
        comb(deck_size - opener_size, prizes)
    )
    return Fraction(valid_no_target, valid_hands) * all_target_in_prizes


def source_locked_audit() -> dict:
    source = json.loads((ROOT / "results" / "aichi-2026" / "full-decklists.json").read_text(encoding="utf-8"))
    candidate = json.loads((ROOT / "results" / "aichi-2026" / "candidate-temple-shadow-rider.json").read_text(encoding="utf-8"))
    assert len(source["decks"]) == 29

    deck4 = next(deck for deck in source["decks"] if deck["rank"] == 4)
    deck17 = next(deck for deck in source["decks"] if deck["rank"] == 17)
    assert basic_count(candidate) == 15
    assert basic_count(deck4) == 13
    assert basic_count(deck17) == 13

    assert copies(candidate, "Temple of Sinnoh", "ASR", "155") == 2
    assert copies(deck4, "Sky Field", "ROS", "89") == 3
    assert copies(deck4, "Escape Rope", "BST", "125") == 3
    assert copies(deck17, "PokéStop", "PGO", "68") == 1
    assert copies(deck17, "Marshadow", "UNB", "81") == 1
    assert "Basic" in printed_card(next(card for card in deck17["cards"] if card["name"] == "Marshadow")).get("subtypes", [])
    assert copies(deck17, "Escape Rope", "BST", "125") == 3

    candidate_both_temple = all_prized_given_valid_opener(15, 2)
    rank4_all_sky = all_prized_given_valid_opener(13, 3)
    rank17_all_answer = all_prized_given_valid_opener(13, 2, 1)
    rank17_all_rope = all_prized_given_valid_opener(13, 3)
    rank17_all_five = all_prized_given_valid_opener(13, 5, 1)
    rank4_all_six = all_prized_given_valid_opener(13, 6)
    rank17_both_resource_types_unprized = 1 - rank17_all_answer - rank17_all_rope + rank17_all_five
    rank4_both_resource_types_unprized = 1 - 2 * rank4_all_sky + rank4_all_six

    def field(value: Fraction) -> dict:
        return {"exact": str(value), "percent": round(100 * float(value), 9)}

    return {
        "schema": "agent17-raichu-temple-conditional-prize-v1",
        "population": "Valid seven-card Basic Pokémon opener; then six uniform face-down Prizes",
        "candidateBasicCards": 15,
        "sourceBasicCards": {"4": 13, "17": 13},
        "candidateBothTemplePrized": field(candidate_both_temple),
        "rank4AllThreeSkyFieldPrized": field(rank4_all_sky),
        "rank17PokeStopAndBasicMarshadowPrized": field(rank17_all_answer),
        "rank4HasSkyFieldAndEscapeRopeOutsidePrizes": field(rank4_both_resource_types_unprized),
        "rank17HasEitherStadiumAnswerAndEscapeRopeOutsidePrizes": field(rank17_both_resource_types_unprized),
        "prizingOnly": True,
        "naturalGameWitness": False,
        "competitivelyQualifiedGames": 0
    }


if __name__ == "__main__":
    print(json.dumps(source_locked_audit(), indent=2, ensure_ascii=False))
