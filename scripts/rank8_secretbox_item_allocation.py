"""Exact first-draw access to rank-8 Secret Box / Boost Shake Tool-Garbodor lines.

Enumerate a Basic-valid seven, a normal eighth draw, and six random Prizes.
Search availability is counted only for explicitly named deck targets. These
are potential physical access paths, not native game or lock frequencies.
"""
from fractions import Fraction
from itertools import product
from math import comb
from pathlib import Path
import json

SOURCE = Path(__file__).resolve().parents[1] / "results" / "aichi-2026" / "full-decklists.json"
ROUTES = (
    "direct_shake_trubbish_tool",
    "box_held_shake_item_fetch_quickball",
    "box_fetch_shake_trubbish_or_held_quickball",
    "box_fetch_shake_trubbish_seen",
    "box_fetch_shake_quickball_held",
    "any_of_three_routes",
    "direct_and_box_held_shake",
)


def original_rank8_categories(source=SOURCE):
    """Derive disjoint categories and authenticate the original named 60."""
    data = json.loads(Path(source).read_text(encoding="utf-8"))
    source8 = next(d for d in data["decks"] if d["rank"] == 8)
    assert (source8["player"], source8["archetype"]) == (
        "Yusuke Kobayashi", "Absol Garbodor")
    cards = source8["cards"]
    counts = {card["name"]: card["count"] for card in cards}
    assert sum(counts.values()) == 60
    pokemon = [card for card in cards if card["category"] == "Pokémon"]
    assert sum(card["count"] for card in pokemon) == 12
    assert {c["name"] for c in pokemon} == {
        "Mega Absol ex", "Trubbish", "Garbodor", "Tapu Koko ♢",
        "Dedenne-GX", "Crobat V", "Squawkabilly ex",
        "Tapu Lele-GX", "Budew",
    }
    # Forest Seal Stone is intentionally excluded as strategically protected.
    tools = counts["Float Stone"] + counts["Muscle Band"]
    categories = (counts["Secret Box"], counts["Boost Shake"],
                  counts["Trubbish"], counts["Quick Ball"], tools,
                  counts["Garbodor"], 12 - counts["Trubbish"] - counts["Garbodor"])
    assert categories == (1, 1, 2, 4, 5, 2, 8)
    return categories + (60 - sum(categories),)


def exact_opportunities(numbers, opener=7, prizes=6):
    """Enumerate every first-eight category composition and six-Prize subset.

    Categories: Box, Shake, Trubbish, Quick Ball, compatible Tool,
    Garbodor, other Basic, other. The opening seven must contain a Basic.
    """
    assert len(numbers) == 8 and all(isinstance(x, int) and x >= 0
                                      for x in numbers)
    size, seen = sum(numbers), opener + 1
    assert 0 < opener and seen + prizes <= size
    totals = {key: 0 for key in ROUTES}
    denominator = 0
    hand_compositions = prize_compositions = 0
    prize_total = comb(size - seen, prizes)
    for hand in product(*(range(min(n, seen) + 1) for n in numbers)):
        if sum(hand) != seen:
            continue
        box, shake, trubbish, quick, tool, _, other_basic, _ = hand
        basic_count = trubbish + other_basic
        if not basic_count:
            continue
        # If exactly one Basic appears in eight cards, it must be among
        # the first seven. Other arrangements all have a valid opener.
        opener_weight = opener if basic_count == 1 else seen
        hand_ways = 1
        for count, selected in zip(numbers, hand):
            hand_ways *= comb(count, selected)
        denominator += hand_ways * opener_weight * prize_total
        if not ((shake and trubbish and tool) or
                (box and shake) or (box and (trubbish or quick))):
            continue
        hand_compositions += 1
        left = tuple(count - selected for count, selected in zip(numbers, hand))
        unconstrained = left[0] + left[6] + left[7]
        for p in product(*(range(min(left[j], prizes) + 1)
                           for j in (1, 2, 3, 4, 5))):
            used = sum(p)
            if used > prizes or prizes - used > unconstrained:
                continue
            prize_compositions += 1
            prize_ways = comb(unconstrained, prizes - used)
            for j, used_j in zip((1, 2, 3, 4, 5), p):
                prize_ways *= comb(left[j], used_j)
            shake_deck = left[1] > p[0]
            trubbish_deck = left[2] > p[1]
            quick_deck = left[3] > p[2]
            tool_deck = left[4] > p[3]
            garbodor_deck = left[5] > p[4]
            direct = bool(shake and trubbish and tool and garbodor_deck)
            held_shake = bool(
                box and shake and garbodor_deck and (tool or tool_deck) and
                (trubbish or (trubbish_deck and (quick or quick_deck))))
            # When Box obtains the singleton Shake, the Item slot cannot
            # simultaneously obtain Quick Ball: it must already be held
            # unless Trubbish was directly seen.
            fetched_shake = bool(
                box and not shake and shake_deck and garbodor_deck and
                (tool or tool_deck) and
                (trubbish or (quick and trubbish_deck)))
            flags = (
                direct, held_shake, fetched_shake,
                fetched_shake and bool(trubbish),
                fetched_shake and not trubbish,
                direct or held_shake or fetched_shake,
                direct and held_shake,
            )
            unit = hand_ways * opener_weight * prize_ways
            for key, match in zip(ROUTES, flags):
                if match:
                    totals[key] += unit
    return {
        "basic_valid_seven": Fraction(
            comb(size, opener) - comb(size - numbers[2] - numbers[6], opener),
            comb(size, opener)),
        "conditional": {key: Fraction(num, denominator)
                        for key, num in totals.items()},
        "hand_compositions": hand_compositions,
        "prize_compositions": prize_compositions,
    }


def main():
    result = exact_opportunities(original_rank8_categories())
    print("Exact rank-8 first-draw resource access, conditional on Basic-valid seven:")
    for name, value in result["conditional"].items():
        print(f"{name}: {value} = {float(value):.10%}")
    print("Valid seven:", result["basic_valid_seven"])
    print("Access opportunities only; no gameplay win or lock rates.")
    return result


if __name__ == "__main__":
    main()
