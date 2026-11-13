#!/usr/bin/env python3
"""Exact opening-hand coverage for the v17 Quick Ball root in Hood Shadow Rider v1."""
from math import comb
import json

BASIC = {
    "Shadow Rider Calyrex V": 4,
    "Lillie's Clefairy ex": 2,
    "Tapu Lele-GX": 1,
    "Trevenant & Dusknoir-GX": 1,
    "Latias ex": 1,
    "Dialga-GX": 1,
    "Mimikyu": 1,
    "Girafarig": 1,
    "Marshadow": 1,
    "Radiant Eternatus": 1,
}
EVOLUTION = {"Shadow Rider Calyrex VMAX": 4}
TRAINERS = {
    "Lillie's Determination": 2,
    "Iono": 1,
    "Teammates": 1,
    "Raihan": 1,
    "Acerola": 1,
    "Guzma": 1,
    "Mysterious Treasure": 4,
    "Fog Crystal": 4,
    "VS Seeker": 2,
    "Hisuian Heavy Ball": 1,
    "Battle Compressor": 1,
    "Field Blower": 1,
    "Night Stretcher": 1,
    "Unfair Stamp": 1,
    "Float Stone": 1,
    "Forest Seal Stone": 1,
    "Sky Field": 1,
    "Dimension Valley": 1,
    "Pokemon Ranger": 1,
    "Stealthy Hood": 2,
    "Arven": 1,
}
ENERGY = {"Psychic Energy": 11}
QUICK_BALL = 1


def coefficient_at_most_one(counts, degree):
    """Coefficient of x**degree in product_i (1 + counts[i] * x)."""
    dp = [0] * (degree + 1)
    dp[0] = 1
    for count in counts:
        for k in range(degree, 0, -1):
            dp[k] += dp[k - 1] * count
    return dp[degree]


def no_duplicate_nonenergy_six(nonenergy_counts, energy_count=11):
    """Six-card subsets with at most one copy of each non-Energy print; Energy may repeat."""
    return sum(
        coefficient_at_most_one(nonenergy_counts, 6 - energy_n)
        * comb(energy_count, energy_n)
        for energy_n in range(7)
    )


assert sum(BASIC.values()) == 14
assert sum(EVOLUTION.values()) == 4
assert sum(TRAINERS.values()) == 30
assert sum(ENERGY.values()) == 11
assert QUICK_BALL + sum(BASIC.values()) + sum(EVOLUTION.values()) + sum(TRAINERS.values()) + sum(ENERGY.values()) == 60

total_7 = comb(60, 7)
keepable_7 = total_7 - comb(46, 7)

after_quickball = list(BASIC.values()) + list(EVOLUTION.values()) + list(TRAINERS.values()) + list(ENERGY.values())
assert sum(after_quickball) == 59
all_six = comb(59, 6)
no_basic_six = comb(45, 6)
all_distinct_six = coefficient_at_most_one(after_quickball, 6)
nonbasic_nonenergy_print_counts = list(EVOLUTION.values()) + list(TRAINERS.values())
nonbasic_print_counts = nonbasic_nonenergy_print_counts + list(ENERGY.values())
all_distinct_no_basic_six = coefficient_at_most_one(nonbasic_print_counts, 6)
all_six_basic = comb(14, 6)
all_six_basic_distinct = coefficient_at_most_one(list(BASIC.values()), 6)
all_six_basic_duplicate = all_six_basic - all_six_basic_distinct

# All-distinct six-Basic hands were already removed by all_distinct_six.
quickball_root_hands = all_six - no_basic_six - all_distinct_six + all_distinct_no_basic_six - all_six_basic_duplicate

nonenergy_print_counts = list(BASIC.values()) + list(EVOLUTION.values()) + list(TRAINERS.values())
no_dup_nonenergy_all = no_duplicate_nonenergy_six(nonenergy_print_counts)
no_dup_nonenergy_no_basic = no_duplicate_nonenergy_six(nonbasic_nonenergy_print_counts)
all_basic_no_dup_nonenergy = coefficient_at_most_one(list(BASIC.values()), 6)
no_dup_nonenergy_valid = no_dup_nonenergy_all - no_dup_nonenergy_no_basic - all_basic_no_dup_nonenergy
all_distinct_valid = all_distinct_six - all_distinct_no_basic_six - all_basic_no_dup_nonenergy
energy_only_duplicate_hands = no_dup_nonenergy_valid - all_distinct_valid
nonenergy_duplicate_hands = quickball_root_hands - energy_only_duplicate_hands

exact_fixture_hands = comb(4, 1) * comb(11, 3)

assert quickball_root_hands == 16_687_315
assert energy_only_duplicate_hands == 9_134_158
assert nonenergy_duplicate_hands == 7_553_157
assert exact_fixture_hands == 660

result = {
    "opening_hands_total": total_7,
    "opening_hands_keepable": keepable_7,
    "exact_v17_fixture_hand_combinations": exact_fixture_hands,
    "exact_v17_fixture_hand_probability_unconditional": exact_fixture_hands / total_7,
    "exact_v17_fixture_hand_probability_given_keepable": exact_fixture_hands / keepable_7,
    "quickball_root_eligible_keepable_hands": quickball_root_hands,
    "quickball_root_probability_given_keepable": quickball_root_hands / keepable_7,
    "quickball_root_probability_unconditional": quickball_root_hands / total_7,
    "eligible_hands_with_nonenergy_duplicate": nonenergy_duplicate_hands,
    "eligible_hands_with_only_energy_duplicate": energy_only_duplicate_hands,
    "nonenergy_duplicate_share_of_eligible": nonenergy_duplicate_hands / quickball_root_hands,
    "energy_only_duplicate_share_of_eligible": energy_only_duplicate_hands / quickball_root_hands,
}
print(json.dumps(result, indent=2, sort_keys=True))
