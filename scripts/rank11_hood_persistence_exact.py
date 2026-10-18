"""Exact first-turn Blower and Stealthy Hood resource availability.

Frozen Hood Shield v1: 14 Basic, 1 Arven, 1 Field Blower,
2 Stealthy Hood, 42 other. The opening seven must include a Basic.
Eight seen cards include the normal first-own-turn draw, and six
Prize cards are unknown. Arven can search one Item and one Tool.
No other access routes, competing Supporters, opponent interaction,
or execution competence are modeled.
"""
from fractions import Fraction
from math import comb

CARDS = (14, 1, 1, 2, 42)
EVENTS = (
    "direct_blower", "blower_access", "direct_hood", "hood_access",
    "direct_both", "joint_access", "either_access", "arven_only_joint",
)


def choose(n, k):
    return comb(n, k) if 0 <= k <= n else 0


def exact_rates():
    """Return eight event probabilities conditional on a legal original seven."""
    totals = dict.fromkeys(EVENTS, 0)
    prize_allocations = comb(52, 6)
    for b in range(9):
        for a in range(2):
            for f in range(2):
                for h in range(3):
                    o = 8 - b - a - f - h
                    if not b or not 0 <= o <= CARDS[4]:
                        continue
                    # With exactly one Basic seen, it must be among the
                    # seven initial cards rather than the normal turn draw.
                    multiplicity = (
                        (7 if b == 1 else 8)
                        * choose(14, b) * choose(1, a)
                        * choose(1, f) * choose(2, h) * choose(42, o)
                    )
                    if not multiplicity:
                        continue
                    remaining = tuple(
                        count - held for count, held in
                        zip(CARDS, (b, a, f, h, o))
                    )
                    for pb in range(min(6, remaining[0]) + 1):
                        for pa in range(min(6-pb, remaining[1]) + 1):
                            for pf in range(min(6-pb-pa, remaining[2]) + 1):
                                for ph in range(min(6-pb-pa-pf, remaining[3]) + 1):
                                    po = 6 - pb - pa - pf - ph
                                    if not 0 <= po <= remaining[4]:
                                        continue
                                    prize_ways = (
                                        choose(remaining[0], pb)
                                        * choose(remaining[1], pa)
                                        * choose(remaining[2], pf)
                                        * choose(remaining[3], ph)
                                        * choose(remaining[4], po)
                                    )
                                    weight = multiplicity * prize_ways
                                    direct_b = bool(f)
                                    direct_h = bool(h)
                                    access_b = direct_b or bool(a and 1-f-pf)
                                    access_h = direct_h or bool(a and 2-h-ph)
                                    direct_both = direct_b and direct_h
                                    joint = direct_both or bool(
                                        a and access_b and access_h
                                    )
                                    observed = (
                                        direct_b, access_b, direct_h, access_h,
                                        direct_both, joint,
                                        access_b or access_h,
                                        bool(a and access_b and access_h and
                                             not direct_both),
                                    )
                                    for event, passed in zip(EVENTS, observed):
                                        if passed:
                                            totals[event] += weight

    denominator = 8 * comb(60, 8) * prize_allocations
    legal_seven = Fraction(
        comb(60, 7) - comb(46, 7), comb(60, 7)
    )
    return {
        event: Fraction(total, denominator) / legal_seven
        for event, total in totals.items()
    }


if __name__ == "__main__":
    for name, rate in exact_rates().items():
        print(f"{name}: {float(rate)*100:.12f}% ({rate})")
