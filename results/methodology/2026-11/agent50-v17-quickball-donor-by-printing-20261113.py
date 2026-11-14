#!/usr/bin/env python3
"""Exact order-aware Quick Ball donor exposure for Hood Shadow Rider v1.

Counts unordered six-card subsets after fixing the unique Quick Ball, then
integrates over uniformly random hand orders. The selector chooses the first
physical card in hand order whose non-Energy printing is duplicated; if no
non-Energy printing is duplicated, it chooses Psychic Energy. This is a
selection-frequency model, not a card-value or game-strength model.
"""
from collections import defaultdict
from fractions import Fraction
from math import comb
import json

# (printing, copies, is_basic, is_energy, donor_category)
CARDS = [
    ("Shadow Rider Calyrex V", 4, True, False, "Basic Pokémon"),
    ("Lillie's Clefairy ex", 2, True, False, "Basic Pokémon"),
    ("Tapu Lele-GX", 1, True, False, "Basic Pokémon"),
    ("Trevenant & Dusknoir-GX", 1, True, False, "Basic Pokémon"),
    ("Latias ex", 1, True, False, "Basic Pokémon"),
    ("Dialga-GX", 1, True, False, "Basic Pokémon"),
    ("Mimikyu", 1, True, False, "Basic Pokémon"),
    ("Girafarig", 1, True, False, "Basic Pokémon"),
    ("Marshadow", 1, True, False, "Basic Pokémon"),
    ("Radiant Eternatus", 1, True, False, "Basic Pokémon"),
    ("Shadow Rider Calyrex VMAX", 4, False, False, "Evolution"),
    ("Lillie's Determination", 2, False, False, "Supporter"),
    ("Iono", 1, False, False, "Supporter"),
    ("Teammates", 1, False, False, "Supporter"),
    ("Raihan", 1, False, False, "Supporter"),
    ("Acerola", 1, False, False, "Supporter"),
    ("Guzma", 1, False, False, "Supporter"),
    ("Mysterious Treasure", 4, False, False, "Search Item"),
    ("Fog Crystal", 4, False, False, "Search Item"),
    ("VS Seeker", 2, False, False, "Search Item"),
    ("Hisuian Heavy Ball", 1, False, False, "Other Item"),
    ("Battle Compressor Team Flare Gear", 1, False, False, "Other Item"),
    ("Field Blower", 1, False, False, "Other Item"),
    ("Night Stretcher", 1, False, False, "Other Item"),
    ("Unfair Stamp", 1, False, False, "Other Item"),
    ("Float Stone", 1, False, False, "Tool"),
    ("Forest Seal Stone", 1, False, False, "Tool"),
    ("Sky Field", 1, False, False, "Stadium"),
    ("Dimension Valley", 1, False, False, "Stadium"),
    ("Pokémon Ranger", 1, False, False, "Supporter"),
    ("Stealthy Hood", 2, False, False, "Tool"),
    ("Arven", 1, False, False, "Supporter"),
    ("Basic Psychic Energy", 11, False, True, "Energy"),
]
QUICK_BALL_COPIES = 1
HAND_AFTER_QUICK_BALL = 6
KEEPABLE_SEVEN_HANDS = 332_682_240
RAW_SEVEN_HANDS = 386_206_920
ROOT_ELIGIBLE_HANDS = 16_687_315


def subset_dp(groups, *, cap_per_group=None):
    """Count physical subsets by (cards, Basics, cards in duplicated non-Energy prints)."""
    states = {(0, 0, 0): 1}
    for _name, copies, is_basic, is_energy, _category in groups:
        maximum = min(copies, HAND_AFTER_QUICK_BALL)
        if cap_per_group is not None:
            maximum = min(maximum, cap_per_group)
        next_states = defaultdict(int)
        for (cards, basics, duplicated_nonenergy_cards), ways in states.items():
            for chosen in range(min(maximum, HAND_AFTER_QUICK_BALL - cards) + 1):
                next_cards = cards + chosen
                next_basics = basics + chosen * is_basic
                next_duplicates = duplicated_nonenergy_cards
                if chosen >= 2 and not is_energy:
                    next_duplicates += chosen
                next_states[(next_cards, next_basics, next_duplicates)] += ways * comb(copies, chosen)
        states = next_states
    return states


