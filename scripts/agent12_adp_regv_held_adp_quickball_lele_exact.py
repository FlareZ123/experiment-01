"""Exact alternate ADP-in-opening RegV-start Quick Ball / Wonder Tag route.

On the unchanged ADP/Thorton/Regidrago v2 60, start with both ADP and
Regidrago V in the original seven, choose RegV Active and KEEP ADP in hand.
T1 Quick Ball discards a real held ADP, searches the singleton Tapu Lele-GX,
and benches it to activate Wonder Tag for an actual deck Thorton. Battle
Compressor discards M Charizard-EX. After attaching DDE and Thorton
RegV -> ADP, enhanced Altered Creation-GX is resource-feasible going second.
T2 draws one card, uses a held/drawn Thorton or held/drawn VS Seeker to
swap discarded original RegV back, evolves into a held VSTAR, attaches a
held Basic Grass/Fire, and can Apex copy the previously discarded donor.

This is intentionally disjoint from the RegV starter first-seven WITHOUT
ADP models. No T2 Ultra Ball, other tutors, abilities beyond Wonder Tag,
opposing action, paper lock, Pokémon Checkup, native attack or game wins.
The fixed candidate manifest SHA is verified before evaluating.

Exact six Prize cards and real deck target removals: Lele, M Charizard
and the fetched T1 Thorton each depart deck before T2 ninth ordinary draw.
"""
import json
from collections import defaultdict
from fractions import Fraction
from math import comb

from agent12_adp_pokegear_exact_supporter import (
    MANIFEST, load_counts, choose, compositions,
)

A, R, D, C, Q, L, T, S, V, E, M, X = range(12)
EXPECTED_DECK = (2, 3, 4, 4, 3, 1, 4, 1, 3, 7, 1, 27)
EXPECTED_FIRST_EIGHT_STATES = 314
EXPECTED_T1 = Fraction(117426744227133, 62599311344897600)
EXPECTED_T2 = Fraction(15871047093, 447137938177840)


def counts():
    load_counts()  # Validates exact canonical printed fixed-60 SHA.
    cards = json.loads(MANIFEST.read_text(encoding="utf-8"))["cards"]
    owned = {r["id"]: r["count"] for r in cards}
    named = [
        owned["sm12-156"], owned["swsh12-135"], owned["xy6-97"],
        owned["xy4-92"], owned["swsh1-179"], owned["sm2-60"],
        owned["swsh11-167"], owned["xy4-109"], owned["swsh12-136"],
        owned["swsh12pt5-152"] + owned["swsh12pt5-153"],
        owned["xy2-69"],
    ]
    named.append(60 - sum(named))
    result = tuple(named)
    assert result == EXPECTED_DECK
    return result


def first_eight_weights(deck):
    result = defaultdict(int)
    for seven in compositions(7, deck):
        # Starting Regidrago with an opening ADP deliberately kept in hand.
        if not seven[A] or not seven[R]:
            continue
        weight = 1
        for population, observed in zip(deck, seven):
            weight *= choose(population, observed)
        for k, total in enumerate(deck):
            ways = total - seven[k]
            if not ways:
                continue
            eight = list(seven)
            eight[k] += 1
            if eight[D] and eight[C] and eight[Q]:
                result[tuple(eight)] += weight * ways
    assert len(result) == EXPECTED_FIRST_EIGHT_STATES
    return result


def analyze():
    deck = counts()
    seven_valid = comb(60, 7) - comb(53, 7)
    assert seven_valid == 232063840
    denominator = seven_valid * 53 * comb(52, 6)
    assert denominator == 250397245379590400
    t1_mass = 0
    t2_mass = 0
    t2_by_supporter_route = defaultdict(int)

    for eight, first_weight in first_eight_weights(deck).items():
        pool = tuple(total - observed for total, observed in zip(deck, eight))
        assert sum(pool) == 52
        # Lele and M Charizard are exact singletons. If either was in
        # first-eight hand or six Prize cards, neither search can succeed.
        if pool[L] != 1 or pool[M] != 1:
            continue
        t = pool[T]
        # Fix how many of the deck Thortons are prized, and leave one
        # unprized for genuine Wonder Tag retrieval after Quick Ball.
        for prized_t in range(min(6, t - 1) + 1):
            # Choose T Prizes and remaining Prizes from everything except
            # singleton Lele, singleton M and all deck Thortons.
            prize_ways = choose(t, prized_t) * choose(50 - t, 6 - prized_t)
            assert prize_ways > 0
            t1_mass += first_weight * prize_ways

            # The physical deck after Prizes has 46; remove exactly
            # Lele (Quick Ball), Thorton (Wonder Tag) and M (Compressor).
            # Thus T2 natural draw is from 43 actual remaining cards.
            other_population = 50 - t
            for ninth in range(len(deck)):
                if ninth in (L, M):
                    continue
                if ninth == T:
                    ninth_ways = prize_ways * (t - prized_t - 1)
                else:
                    # Count physically not-Prized copies in the otherwise
                    # arbitrary six-card Prize sample.
                    ninth_ways = (
                        choose(t, prized_t) * pool[ninth] *
                        choose(other_population - 1, 6 - prized_t)
                    )
                if ninth_ways == 0:
                    continue
                if not (eight[E] or ninth == E):
                    continue
                if not (eight[V] or ninth == V):
                    continue
                if eight[T]:
                    support_route = "held-second-Thorton"
                elif eight[S]:
                    support_route = "held-VS-Seeker"
                elif ninth in (T, S):
                    support_route = "ninth-drawn-Thorton-or-VS"
                else:
                    continue
                mass = first_weight * ninth_ways
                t2_mass += mass
                t2_by_supporter_route[support_route] += mass

    t1 = Fraction(t1_mass, denominator)
    t2 = Fraction(t2_mass, denominator * 43)
    assert t1 == EXPECTED_T1, (t1, EXPECTED_T1)
    assert t2 == EXPECTED_T2, (t2, EXPECTED_T2)
    assert sum(t2_by_supporter_route.values()) == t2_mass
    result = {
        "fixed_manifest_sha": "bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b",
        "basic_valid_seven_count": seven_valid,
        "first_eight_states": EXPECTED_FIRST_EIGHT_STATES,
        "t1_resource_percent": 100 * float(t1),
        "t1_to_t2_resource_percent": 100 * float(t2),
        "t1_fraction": str(t1),
        "t2_fraction": str(t2),
        "t2_supporter_breakdown_percent": {
            key: 100 * float(Fraction(mass, denominator * 43))
            for key, mass in sorted(t2_by_supporter_route.items())
        },
        "native_games": 0,
        "competitively_qualified_games": 0,
    }
    for key, value in result.items():
        print(key, value)
    return result


if __name__ == "__main__":
    analyze()
