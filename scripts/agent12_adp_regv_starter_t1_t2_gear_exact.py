"""Exact Regidrago-V-starter ADP/Thorton route with T1 and T2 Pokégear access.

The immutable Agent5 ADP v2 60 is loaded by the independently published
manifest-SHA-checking count loader. Conditional denominator: every Basic-valid
opening seven, the eight-card going-second opener, six physical Prize cards,
and exactly one T2 natural draw. Source cards are removed from the deck
before each Pokégear seven-card look. Hands pay their actual spent cards.

This enumerates mutually exclusive T1 routes: direct held Thorton, otherwise
one or two Pokégear looks for Thorton. T2 uses direct Thorton / VS Seeker,
otherwise up to two further Pokégear looks. Two T2 Gear tries are permitted
only when VSTAR is already held, because Ultra Ball would have insufficient
other cards to pay two discards. The same constraint applies when T1 Gear
required a failed look followed by a second successful look.

No opponent decisions, GX survival, lock, native engine, or game-win claims.
"""
from collections import defaultdict
from fractions import Fraction
from functools import lru_cache
from math import comb

from agent12_adp_regv_starter_compressor_donor_exact import (
    A, R, B, D, C, T, S, V, E, U, M, G, H, X, counts,
)
from agent12_adp_pokegear_exact_supporter import (
    choose, compositions, prize_count_fixed_thorton,
)

EXPECTED = {
    (A, M): {
        "direct_t1": 4671131207262912,
        "direct_t2": 10949566008382848,
        "gear_t1": Fraction(588589617660677331, 173426920701657022400),
        "gear_t2": Fraction(1515058693750313939, 11186036385256877944800),
        "direct_t2_gear": Fraction(91665221232318, 387113662280484425),
    },
    (A, M, H): {
        "direct_t1": 3777443410213440,
        "direct_t2": 9143066375072784,
        "gear_t1": Fraction(43719727718182153, 15766083700150638400),
        "gear_t2": Fraction(398784186233735017, 3393649516457424915600),
        "direct_t2_gear": Fraction(462318007482543, 2252297671450091200),
    },
}


@lru_cache(maxsize=None)
def t2_draw_mass(pool, drawn, prized_thorton, required, targets, t1_gear):
    """Joint Prize-and-physical-ninth-draw ways after chosen deck removals.

    Compressor removes one physical card per target category. In T1 Gear
    branches one extra Thorton is also removed from the deck and played.
    Fixing the Thorton Prize count prevents a phantom T2-drawn Thorton.
    """
    if pool[drawn] == 0:
        return 0
    reserved = list(pool)
    reserved[drawn] -= 1
    reserved = tuple(reserved)
    if drawn in targets:
        mass = pool[drawn] * prize_count_fixed_thorton(
            reserved, prized_thorton,
            tuple(k for k in required if k != drawn),
        ) - prize_count_fixed_thorton(
            pool, prized_thorton, required,
        )
    else:
        mass = pool[drawn] * prize_count_fixed_thorton(
            reserved, prized_thorton, required,
        )
    if drawn == T and t1_gear:
        mass -= prize_count_fixed_thorton(
            pool, prized_thorton, required,
        )
    assert mass >= 0
    return mass


def first_eight_weights(deck):
    """All viable RegV-start eight-card observations with exact multiplicity."""
    result = defaultdict(int)
    for seven in compositions(7, deck):
        if seven[A] or not seven[R]:
            continue
        weight = 1
        for n, k in zip(deck, seven):
            weight *= choose(n, k)
        for drawn, n in enumerate(deck):
            choices = n - seven[drawn]
            if not choices:
                continue
            eight = list(seven)
            eight[drawn] += 1
            if eight[D] and eight[C] and (eight[T] or eight[G]):
                result[tuple(eight)] += weight * choices
    assert len(result) == 3266
    return result


