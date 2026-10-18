"""Exact physical Prize cut for rank-26 Meloetta's first-turn Crisis Punch.

This is a card-zone model only. Search access, Item locks, gameplay decisions,
and in-game winning probabilities are outside its scope.
"""

import json
from fractions import Fraction
from math import comb
from pathlib import Path

BASIC_NAMES = frozenset({
    "Unown", "Exeggcute", "Meloetta ex", "Tapu Koko ♢", "Bunnelby",
    "Squawkabilly ex", "Crobat V", "Dedenne-GX",
})
REQUIRED_COUNTS = {
    "Double Colorless Energy": 1,
    "Redeemable Ticket": 1,
    "Lightning Energy": 2,
    "Technical Machine: Crisis Punch": 2,
    "Tapu Koko ♢": 1,
    "Meloetta ex": 1,
}


def rank26_inventory(manifest_path: Path) -> tuple[int, int]:
    """Fail closed if the published source list changes its relevant counts."""
    source = json.loads(manifest_path.read_text(encoding="utf-8"))
    deck = next(d for d in source["decks"] if d["rank"] == 26)
    cards = deck["cards"]
    counts = {card["name"]: card["count"] for card in cards}
    if sum(card["count"] for card in cards) != 60:
        raise ValueError("Rank-26 source is not a 60-card list")
    names = {card["name"] for card in cards if card["category"] == "Pokémon"}
    if names != BASIC_NAMES:
        raise ValueError("Rank-26 Pokémon identity changed; reclassify Basics")
    if any(counts.get(name) != count for name, count in REQUIRED_COUNTS.items()):
        raise ValueError("Rank-26 required card counts changed")
    basics = sum(counts[name] for name in BASIC_NAMES)
    if basics != 12:
        raise ValueError("Rank-26 expected Basic count changed")
    return sum(counts.values()), basics


def prized_nonbasic_group_conditional(
    count: int, *, deck_size: int = 60, basics: int = 12,
    opening: int = 7, prizes: int = 6,
) -> Fraction:
    """P(all designated non-Basics Prized | opening has >=1 Basic)."""
    if (not 0 <= count <= deck_size - basics or
            not 0 < basics <= deck_size or
            not 0 < opening <= deck_size or
            not 0 <= prizes <= deck_size - opening):
        raise ValueError("Infeasible physical zone sizes")
    if count > prizes:
        return Fraction(0)
    valid = Fraction(
        comb(deck_size, opening) - comb(deck_size - basics, opening),
        comb(deck_size, opening),
    )
    valid_given_all_prized = Fraction(
        comb(deck_size - count, opening)
        - comb(deck_size - count - basics, opening),
        comb(deck_size - count, opening),
    )
    return (Fraction(comb(prizes, count), comb(deck_size, count))
            * valid_given_all_prized / valid)


def ticket_held_exchange_probabilities(
    *, deck_size: int = 60, basics: int = 12,
    opening: int = 7, prizes: int = 6,
) -> dict[str, Fraction]:
    """Compare DCE Prize risk before and after playing a held Ticket at K0.

    The shuffled original Prize cards go to the deck bottom. The new Prize
    cards come from its previously untouched, uniformly shuffled top.
    Ticket and DCE are distinct non-Basic singletons, and the opening
    includes Ticket and >=1 Basic. No additional draws, searches or opponent
    effects intervene before Ticket; deck holds enough cards to replenish.
    """
    if (not 0 < basics <= deck_size - 2 or
            not 2 <= opening < deck_size or
            not 0 < prizes <= deck_size - opening - prizes):
        raise ValueError("Infeasible Ticket-held physical deck")
    valid_ticket_hands = (
        comb(deck_size - 1, opening - 1)
        - comb(deck_size - 1 - basics, opening - 1)
    )
    dce_in_valid_ticket_hand = (
        comb(deck_size - 2, opening - 2)
        - comb(deck_size - 2 - basics, opening - 2)
    )
    if not valid_ticket_hands:
        raise ValueError("No Basic-valid opening containing Ticket")
    dce_in_hand = Fraction(dce_in_valid_ticket_hand, valid_ticket_hands)
    dce_out_of_hand = 1 - dce_in_hand
    other_cards = deck_size - opening
    deck_cards = other_cards - prizes
    initially_prized = dce_out_of_hand * Fraction(prizes, other_cards)
    initially_in_deck = dce_out_of_hand * Fraction(deck_cards, other_cards)
    after_exchange_prized = (
        initially_in_deck * Fraction(prizes, deck_cards)
    )
    if initially_prized != after_exchange_prized:
        raise AssertionError("Uniform Prize exchange must preserve risk")
    return {
        "dce_in_opening": dce_in_hand,
        "dce_initially_prized": initially_prized,
        "dce_after_ticket_prized": after_exchange_prized,
        "dce_initially_in_deck": initially_in_deck,
        "new_prize_risk_given_dce_initially_in_deck":
            Fraction(prizes, deck_cards),
        "new_prize_risk_given_dce_initially_prized": Fraction(0),
    }


def report(manifest_path: Path) -> dict[str, str]:
    _, basics = rank26_inventory(manifest_path)
    dce = prized_nonbasic_group_conditional(1, basics=basics)
    pair = prized_nonbasic_group_conditional(2, basics=basics)
    return {
        "initial_dce_prized_conditional": str(dce),
        "initial_dce_and_ticket_both_prized_conditional": str(pair),
        "initial_dce_prized_ticket_not_prized_conditional": str(dce - pair),
        "dce_and_ticket_prize_cut_ceiling_for_turn_one_punch": str(1 - pair),
    }


if __name__ == "__main__":
    path = Path(__file__).resolve().parents[1] / "results/aichi-2026/full-decklists.json"
    print(json.dumps(report(path), indent=2))
