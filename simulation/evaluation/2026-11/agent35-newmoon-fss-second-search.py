#!/usr/bin/env python3
"""Forest Seal Stone second-search extension for New Moon Lockbreaker v1."""
from fractions import Fraction
from math import comb
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[3]
VARIANT_PATH = ROOT / "results/als/new-moon-lockbreak-english-proxy-60.json"
# Articuno V, FSS, Adventure Bag, Secret Box, Field Blower, Cologne,
# other Basics, other non-Basics.
CAPACITY = [1, 1, 1, 1, 2, 2, 16, 36]


def choose0(n, k):
    return comb(n, k) if n >= 0 and k >= 0 and k <= n else 0


def choose_product(capacity, vector):
    out = 1
    for n, k in zip(capacity, vector):
        out *= comb(n, k)
    return out


def compositions(capacity, total, index=0, prefix=()):
    if index == len(capacity) - 1:
        if 0 <= total <= capacity[index]:
            yield prefix + (total,)
        return
    for n in range(min(total, capacity[index]) + 1):
        yield from compositions(capacity, total - n, index + 1, prefix + (n,))


def prize_sets_avoiding_all_copies(remaining, required):
    total_remaining = sum(remaining)
    good = 0
    for mask in range(1 << len(required)):
        removed = 0
        sign = 1
        for j, category in enumerate(required):
            if mask & (1 << j):
                removed += remaining[category]
                sign *= -1
        good += sign * choose0(total_remaining - removed, 6 - removed)
    return good


def route_for_hand(hand, mode):
    # Indices: Articuno, FSS, Adventure Bag, Secret Box, Blower, Cologne.
    articuno, fss, adventure_bag, secret_box, blower, cologne = hand[:6]
    if blower > 0 and cologne > 0:
        return [], "direct_both"

    if blower > 0 and cologne == 0:
        if secret_box > 0:
            return [5], "secret_box_one_direct"
        if articuno > 0 and fss > 0:
            return [5], "fss_one_direct"
        if articuno > 0 and adventure_bag > 0 and fss == 0:
            return [5, 1], "adventure_bag_fss_one_direct"
        return None, None

    if cologne > 0 and blower == 0:
        if secret_box > 0:
            return [4], "secret_box_one_direct"
        if mode == "conditional_garbotoxin":
            # These routes require Star Alchemy to find Field Blower while
            # Garbotoxin is still live; they are excluded from the sequenced
            # estimate because that exact interaction lacks a direct ruling.
            if articuno > 0 and fss > 0:
                return [4], "fss_garbotoxin_conditional"
            if articuno > 0 and adventure_bag > 0 and fss == 0:
                return [4, 1], "adventurebag_fss_garbotoxin_conditional"
        return None, None

    if secret_box > 0 and articuno > 0:
        # Secret Box searches Field Blower (Item) + FSS (Tool); play Blower
        # first, then attach/use FSS and Star Alchemy for Canceling Cologne.
        return [4, 5] + ([] if fss > 0 else [1]), "secret_box_fss_two_search"

    return None, None


def joint_access_by_draws(draws, mode="baseline"):
    observed = 7 + draws
    valid_openings = comb(60, 7) - comb(43, 7)
    denominator = valid_openings * comb(53, 6) * comb(47, draws)
    totals = {}
    composition_total = 0

    for hand in compositions(CAPACITY, observed):
        ways = choose_product(CAPACITY, hand)
        if not ways:
            continue
        basics = hand[0] + hand[6]
        valid_initial_subsets = comb(observed, 7) - choose0(observed - basics, 7)
        if valid_initial_subsets == 0:
            continue
        weight = ways * valid_initial_subsets
        remaining = [n - k for n, k in zip(CAPACITY, hand)]
        prize_sets = comb(60 - observed, 6)
        composition_total += weight * prize_sets

        if mode == "baseline":
            _, _, _, secret_box, blower, cologne = hand[:6]
            if blower > 0 and cologne > 0:
                required, route = [], "direct_both"
            elif secret_box > 0 and ((blower > 0 and cologne == 0) or (cologne > 0 and blower == 0)):
                required, route = ([5], "secret_box_one_direct") if blower > 0 else ([4], "secret_box_one_direct")
            else:
                continue
        else:
            required, route = route_for_hand(hand, mode)
            if required is None:
                continue

        good_prizes = prize_sets_avoiding_all_copies(remaining, required)
        totals[route] = totals.get(route, 0) + weight * good_prizes

    assert composition_total == denominator, (composition_total, denominator)
    return {k: Fraction(v, denominator) for k, v in totals.items()}