def analyze():
    deck = counts()  # Asserts unchanged printed 60 and SHA-256 manifest.
    valid_seven = comb(60, 7) - comb(53, 7)
    assert valid_seven == 232063840
    t1_denominator = valid_seven * 53 * comb(52, 6)
    assert t1_denominator == 250397245379590400
    first_eights = first_eight_weights(deck)
    results = {}

    for targets, expected in EXPECTED.items():
        # After the eight-card observation and six Prizes there are 46 cards.
        # Battle Compressor removes either two or three actual target cards.
        t1_deck_size = 46 - len(targets)
        t1_look = comb(t1_deck_size, 7)
        t2_deck_after_t1_search = t1_deck_size - 1
        t2_look_direct = comb(t1_deck_size - 1, 7)
        t2_look_gear = comb(t1_deck_size - 2, 7)

        direct_t1 = direct_t2 = t2_gear_after_direct = 0
        gear_t1 = t2_after_gear = 0
        direct_t2_gear_routes = defaultdict(int)
        gear_routes = defaultdict(int)

        for eight, first_weight in first_eights.items():
            pool = tuple(n - k for n, k in zip(deck, eight))
            assert sum(pool) == 52

            for prized_t in range(min(6, pool[T]) + 1):
                prize_ways = prize_count_fixed_thorton(
                    pool, prized_t, targets,
                )
                if not prize_ways:
                    continue

                # T1 held Thorton dominates using a Gear as a connector.
                if eight[T]:
                    direct_t1 += first_weight * prize_ways
                    for ninth in range(len(pool)):
                        if not pool[ninth]:
                            continue
                        nine = list(eight)
                        nine[ninth] += 1
                        if not nine[E] or not (nine[V] or nine[U]):
                            continue
                        required = targets if nine[V] else targets + (V,)
                        ways = t2_draw_mass(
                            pool, ninth, prized_t, required, targets, False,
                        )
                        if nine[T] >= 2 or nine[S]:
                            direct_t2 += first_weight * ways
                            continue

                        # A payable T2 Pokégear route only when no direct
                        # Thorton/VS remains. A second failed Gear burns the
                        # last Ultra Ball discard resource.
                        gears = min(nine[G], 2 if nine[V] else 1)
                        if not gears:
                            continue
                        available_t = pool[T] - prized_t - (ninth == T)
                        fail = choose(
                            t1_deck_size - 1 - available_t, 7,
                        )
                        hit_scaled = (
                            t2_look_direct ** 2
                            - fail ** gears
                            * t2_look_direct ** (2 - gears)
                        )
                        paid = first_weight * ways * hit_scaled
                        t2_gear_after_direct += paid
                        direct_t2_gear_routes[
                            ("held-VSTAR" if nine[V] else "paid-Ultra", gears)
                        ] += paid
                    continue

                # Without a held T1 Thorton a T1 Gear can fetch one from
                # the 44- or 43-card deck after genuine Compressor targets.
                available_t = pool[T] - prized_t
                if not available_t:
                    continue
                fail = choose(t1_deck_size - available_t, 7)
                hit = t1_look - fail
                first_hit_scaled = hit * t1_look
                second_hit_scaled = (
                    fail * hit if eight[G] >= 2 else 0
                )
                gear_t1 += first_weight * prize_ways * (
                    first_hit_scaled + second_hit_scaled
                )

                for ninth in range(len(pool)):
                    if not pool[ninth]:
                        continue
                    nine = list(eight)
                    nine[ninth] += 1
                    if not nine[E] or not (nine[V] or nine[U]):
                        continue
                    required = targets if nine[V] else targets + (V,)
                    ways = t2_draw_mass(
                        pool, ninth, prized_t, required, targets, True,
                    )
                    if not ways:
                        continue
                    direct_support = bool(eight[S] or ninth in (T, S))
                    gear2_available = bool(eight[G] == 2 or ninth == G)
                    remaining_t = (
                        available_t - 1 - (ninth == T)
                    )
                    if direct_support:
                        t2_route = t2_look_gear
                    elif gear2_available:
                        t2_route = (
                            t2_look_gear
                            - choose(t1_deck_size - 2 - remaining_t, 7)
                        )
                    else:
                        t2_route = 0

                    if t2_route:
                        paid = (
                            first_weight * ways
                            * first_hit_scaled * t2_route
                        )
                        t2_after_gear += paid
                        gear_routes[
                            ("T1-first-hit",
                             "held-VSTAR" if nine[V] else "paid-Ultra",
                             "T2-direct" if direct_support else "T2-Gear")
                        ] += paid

                    # T1 failed first Gear and successful second burns
                    # both Gear cards; Ultra cannot now discard two.
                    if second_hit_scaled and nine[V] and direct_support:
                        paid = (
                            first_weight * ways
                            * second_hit_scaled * t2_look_gear
                        )
                        t2_after_gear += paid
                        gear_routes[
                            ("T1-second-hit", "held-VSTAR", "T2-direct")
                        ] += paid

        assert direct_t1 == expected["direct_t1"]
        assert direct_t2 == expected["direct_t2"]
        direct_t1_rate = Fraction(direct_t1, t1_denominator)
        direct_t2_rate = Fraction(
            direct_t2, t1_denominator * t1_deck_size,
        )
        extra_t1_rate = Fraction(
            gear_t1, t1_denominator * t1_look ** 2,
        )
        extra_t2_rate = Fraction(
            t2_after_gear,
            t1_denominator * t2_deck_after_t1_search
            * t1_look ** 2 * t2_look_gear,
        )
        extra_t2_direct_rate = Fraction(
            t2_gear_after_direct,
            t1_denominator * t1_deck_size * t2_look_direct ** 2,
        )
        assert extra_t1_rate == expected["gear_t1"]
        assert extra_t2_rate == expected["gear_t2"]
        assert extra_t2_direct_rate == expected["direct_t2_gear"]

        result = {
            "targets": targets,
            "t1_deck_after_compressor": t1_deck_size,
            "t1_direct_percent": 100 * float(direct_t1_rate),
            "t1_gear_added_pp": 100 * float(extra_t1_rate),
            "t1_inclusive_percent": 100 * float(
                direct_t1_rate + extra_t1_rate
            ),
            "t2_direct_percent": 100 * float(direct_t2_rate),
            "t2_gear_after_direct_added_pp": (
                100 * float(extra_t2_direct_rate)
            ),
            "t2_after_t1_gear_added_pp": 100 * float(extra_t2_rate),
            "t2_inclusive_percent": 100 * float(
                direct_t2_rate + extra_t2_direct_rate + extra_t2_rate
            ),
            "t2_direct_gear_routes": {
                str(k): 100 * float(Fraction(
                    v, t1_denominator
                    * t1_deck_size * t2_look_direct ** 2
                )) for k, v in sorted(direct_t2_gear_routes.items())
            },
            "t1_gear_t2_routes": {
                str(k): 100 * float(Fraction(
                    v, t1_denominator
                    * t2_deck_after_t1_search * t1_look ** 2
                    * t2_look_gear
                )) for k, v in sorted(gear_routes.items())
            },
        }
        results[targets] = result
        for key, value in result.items():
            print(key, value)
        print()

    assert results[(A, M)]["t2_inclusive_percent"] > (
        results[(A, M, H)]["t2_inclusive_percent"]
    )
    return results


if __name__ == "__main__":
    analyze()
