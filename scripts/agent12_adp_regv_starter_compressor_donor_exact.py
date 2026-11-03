"""Regidrago V Active starter: T1 Thorton already discards Regidrago V.

Two-target Battle Compressor (ADP + M Charizard) versus redundant three-
target Compressor (ADP + Regidrago V + M Charizard) under the unchanged
Agent5 ADP/Thorton/Regidrago v2 60-card roster. An optional three-target
attack-portfolio variant replaces the redundant RegV with Hisuian Goodra
VSTAR (Rolling Iron). All values condition on a Basic-valid opening seven.

Going second; 7 opening, six joint physical Prizes, 1 natural draw T1,
1 natural draw T2; direct first Thorton, second Thorton or VS Seeker, Basic
Energy T2, held VSTAR or two-card-payable Ultra Ball. No opponent/policy.
"""
from collections import defaultdict
from functools import lru_cache
from fractions import Fraction
from math import comb
import json

from agent12_adp_pokegear_exact_supporter import (
    MANIFEST, load_counts, choose, compositions,
)

A, R, B, D, C, T, S, V, E, U, M, G, H, X = range(14)
EXPECTED = {
    (A, R, M): (4559614473439872, 10646586592294128, 43),
    (A, M): (4671131207262912, 10949566008382848, 44),
    (A, M, H): (3777443410213440, 9143066375072784, 43),
}


def counts():
    original = load_counts()  # Verifies manifest's canonical fixed-60 SHA.
    rows = json.loads(MANIFEST.read_text(encoding="utf-8"))["cards"]
    goodra = sum(
        int(row["count"]) for row in rows if row["id"] == "swsh11-136"
    )
    assert goodra == 1  # LOR 136, printed Rolling Iron
    result = original[:-1] + (goodra, original[-1] - goodra)
    assert result == (2, 3, 2, 4, 4, 4, 1, 3, 7, 4, 1, 2, 1, 22)
    return result


@lru_cache(maxsize=None)
def eligible_prize_subsets(pool, required):
    """Joint six-Prize subsets leaving every selected deck target unprized."""
    if any(pool[k] == 0 for k in required):
        return 0
    total = sum(pool)
    result = 0
    for mask in range(1 << len(required)):
        fully_prized = sum(
            pool[required[j]] for j in range(len(required))
            if mask & (1 << j)
        )
        result += (-1 if mask.bit_count() & 1 else 1) * choose(
            total - fully_prized, 6 - fully_prized
        )
    return result


@lru_cache(maxsize=None)
def weighted_t2_draw(pool, drawn, required, compressor_targets):
    """Joint subset/draw mass after actually removing 2 or 3 named targets.

    A drawn compressor-target category is reserved as the ordinary draw,
    rather than counting the physical target already sent to discard.
    """
    if pool[drawn] == 0:
        return 0
    remaining = list(pool)
    remaining[drawn] -= 1
    weighted = pool[drawn] * eligible_prize_subsets(
        tuple(remaining), tuple(k for k in required if k != drawn)
    )
    if drawn in compressor_targets:
        weighted -= eligible_prize_subsets(pool, required)
    assert weighted >= 0
    return weighted


def analyze():
    deck = counts()
    first_eights = defaultdict(int)
    for seven in compositions(7, deck):
        # Regidrago V is the real starting Active; ADP must start in deck.
        if seven[A] or not seven[R]:
            continue
        weight = 1
        for n, k in zip(deck, seven):
            weight *= choose(n, k)
        for eighth, n in enumerate(deck):
            options = n - seven[eighth]
            if options == 0:
                continue
            eight = list(seven)
            eight[eighth] += 1
            if all(eight[k] for k in (D, C, T)):
                first_eights[tuple(eight)] += weight * options

    valid_seven = choose(60, 7) - choose(53, 7)
    assert valid_seven == 232063840
    t1_denominator = valid_seven * 53 * comb(52, 6)
    assert t1_denominator == 250397245379590400

    observed = {}
    for targets in EXPECTED:
        t1_mass = 0
        t2_mass = 0
        for eight, weight in first_eights.items():
            pool = tuple(n - k for n, k in zip(deck, eight))
            assert sum(pool) == 52
            t1_mass += weight * eligible_prize_subsets(pool, targets)
            for drawn in range(len(deck)):
                if pool[drawn] == 0:
                    continue
                nine = list(eight)
                nine[drawn] += 1
                if not nine[E] or not (nine[T] >= 2 or nine[S]):
                    continue
                if nine[V]:
                    requirements = targets
                elif nine[U]:
                    # A deck VSTAR must survive for a physically payable
                    # Ultra Ball. The T2 hand has five physical cards.
                    requirements = targets + (V,)
                else:
                    continue
                t2_mass += weight * weighted_t2_draw(
                    pool, drawn, requirements, targets
                )

        expected_t1, expected_t2, t2_deck_size = EXPECTED[targets]
        assert t1_mass == expected_t1
        assert t2_mass == expected_t2
        t1_probability = Fraction(t1_mass, t1_denominator)
        t2_probability = Fraction(
            t2_mass, t1_denominator * t2_deck_size
        )
        observed[targets] = (t1_probability, t2_probability)
        print("compressor_targets", targets)
        print("T1_prize_valid_percentage", 100 * float(t1_probability))
        print("strict_T1_T2_percentage", 100 * float(t2_probability))
        print("T1_numerator", t1_mass)
        print("T2_numerator", t2_mass)
        print("T2_deck_draw_size", t2_deck_size)

    triple, double, goodra = (
        observed[(A, R, M)],
        observed[(A, M)],
        observed[(A, M, H)],
    )
    print("T1_two_target_gain_pp",
          100 * float(double[0] - triple[0]))
    print("strict_T2_two_target_gain_pp",
          100 * float(double[1] - triple[1]))
    print("T1_eligible_two_target_with_goodra_fraction",
          float(goodra[0] / double[0]))
    print("strict_T2_double_donor_vs_redundant_triple_ratio",
          float(goodra[1] / triple[1]))
    print("Basic_valid_seven", valid_seven)
    print("Rstarter_first_eight_states", len(first_eights))


if __name__ == "__main__":
    analyze()
