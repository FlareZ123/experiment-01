"""Source-count exact first-eight GX donor and lock-counter access."""
from fractions import Fraction
from itertools import product
from math import comb


def choose(n: int, k: int) -> int:
    return comb(n, k) if 0 <= k <= n else 0


def exact_window(
    *, deck_size: int = 60, opening: int = 7, prizes: int = 6,
    basic_count: int = 17, mewtwo: int = 2, compressors: int = 2,
    counters: int = 2, donors: int = 2, require_counter: bool = True,
) -> dict[str, Fraction]:
    """Count only direct cards, never search, actions, attacks or wins.

    Event: Mewtwo in the original legal opening; required counter in the
    opening and one ordinary draw; donor drawn directly OR Compressor
    drawn directly with one GX donor remaining outside six Prizes.
    """
    groups = (mewtwo, compressors, counters, donors)
    others = deck_size - sum(groups)
    if others < 0 or deck_size - opening - 1 < prizes:
        raise ValueError("Counts or setup size incompatible")
    if basic_count < mewtwo or not 0 <= basic_count <= deck_size:
        raise ValueError("Basic count incompatible")
    counts = (*groups, others)
    hand = deck = Fraction(0)
    for m, b, c, d in product(*(range(min(opening, n) + 1) for n in groups)):
        o = opening - m - b - c - d
        if m < 1 or not 0 <= o <= others:
            continue
        chosen = (m, b, c, d, o)
        ways = 1
        for total, selected in zip(counts, chosen):
            ways *= choose(total, selected)
        opening_probability = Fraction(ways, choose(deck_size, opening))
        remaining = [total - selected for total, selected in zip(counts, chosen)]
        for index, quantity in enumerate(remaining):
            if quantity == 0:
                continue
            seen = tuple(n + int(i == index) for i, n in enumerate(chosen))
            _, seen_compressor, seen_counter, seen_donor, _ = seen
            if require_counter and seen_counter == 0:
                continue
            probability = opening_probability * Fraction(quantity, deck_size - opening)
            if seen_donor > 0:
                hand += probability
            elif seen_compressor > 0:
                unseen = donors - seen_donor
                remaining_after_draw = deck_size - opening - 1
                all_donors_prized = Fraction(
                    choose(prizes, unseen), choose(remaining_after_draw, unseen)
                )
                deck += probability * (1 - all_donors_prized)
    basic_valid = 1 - Fraction(
        choose(deck_size - basic_count, opening), choose(deck_size, opening)
    )
    return {
        "donor_in_first_eight": hand / basic_valid,
        "compressor_to_unprized_donor": deck / basic_valid,
        "either_disjoint_route": (hand + deck) / basic_valid,
    }


if __name__ == "__main__":
    for named_counters in (2, 4):
        print("COUNTER_COPIES", named_counters)
        for label, fraction in exact_window(counters=named_counters).items():
            print(label, fraction, f"{100 * float(fraction):.9f}%")