def expected_donor_equivalents(donor_index):
    """Expected selected hand-equivalents for one duplicated non-Energy printing."""
    _name, copies, is_basic, is_energy, _category = CARDS[donor_index]
    if is_energy or copies < 2:
        return Fraction(0)
    rest = CARDS[:donor_index] + CARDS[donor_index + 1 :]
    states = subset_dp(rest)
    result = Fraction(0)
    for chosen_donor in range(2, min(copies, HAND_AFTER_QUICK_BALL) + 1):
        physical_donor_subsets = comb(copies, chosen_donor)
        for (rest_cards, rest_basics, rest_duplicate_cards), ways in states.items():
            if rest_cards != HAND_AFTER_QUICK_BALL - chosen_donor:
                continue
            total_basics = rest_basics + chosen_donor * is_basic
            # One Basic is required for the Active; six Basics fill Active+Bench.
            if not (1 <= total_basics <= 5):
                continue
            total_duplicated_nonenergy_cards = rest_duplicate_cards + chosen_donor
            # The earliest card among all duplicated non-Energy physical cards
            # is uniformly distributed over that set under a random hand order.
            result += (
                physical_donor_subsets
                * ways
                * Fraction(chosen_donor, total_duplicated_nonenergy_cards)
            )
    return result


def energy_only_branch():
    """Count hands where Energy repeats but every non-Energy printing is unique."""
    nonenergy = [card for card in CARDS if not card[3]]
    unique_nonenergy_states = subset_dp(nonenergy, cap_per_group=1)
    energy_copies = next(card[1] for card in CARDS if card[3])
    result = 0
    for (nonenergy_cards, basics, duplicate_cards), ways in unique_nonenergy_states.items():
        assert duplicate_cards == 0
        energy_chosen = HAND_AFTER_QUICK_BALL - nonenergy_cards
        if energy_chosen >= 2 and 1 <= basics <= 5:
            result += ways * comb(energy_copies, energy_chosen)
    return result


def main():
    assert QUICK_BALL_COPIES == 1
    assert sum(card[1] for card in CARDS) + QUICK_BALL_COPIES == 60
    assert sum(card[1] for card in CARDS if card[2]) == 14

    by_printing = {}
    for index, card in enumerate(CARDS):
        if card[3] or card[1] < 2:
            continue
        value = expected_donor_equivalents(index)
        if value:
            by_printing[card[0]] = {"exact": value, "category": card[4]}

    energy = energy_only_branch()
    nonenergy = sum((item["exact"] for item in by_printing.values()), Fraction(0))
    total = nonenergy + energy
    assert energy == 9_134_158
    assert nonenergy == 7_553_157
    assert total == ROOT_ELIGIBLE_HANDS

    category_totals = defaultdict(Fraction)
    rows = []
    for name, item in sorted(by_printing.items(), key=lambda pair: pair[1]["exact"], reverse=True):
        value = item["exact"]
        category_totals[item["category"]] += value
        rows.append({
            "printing": name,
            "category": item["category"],
            "expected_hand_equivalents": f"{value.numerator}/{value.denominator}",
            "share_of_nonenergy_branch_pct": round(float(value / nonenergy) * 100, 6),
            "share_of_all_root_eligible_hands_pct": round(float(value / total) * 100, 6),
            "share_of_keepable_openers_pct": round(float(value / KEEPABLE_SEVEN_HANDS) * 100, 6),
            "share_of_raw_sevens_pct": round(float(value / RAW_SEVEN_HANDS) * 100, 6),
        })
    rows.append({
        "printing": "Basic Psychic Energy",
        "category": "Energy",
        "expected_hand_equivalents": str(energy),
        "share_of_nonenergy_branch_pct": None,
        "share_of_all_root_eligible_hands_pct": round(energy / total * 100, 6),
        "share_of_keepable_openers_pct": round(energy / KEEPABLE_SEVEN_HANDS * 100, 6),
        "share_of_raw_sevens_pct": round(energy / RAW_SEVEN_HANDS * 100, 6),
    })

    expected_categories = {
        "Basic Pokémon": Fraction(4_874_879, 2),
        "Evolution": Fraction(4_335_281, 3),
        "Search Item": Fraction(18_901_997, 6),
        "Supporter": Fraction(520_291, 2),
        "Tool": Fraction(520_291, 2),
    }
    assert dict(category_totals) == expected_categories
    print(json.dumps({
        "root_eligible_hands": str(total),
        "nonenergy_branch_hands": str(nonenergy),
        "energy_only_branch_hands": energy,
        "expected_donor_selection_by_printing": rows,
        "category_expected_hand_equivalents": {
            category: f"{value.numerator}/{value.denominator}"
            for category, value in category_totals.items()
        },
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
