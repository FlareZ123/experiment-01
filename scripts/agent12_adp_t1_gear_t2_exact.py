"""Exact new T1 Pokégear-to-Thorton route on unchanged ADP/Regidrago v2.

This adds T1 Gear-assisted enhanced GX and its T2 follow-through to the
earlier direct-Thorton exact model. Conditional on a Basic-valid opening
seven, going second, one normal draw per turn, six jointly allocated Prizes,
and no opposing action. Costs must be paid with physical hand cards.
No search other than those explicitly modeled is allowed.
"""
from collections import defaultdict
from fractions import Fraction
from math import comb

from agent12_adp_pokegear_exact_supporter import (
    A, B, C, D, E, G, M, R, S, T, U, V,
    BASE_REQUIREMENTS,
    choose,
    compositions,
    load_counts,
    prize_count_fixed_thorton,
    weighted_ninth_draw,
)

TOP_43 = comb(43, 7)
TOP_41 = comb(41, 7)

# These are hard gates from the earlier exact, fixed-manifest computation.
PRIOR_T1_DIRECT = Fraction(
    7133590891308288, 250397245379590400
)
PRIOR_T1_T2_GEAR = Fraction(
    15569862465355492224445033663872,
    7836606921614801887896666834124800,
)
EXPECTED_T1_INCLUSIVE = Fraction(
    8772200857193557761100531966272,
    260010877800491112021262865638400,
)
EXPECTED_ADDED_T2 = Fraction(
    54495528845057066239431538213675362048,
    245513056070434872341803039719443960832000,
)


def first_eight_weights(counts):
    """Enumerate uniform ordered eighth draw, conditional on valid seven."""
    weights = defaultdict(int)
    valid_seven = 0
    for seven in compositions(7, counts):
        weight = 1
        for n, k in zip(counts, seven):
            weight *= choose(n, k)
        if not (seven[A] + seven[R] + seven[B]):
            continue
        valid_seven += weight
        if seven[A]:
            continue  # A non-ADP Basic is already the starting Active.
        for drawn, total in enumerate(counts):
            options = total - seven[drawn]
            if not options:
                continue
            eight = list(seven)
            eight[drawn] += 1
            if eight[C] and eight[D] and (eight[T] or eight[G]):
                weights[tuple(eight)] += weight * options
    assert valid_seven == 232063840
    return valid_seven, weights


