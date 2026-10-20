"""Rank-26 source-locked initial Ticket and two-connector opportunity model.

All counts are physical card-zone probabilities conditioned on a legal
Basic-containing seven-card opening. They do not model action availability,
card access, match results, or any player policy.
"""
import json
from fractions import Fraction
from math import comb
from pathlib import Path

from scripts.rank26_prize_ticket_gate import rank26_inventory


def choose(n: int, k: int) -> int:
    """Binomial count, including impossible selections."""
    return comb(n, k) if 0 <= k <= n else 0


def initial_search_item_bins(
    *, deck_size: int = 60, basics: int = 12,
    search_items: int = 8, opening: int = 7, prizes: int = 6,
) -> dict[str, Fraction]:
    """A held Ticket, a Prized singleton DCE, and held search Item counts.

    The physical deck has the specified Basics and search Items, plus two
    distinct non-Basic singletons (Ticket and DCE) and non-Basic filler.
    Ticket starts in hand; DCE starts Prized; initial seven is Basic-valid.

    This is a resource count, not a test that search Items are playable or
    that the DCE can be drawn and attached after its Prize redeal.
    """
    if any(type(v) is not int for v in (
        deck_size, basics, search_items, opening, prizes
    )):
        raise ValueError("All parameters must be integers")
    if (
        deck_size < 3 or basics < 1 or search_items < 0 or
        basics + search_items + 2 > deck_size or
        not 2 <= opening < deck_size or
        not 1 <= prizes <= deck_size - opening
    ):
        raise ValueError("Infeasible initial hand or Prize parameters")
    valid_hands = choose(deck_size, opening) - choose(
        deck_size - basics, opening
    )
    if valid_hands == 0:
        raise ValueError("No Basic-valid opening hand")
    filler = deck_size - basics - search_items - 2
    probabilities = []
    for held_search in range(search_items + 1):
        hands = sum(
            choose(basics, held_basics)
            * choose(search_items, held_search)
            * choose(filler, opening - 1 - held_basics - held_search)
            for held_basics in range(1, basics + 1)
        )
        probabilities.append(
            Fraction(hands, valid_hands)
            * Fraction(prizes, deck_size - opening)
        )
    output = {
        "zero_held_search": probabilities[0],
        "one_held_search": probabilities[1] if search_items else Fraction(0),
        "two_or_more_held_search": sum(probabilities[2:], Fraction(0)),
    }
    output["ticket_held_dce_prized"] = sum(probabilities, Fraction(0))
    return output


def rank26_search_item_bins(
    manifest_path: Path,
) -> dict[str, dict[str, Fraction]]:
    """Guard the published rank-26 source before reporting its two scopes."""
    deck_size, basics = rank26_inventory(manifest_path)
    decks = json.loads(manifest_path.read_text(encoding="utf-8"))["decks"]
    source = next(deck for deck in decks if deck["rank"] == 26)
    counts = {row["name"]: row["count"] for row in source["cards"]}
    expected = {
        "Quick Ball": 4,
        "Battle Compressor": 4,
        "Battle VIP Pass": 3,
    }
    if any(counts.get(name) != required for name, required in expected.items()):
        raise ValueError("Rank-26 search Item source counts have changed")
    persistent = expected["Quick Ball"] + expected["Battle Compressor"]
    first_turn = persistent + expected["Battle VIP Pass"]
    return {
        "eight_unrestricted_search_items": initial_search_item_bins(
            deck_size=deck_size, basics=basics, search_items=persistent
        ),
        "eleven_including_first_turn_vip": initial_search_item_bins(
            deck_size=deck_size, basics=basics, search_items=first_turn
        ),
    }