def single_cologne_by_draws(draws, include_fss=True):
    # Articuno, FSS, Adventure Bag, Secret Box, Cologne, other Basics, other non-Basics.
    capacity = [1, 1, 1, 1, 2, 16, 38]
    observed = 7 + draws
    valid_openings = comb(60, 7) - comb(43, 7)
    denominator = valid_openings * comb(53, 6) * comb(47, draws)
    totals = {}
    composition_total = 0
    for hand in compositions(capacity, observed):
        ways = choose_product(capacity, hand)
        if not ways:
            continue
        basics = hand[0] + hand[5]
        valid_initial_subsets = comb(observed, 7) - choose0(observed - basics, 7)
        if valid_initial_subsets == 0:
            continue
        weight = ways * valid_initial_subsets
        remaining = [n - k for n, k in zip(capacity, hand)]
        prize_sets = comb(60 - observed, 6)
        composition_total += weight * prize_sets
        articuno, fss, adventure_bag, secret_box, cologne = hand[:5]
        if cologne > 0:
            required, route = [], "direct"
        elif secret_box > 0:
            required, route = [4], "secret_box"
        elif include_fss and articuno > 0 and fss > 0:
            required, route = [4], "fss_direct"
        elif include_fss and articuno > 0 and adventure_bag > 0 and fss == 0:
            required, route = [4, 1], "adventure_bag_fss"
        else:
            continue
        good_prizes = prize_sets_avoiding_all_copies(remaining, required)
        totals[route] = totals.get(route, 0) + weight * good_prizes
    assert composition_total == denominator, (composition_total, denominator)
    return {k: Fraction(v, denominator) for k, v in totals.items()}

def bonus_distribution(opponent_basics=4, candidate_basics=17):
    p_opponent = Fraction(comb(60 - opponent_basics, 7), comb(60, 7))
    p_candidate = Fraction(comb(60 - candidate_basics, 7), comb(60, 7))
    normalizer = 1 - p_opponent * p_candidate
    weights = []
    for k in range(47):
        if k == 0:
            weight = (1 - p_opponent) / normalizer
        else:
            weight = ((1 - p_opponent) * (1 - p_candidate) * p_opponent**k) / normalizer
        weights.append((k, weight))
    tail = ((1 - p_candidate) * p_opponent**47) / normalizer
    assert sum((w for _, w in weights), Fraction(0)) + tail == 1
    return weights, tail


def average_mulligan_access(mode):
    weights, tail = bonus_distribution()
    average = Fraction(0)
    for k, weight in weights:
        access = sum(joint_access_by_draws(min(k + 1, 47), mode).values(), Fraction(0))
        average += weight * access
    average += tail * sum(joint_access_by_draws(47, mode).values(), Fraction(0))
    return average



def average_single_cologne_access(include_fss=True):
    weights, tail = bonus_distribution()
    average = Fraction(0)
    for k, weight in weights:
        access = sum(single_cologne_by_draws(min(k + 1, 47), include_fss).values(), Fraction(0))
        average += weight * access
    average += tail * sum(single_cologne_by_draws(47, include_fss).values(), Fraction(0))
    return average

def display(value):
    return {
        "numerator": str(value.numerator),
        "denominator": str(value.denominator),
        "probability": float(value),
        "percent": float(value) * 100,
    }


