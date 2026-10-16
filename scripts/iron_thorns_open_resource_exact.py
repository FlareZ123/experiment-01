"""Exact opening-access event for an Iron Thorns ex DCE/Thunder Mountain line.

Fixed-source categorical counts default to the Aichi 2026 rank-6 inventory.
This models available cards and one restricted Trainers' Mail policy, not turns
played, decision quality, real-game attack rates, or match win rates.
"""
from fractions import Fraction
from itertools import product
from math import comb


def choose(n: int, k: int) -> int:
    return comb(n, k) if 0 <= k <= n else 0


def allocations(sizes: tuple[int, ...], total: int):
    """Generate all category counts compatible with a finite sample."""
    for partial in product(*(range(n + 1) for n in sizes[:-1])):
        remainder = total - sum(partial)
        if 0 <= remainder <= sizes[-1]:
            yield (*partial, remainder)


def attack_resource_access(
    *, thorns: int = 4, tag_calls: int = 2,
    guzma_hala: int = 2, double_colorless: int = 1,
    thunder_mountain: int = 1, trainers_mail: int = 3,
) -> dict[str, Fraction]:
    """Condition on a valid seven-card opening, six Prizes and first draw.

    Prized Stadium and all-Prized DCE block the modeled route. Otherwise
    seeing both cards or seeing G&H / Tag Call with searchable G&H permits
    the narrow play. Every seen Trainers' Mail can draw one of the relevant
    Trainer cards from the remaining 46-card deck. It cannot select another
    Trainers' Mail, and a miss chooses nothing then shuffles its cards back.
    Other opening card effects and opposing disruption are out of scope.
    """
    important = (thorns, tag_calls, guzma_hala, double_colorless,
                 thunder_mountain, trainers_mail)
    if (any(type(n) is not int or n < 0 for n in important)
            or thorns == 0 or double_colorless == 0
            or thunder_mountain != 1 or sum(important) > 60):
        raise ValueError("Invalid source-card multiplicities.")

    counts = (*important, 60 - sum(important))
    base_weight = 0
    with_mail_weight = Fraction(0)
    total_weight = 0
    for seen in allocations(counts, 8):
        # An eight-card multiset with a single Basic has a 7/8 chance
        # that the Basic was among the initial seven rather than turn draw.
        if seen[0] == 0:
            continue
        accepted_factor = 7 if seen[0] == 1 else 8
        seen_ways = accepted_factor
        for n, k in zip(counts, seen):
            seen_ways *= choose(n, k)
        after_seen = tuple(n - k for n, k in zip(counts, seen))

        for prizes in allocations(after_seen, 6):
            prize_ways = seen_ways
            for n, k in zip(after_seen, prizes):
                prize_ways *= choose(n, k)
            total_weight += prize_ways
            if prizes[4] > 0 or prizes[3] == double_colorless:
                continue
            deck = tuple(n - k for n, k in zip(after_seen, prizes))
            direct = seen[3] > 0 and seen[4] > 0
            connector = seen[2] > 0 or (seen[1] > 0 and deck[2] > 0)
            if direct or connector:
                base_weight += prize_ways
                with_mail_weight += prize_ways
                continue

            useful = deck[2]  # G&H can fetch both required resources.
            if deck[2] > 0:
                useful += deck[1]  # Tag Call can find G&H.
            if seen[3] > 0 and seen[4] == 0:
                useful += deck[4]  # DCE already held, Stadium is enough.
            if useful and seen[5]:
                # Every failed Mail chooses nothing and reshuffles the
                # unchanged 46-card deck; later looks are independent.
                miss_one = Fraction(choose(46 - useful, 4), choose(46, 4))
                with_mail_weight += prize_ways * (1 - miss_one ** seen[5])

    opening_acceptance = Fraction(
        choose(60, 7) - choose(60 - thorns, 7), choose(60, 7)
    )
    expected_weight = 8 * choose(60, 8) * choose(52, 6) * opening_acceptance
    if total_weight != expected_weight:
        raise AssertionError("Opening and Prize categories did not partition the sample.")
    baseline = Fraction(base_weight, total_weight)
    extended = with_mail_weight / total_weight
    return {
        "valid_seven_card_opening": opening_acceptance,
        "basic_connector_access": baseline,
        "access_with_mail": extended,
        "mail_increment": extended - baseline,
    }


if __name__ == "__main__":
    for rank, dce, mail in [(6, 1, 3), (24, 3, 4), (29, 1, 2)]:
        result = attack_resource_access(
            double_colorless=dce, trainers_mail=mail
        )
        print(rank, "basic:", f"{float(result['basic_connector_access']):.8%}",
              "with Mail:", f"{float(result['access_with_mail']):.8%}")
