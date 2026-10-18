"""Source-60 early Tool-removal opportunity with Stone and Arven.

Rank 11 has already established Tool-equipped Garbodor and goes first.
Candidate rank1 or Hood Shield v1 acts second on its first turn. This
pure opportunity model includes Forest Seal Stone's Tool-provided Star
Alchemy as an available route despite Pokemon Ability suppression
(e.g. Garbotoxin), provided the Tool slot is free and VSTAR unused.
This card-text distinction is supported by the official Japanese Q&A
on Spiritomb's analogous 'Pokemon V have no Abilities' effect:
https://www.pokemon-card.com/rules/faq/search.php?freeword=%E6%A3%AE%E3%81%AE%E5%B0%81%E5%8D%B0%E7%9F%B3&regulation_faq_main_item1=all
A specific Garbotoxin Store action / ruling remains an independent gate.
No policy, optional draws, card search connectors or win rates modeled.
"""
from fractions import Fraction
from math import comb

# Shadow Rider V, other Basic, Field Blower, Arven, Forest Seal Stone,
# Stealthy Hood, all remaining non-Basic.
SOURCE_COUNTS = {
    "source_champion_rank1": (3, 11, 1, 0, 1, 0, 44),
    "hood_shield_v1": (4, 10, 1, 1, 1, 2, 41),
}
assert all(sum(counts) == 60 for counts in SOURCE_COUNTS.values())


def compositions(cards, at=0, remaining=8, seen=()):
    if at == len(cards):
        if remaining == 0:
            yield seen
        return
    for k in range(min(cards[at], remaining) + 1):
        yield from compositions(cards, at + 1, remaining - k, seen + (k,))


def exact_rates(cards):
    """Disjoint preference: direct Blower, then Arven, then Star Alchemy.

    All three distinct paths are feasible resources but not necessarily
    optimal plays. Each requires no opposing Item lock. When Field Blower
    is not seen in first eight, it must survive six random Prizes. A
    preexisting or Tool lock, a spent VSTAR power, a full V Tool slot,
    action sequencing and opponent hand disruption are excluded.
    """
    v_count, other_basic, blower_count, arven_count, stone_count, hood_count, other = cards
    assert sum(cards) == 60
    assert v_count in (3, 4) and v_count + other_basic == 14
    assert blower_count == 1 and stone_count == 1 and arven_count in (0, 1)
    tallies = dict.fromkeys(
        ("direct_blower", "additional_arven", "additional_stone", "union"), 0
    )
    all_prizes = comb(52, 6)
    unprized_blower = comb(51, 6)
    for seen in compositions(cards):
        v, other_start, blower, arven, stone, hood, rest = seen
        seen_basics = v + other_start
        if seen_basics == 0:
            continue
        ways = 7 if seen_basics == 1 else 8
        for count, observed in zip(cards, seen):
            ways *= comb(count, observed)

        if blower:
            tallies["direct_blower"] += ways * all_prizes
            tallies["union"] += ways * all_prizes
        elif arven:
            tallies["additional_arven"] += ways * unprized_blower
            tallies["union"] += ways * unprized_blower
        elif stone and v:
            tallies["additional_stone"] += ways * unprized_blower
            tallies["union"] += ways * unprized_blower

    normalizer = 8 * comb(60, 8) * all_prizes
    valid_opening = Fraction(comb(60, 7) - comb(46, 7), comb(60, 7))
    return {
        key: Fraction(value, normalizer) / valid_opening
        for key, value in tallies.items()
    }


if __name__ == "__main__":
    for name, cards in SOURCE_COUNTS.items():
        print(name)
        for key, p in exact_rates(cards).items():
            print(f"  {key}: {float(p)*100:.12f}% ({p})")