def main():
    variant = json.loads(VARIANT_PATH.read_text(encoding="utf-8"))
    assert variant["canonical_id_count_sha256"] == "a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4"
    assert variant["counts"]["total"] == 60 and variant["counts"]["Pokémon"] == 19
    copies = lambda name: sum(x["count"] for x in variant["entries"] if x["name_en"] == name)
    assert copies("Dusclops") == 2 and copies("Galarian Articuno V") == 1
    assert copies("Adventure Bag") == 1 and copies("Secret Box") == 1
    assert copies("Forest Seal Stone") == 1
    assert copies("Field Blower") == 2 and copies("Canceling Cologne") == 2
    assert variant["counts"]["Pokémon"] - copies("Dusclops") == 17

    baseline = joint_access_by_draws(1, "baseline")
    sequenced = joint_access_by_draws(1, "sequenced")
    conditional = joint_access_by_draws(1, "conditional_garbotoxin")
    baseline_direct = baseline["direct_both"]
    baseline_secret = sum(baseline.values(), Fraction(0))
    sequenced_total = sum(sequenced.values(), Fraction(0))
    conditional_total = sum(conditional.values(), Fraction(0))

    assert baseline_direct == Fraction(58575077, 1103593454)
    assert baseline_secret == Fraction(11937071285, 121947076667)
    assert sequenced_total == Fraction(1910501756841, 17072590733380)
    assert conditional_total == Fraction(496808163647, 4268147683345)

    baseline_all = average_mulligan_access("baseline")
    sequenced_all = average_mulligan_access("sequenced")
    conditional_all = average_mulligan_access("conditional_garbotoxin")
    assert abs(float(baseline_all) - 0.1376658266262376) < 1e-12
    assert abs(float(sequenced_all) - 0.1566315576021516) < 1e-12
    assert abs(float(conditional_all) - 0.1638864630836383) < 1e-12

    cologne_baseline = single_cologne_by_draws(1, include_fss=False)
    cologne_extended = single_cologne_by_draws(1, include_fss=True)
    cologne_baseline_total = sum(cologne_baseline.values(), Fraction(0))
    cologne_extended_total = sum(cologne_extended.values(), Fraction(0))
    cologne_baseline_all = average_single_cologne_access(include_fss=False)
    cologne_extended_all = average_single_cologne_access(include_fss=True)
    assert cologne_baseline_total == Fraction(169801946, 493712861)
    assert cologne_extended_total == Fraction(891378184669, 2438941533340)
    assert abs(float(cologne_baseline_all) - 0.3953819465998576) < 1e-12
    assert abs(float(cologne_extended_all) - 0.4224545561530402) < 1e-12

    return {
        "candidate": {
            "canonical_id_count_sha256": variant["canonical_id_count_sha256"],
            "basics": 17,
            "field_blower": 2,
            "cologne": 2,
            "secret_box": 1,
            "forest_seal_stone": 1,
            "galarian_articuno_v": 1,
            "adventure_bag": 1,
        },
        "first_mandatory_draw": {
            "baseline_direct": display(baseline_direct),
            "baseline_secret_box_upper_bound": display(baseline_secret),
            "sequenced_fss_routes": {k: display(v) for k, v in sequenced.items()},
            "sequenced_fss_total": display(sequenced_total),
            "sequenced_increment": display(sequenced_total - baseline_secret),
            "conditional_garbotoxin_total": display(conditional_total),
        },
        "single_counter_cologne_access_vs_iron_thorns": {
            "baseline_direct_plus_secret_box": display(cologne_baseline_total),
            "sequenced_fss_routes": {k: display(v) for k, v in cologne_extended.items()},
            "sequenced_total": display(cologne_extended_total),
            "sequenced_increment": display(cologne_extended_total - cologne_baseline_total),
            "all_optional_mulligan_bonus_baseline": display(cologne_baseline_all),
            "all_optional_mulligan_bonus_with_fss": display(cologne_extended_all),
        },
        "all_optional_four_basic_opponent_mulligan_bonuses": {
            "baseline_secret_box_upper_bound": display(baseline_all),
            "sequenced_fss_total": display(sequenced_all),
            "sequenced_increment": display(sequenced_all - baseline_all),
            "conditional_fss_total": display(conditional_all),
        },
        "interpretation": (
            "Access upper bound only. The sequenced route plays Field Blower before attaching/using Forest Seal Stone, "
            "so it does not require Star Alchemy to function while Garbotoxin is live. It still assumes Star Alchemy "
            "functions under Iron Thorns, supported by but not directly ruled by the located Path/Spiritomb FAQ. "
            "Secret Box/Adventure Bag costs, Articuno search/board placement, and all other hand/board constraints are unmodeled. "
            "The Item routes assume no AOR3/Budew Item lock; those effects prevent Secret Box, Adventure Bag and Field Blower from being played."
        ),
    }


if __name__ == "__main__":
    print(json.dumps(main(), indent=2))