def analyze():
    counts = load_counts()  # Verifies canonical fixed-60 SHA-256.
    valid_seven, first_eight = first_eight_weights(counts)
    t1_direct = 0
    t1_gear = 0
    added_t1_gear_t2 = 0
    route_numerators = defaultdict(int)

    # The T1 Gear probe is made after Compressor removes ADP, Regidrago V,
    # and Dragon M Charizard. The deck has 43 cards, of which t are Thorton.
    # On success one Thorton leaves the deck, leaving 42 for the T2 draw.
    # Failed Gear views return to a fully shuffled 43-card deck.
    for eight, first_weight in first_eight.items():
        pool = tuple(n - k for n, k in zip(counts, eight))
        assert sum(pool) == 52
        for prized_t in range(min(6, pool[T]) + 1):
            prize_ways = prize_count_fixed_thorton(
                pool, prized_t, BASE_REQUIREMENTS
            )
            if not prize_ways:
                continue
            if eight[T]:
                t1_direct += first_weight * prize_ways
                continue

            surviving_t = pool[T] - prized_t
            if not surviving_t:
                continue
            fail_first = comb(43 - surviving_t, 7)
            hit_first = TOP_43 - fail_first
            # Shared denominator TOP_43**2 for one or two Gear tries.
            hit_on_first_scaled = hit_first * TOP_43
            hit_on_second_scaled = (
                fail_first * hit_first if eight[G] == 2 else 0
            )
            t1_gear += first_weight * prize_ways * (
                hit_on_first_scaled + hit_on_second_scaled
            )

            for ninth in range(len(counts)):
                seen_v = eight[V] + int(ninth == V)
                seen_e = eight[E] + int(ninth == E)
                seen_u = eight[U] + int(ninth == U)
                if not seen_e or not (seen_v or seen_u):
                    continue
                # Ultra Ball requires a physically surviving deck VSTAR.
                requirements = (
                    BASE_REQUIREMENTS
                    if seen_v
                    else BASE_REQUIREMENTS + (V,)
                )
                ninth_ways = weighted_ninth_draw(
                    pool, ninth, prized_t, requirements
                )
                if ninth == T:
                    # Compressor removed A/R/M; T1 Gear also took one T.
                    ninth_ways -= prize_count_fixed_thorton(
                        pool, prized_t, requirements
                    )
                if not ninth_ways:
                    continue
                assert ninth_ways > 0

                # After one T1 Gear hit, five cards are present at the
                # beginning of T2: 8 - starter - DDE - Compressor - Gear
                # + searched Thorton - played Thorton + natural draw.
                # Ultra Ball can discard two other physical hand objects.
                direct_support = bool(eight[S] or ninth in (T, S))
                one_gear_available = bool(eight[G] == 2 or ninth == G)
                t_in_t2_deck = surviving_t - 1 - int(ninth == T)
                assert t_in_t2_deck >= 0
                t2_hit = TOP_41 - comb(41 - t_in_t2_deck, 7)
                first_route = (
                    TOP_41
                    if direct_support
                    else t2_hit if one_gear_available else 0
                )
                first_add = (
                    first_weight * ninth_ways
                    * hit_on_first_scaled * first_route
                )
                added_t1_gear_t2 += first_add
                route_numerators[
                    ("first_hit", "VSTAR" if seen_v else "Ultra",
                     "direct_support" if direct_support else "T2_Gear")
                ] += first_add

                # A second successful T1 Gear is only tried after one
                # failed first Gear. Four physical T2 hand cards remain,
                # making Ultra's two-card payment impossible. Both Gear
                # copies were used, so T2 Supporter must be direct/VS.
                if hit_on_second_scaled and seen_v and direct_support:
                    second_add = (
                        first_weight * ninth_ways
                        * hit_on_second_scaled * TOP_41
                    )
                    added_t1_gear_t2 += second_add
                    route_numerators[
                        ("second_hit", "VSTAR", "direct_support")
                    ] += second_add

    t1_denom = valid_seven * 53 * comb(52, 6)
    t1_inclusive = Fraction(
        t1_direct * TOP_43**2 + t1_gear,
        t1_denom * TOP_43**2,
    )
    t1_t2_added = Fraction(
        added_t1_gear_t2,
        t1_denom * 42 * TOP_43**2 * TOP_41,
    )
    assert Fraction(t1_direct, t1_denom) == PRIOR_T1_DIRECT
    assert t1_inclusive == EXPECTED_T1_INCLUSIVE
    assert t1_t2_added == EXPECTED_ADDED_T2
    combined = PRIOR_T1_T2_GEAR + t1_t2_added

    print("Fixed candidate SHA verified by imported loader.")
    print("Basic-valid opening seven count:", valid_seven)
    print("T1 direct Thorton percentage:", 100 * float(PRIOR_T1_DIRECT))
    print("T1 Gear-inclusive percentage:", 100 * float(t1_inclusive))
    print("T1 Gear absolute gain, percentage points:",
          100 * float(t1_inclusive - PRIOR_T1_DIRECT))
    print("Prior strict T1/T2 percentage:", 100 * float(PRIOR_T1_T2_GEAR))
    print("New T1 Gear to T2 contribution, percentage points:",
          100 * float(t1_t2_added))
    print("New strict T1/T2 percentage:", 100 * float(combined))
    print("New T1/T2 exact numerator:", combined.numerator)
    print("New T1/T2 exact denominator:", combined.denominator)
    for route, numerator in sorted(route_numerators.items()):
        percent = 100 * Fraction(
            numerator, t1_denom * 42 * TOP_43**2 * TOP_41
        )
        print("Route", route, "percentage points:", float(percent))


if __name__ == "__main__":
    analyze()
