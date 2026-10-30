"""Exact original rank8 first-turn Boost Shake access via printed Item connectors.

Model a Basic-valid original seven, one normal draw, and six random Prizes.
All rates are necessary-card access events, not legal-action or win frequencies.
"""
from fractions import Fraction
from itertools import product
from math import comb
from pathlib import Path
import json

SOURCE = Path(__file__).resolve().parents[1] / "results" / "aichi-2026" / "full-decklists.json"
ROUTES = (
    "held_shake_with_hand_search_connectors",
    "both_box_and_shake_with_item_search_connector",
    "box_fetches_shake_with_held_basic_search_connector",
    "union_extended_connectors",
    "union_minimal_connectors",
)


def original_categories(source=SOURCE):
    """Read source rank8 and assert the specific quantities being modeled."""
    source_data = json.loads(Path(source).read_text(encoding="utf-8"))
    deck = next(d for d in source_data["decks"] if d["rank"] == 8)
    assert (deck["player"], deck["archetype"]) == (
        "Yusuke Kobayashi", "Absol Garbodor")
    cards = deck["cards"]
    assert sum(c["count"] for c in cards) == 60
    counts = {c["name"]: c["count"] for c in cards}
    assert sum(c["count"] for c in cards if c["category"] == "Pokémon") == 12
    tools = counts["Float Stone"] + counts["Muscle Band"]
    other_basics = 12 - counts["Trubbish"] - counts["Garbodor"]
    categories = (
        counts["Secret Box"], counts["Boost Shake"], counts["Trubbish"],
        counts["Quick Ball"], counts["Ultra Ball"], counts["Battle VIP Pass"],
        counts["Adventure Bag"], tools, counts["Garbodor"], other_basics,
    )
    assert categories == (1, 1, 2, 4, 2, 2, 1, 5, 2, 8)
    return categories + (60 - sum(categories),)


def exact_connectivity(numbers, opener=7, prizes=6):
    """Exact initial-hand and Prize composition enumeration.

    Categories: Box, Shake, Trubbish, Quick Ball, Ultra Ball, VIP,
    Adventure Bag, compatible Tool, Garbodor, other Basic, all other.
    """
    assert len(numbers) == 11 and all(isinstance(x, int) and x >= 0
                                      for x in numbers)
    total = sum(numbers)
    seen = opener + 1
    assert 0 < opener and seen + prizes <= total
    denominator = 0
    numerators = {key: 0 for key in ROUTES}
    hand_compositions = prize_compositions = 0
    prize_indices = (1, 2, 3, 4, 5, 7, 8)
    total_prize_ways = comb(total - seen, prizes)
    for h in product(*(range(min(n, seen) + 1) for n in numbers)):
        if sum(h) != seen:
            continue
        box, shake, trub, qb, ultra, vip, bag, tool, _, other_basic, _ = h
        basic = trub + other_basic
        if basic == 0:
            continue
        # If eight cards contain only one Basic, it must be among the first
        # seven. This is exactly the 7/8 correction for opening validity.
        opener_weight = opener if basic == 1 else seen
        hand_ways = 1
        for count, held in zip(numbers, h):
            hand_ways *= comb(count, held)
        denominator += hand_ways * opener_weight * total_prize_ways
        if not (shake and (trub or qb or ultra or vip) or
                box and (trub or qb or ultra or vip or shake)):
            continue
        hand_compositions += 1
        left = [count - held for count, held in zip(numbers, h)]
        filler = left[0] + left[6] + left[9] + left[10]
        for prize in product(*(range(min(left[i], prizes) + 1)
                               for i in prize_indices)):
            used_total = sum(prize)
            if used_total > prizes or prizes - used_total > filler:
                continue
            prize_compositions += 1
            prize_ways = comb(filler, prizes - used_total)
            for i, used in zip(prize_indices, prize):
                prize_ways *= comb(left[i], used)
            shake_deck, trub_deck, qb_deck, ultra_deck, vip_deck, tool_deck, garbo_deck = (
                left[i] - used for i, used in zip(prize_indices, prize))
            g = garbo_deck > 0
            tool_access = tool > 0 or tool_deck > 0
            held_basic_search = qb > 0 or ultra > 0 or vip > 0
            deck_basic_search = qb_deck > 0 or ultra_deck > 0 or vip_deck > 0

            minimal_direct = bool(shake and trub and tool and g)
            minimal_both = bool(
                box and shake and g and tool_access and
                (trub or (trub_deck and (qb or qb_deck))))
            minimal_fetch = bool(
                box and not shake and shake_deck and g and tool_access and
                (trub or (qb and trub_deck)))

            # If Shake is held directly, a Basic search Item already in hand
            # can locate Trubbish. Adventure Bag held can search an unprized
            # Tool, since multiple Items may be played before Boost Shake.
            direct = bool(
                shake and g and
                (trub or (trub_deck and held_basic_search)) and
                (tool or (bag and tool_deck)))

            # With Shake held, Box may spend its Item category fetching
            # Quick Ball, Ultra Ball or Battle VIP Pass from the deck.
            both = bool(
                box and shake and g and tool_access and
                (trub or (trub_deck and
                          (held_basic_search or deck_basic_search))))

            # With Shake absent, Box's only Item slot fetches it. The
            # Basic-search card must therefore already be in hand.
            fetch = bool(
                box and not shake and shake_deck and g and tool_access and
                (trub or (trub_deck and held_basic_search)))
            flags = (
                direct, both, fetch, direct or both or fetch,
                minimal_direct or minimal_both or minimal_fetch,
            )
            unit = hand_ways * opener_weight * prize_ways
            for key, flag in zip(ROUTES, flags):
                if flag:
                    numerators[key] += unit
    return {
        "basic_valid_seven": Fraction(
            comb(total, opener) -
            comb(total - numbers[2] - numbers[9], opener),
            comb(total, opener)),
        "conditional": {key: Fraction(n, denominator)
                        for key, n in numerators.items()},
        "first_seen_compositions": hand_compositions,
        "prize_compositions": prize_compositions,
    }


def main():
    result = exact_connectivity(original_categories())
    for key, value in result["conditional"].items():
        print(f"{key}: {value} = {float(value):.10%}")
    print("Basic-valid seven:", result["basic_valid_seven"])
    print("Card-access-only, without discard utility, native play or game outcomes.")
    return result


if __name__ == "__main__":
    main()
