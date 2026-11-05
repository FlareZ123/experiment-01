"""Exact original-rank6 Mail/G&H setup sensitivity to protected discard targets.

All probabilities are mathematical resource-access outcomes, not native paper
actions, utility, game-winning strategies, or competitive win rates.

The model uses 60 source cards from results/aichi-2026/full-decklists.json.
For each original legal Basic opening it enumerates the 7 / 6 / 1 deal and
the top-four Mail rescue probability exactly, then integrates a fixed count
of strategically protected "other" cards via an exact hypergeometric draw.

No files are written. Python 3 standard library only.
"""

from __future__ import annotations

from collections import defaultdict
from fractions import Fraction
from itertools import product
from json import dumps, loads
from math import comb
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ORIGINAL = ROOT / "results" / "aichi-2026" / "full-decklists.json"
SCHEMA = "agent18-rank6-ghala-mail-protected-discard-exact-v1"
NAMES = (
    "Iron Thorns ex",
    "Guzma & Hala",
    "Tag Call",
    "Thunder Mountain ♢",
    "Double Colorless Energy",
    "Trainers' Mail",
)
SOURCE_COUNTS = (4, 2, 2, 1, 1, 3, 47)
FOUR_CARD_SETS = comb(46, 4)
PROTECTED_SWEEP = (0, 10, 19, 25, 30, 35, 40, 45, 47)


def c(n: int, k: int) -> int:
    """Combination of k from n, including out-of-range zero cases."""
    return comb(n, k) if 0 <= k <= n else 0


def source_categories(document: dict) -> tuple[tuple[int, ...], tuple[str, ...]]:
    """Fail closed if source printings, names or a full original 60 differ."""
    deck = next(item for item in document["decks"] if item["rank"] == 6)
    counts = {item["name"]: item["count"] for item in deck["cards"]}
    if sum(counts.values()) != 60:
        raise ValueError("Original source is not a fixed printed sixty")
    actual = tuple(counts[name] for name in NAMES)
    other = 60 - sum(actual)
    if (*actual, other) != SOURCE_COUNTS:
        raise ValueError("Authenticated original rank6 anchor count changed")
    singleton_names = tuple(
        sorted(name for name, count in counts.items()
               if name not in NAMES and count == 1)
    )
    if len(singleton_names) != 19:
        raise ValueError("Expected exactly nineteen other singleton printings")
    return (*actual, other), singleton_names


def count_coarse_outcomes() -> tuple[dict, int, int]:
    """Group exact Mail/direct route weights by hand-other count and payment slack."""
    counts = SOURCE_COUNTS
    K = FOUR_CARD_SETS
    grouped = {
        kind: defaultdict(int) for kind in
        ("direct", "mail", "direct_with_bench", "mail_with_bench", "direct_dce_held", "mail_dce_held", "direct_dce_held_with_bench", "mail_dce_held_with_bench")
    }
    full = (c(60, 7) - c(56, 7)) * c(53, 6) * 47
    enumerated = 0
    nonzero_states = 0
    for basic, gh, tag, mountain, dce, mail in product(
        range(1, 5), range(3), range(3),
        range(2), range(2), range(4)
    ):
        other = 7 - basic - gh - tag - mountain - dce - mail
        if not 0 <= other <= 47:
            continue
        hand = (basic, gh, tag, mountain, dce, mail, other)
        ways_hand = 1
        for population, held in zip(counts, hand):
            ways_hand *= c(population, held)
        if ways_hand == 0:
            continue
        remaining = tuple(pop - held for pop, held in zip(counts, hand))
        for pb in range(min(6, remaining[0]) + 1):
            for ph in range(min(6-pb, remaining[1]) + 1):
                for pt in range(min(6-pb-ph, remaining[2]) + 1):
                    for pm in range(min(6-pb-ph-pt, remaining[3]) + 1):
                        for pd in range(min(6-pb-ph-pt-pm, remaining[4]) + 1):
                            for pq in range(min(6-pb-ph-pt-pm-pd, remaining[5]) + 1):
                                po = 6-pb-ph-pt-pm-pd-pq
                                if not 0 <= po <= remaining[6]:
                                    continue
                                prized = (pb, ph, pt, pm, pd, pq, po)
                                ways_prized = 1
                                for population, chosen in zip(remaining, prized):
                                    ways_prized *= c(population, chosen)
                                if ways_prized == 0:
                                    continue
                                deck = tuple(
                                    population - chosen
                                    for population, chosen in zip(remaining, prized)
                                )
                                for z, drawable_count in enumerate(deck):
                                    if drawable_count == 0:
                                        continue
                                    nonzero_states += 1
                                    weight = ways_hand * ways_prized * drawable_count
                                    enumerated += weight
                                    B = basic + (z == 0)
                                    H = gh + (z == 1)
                                    T = tag + (z == 2)
                                    M = mountain + (z == 3)
                                    D = dce + (z == 4)
                                    Q = mail + (z == 5)
                                    other_in_hand = other + (z == 6)
                                    gh_in_deck = deck[1] - (z == 1)
                                    tag_in_deck = deck[2] - (z == 2)
                                    if pm or pd:
                                        continue
                                    directly = H > 0 or (T > 0 and gh_in_deck > 0)
                                    if directly:
                                        # One original held GH or Tag is consumed.
                                        slack = 7-B-M-D-2
                                        key = (other_in_hand, slack)
                                        term = weight * K**3
                                        grouped["direct"][key] += term
                                        if D:
                                            grouped["direct_dce_held"][key] += term
                                        if B >= 2:
                                            grouped["direct_with_bench"][key] += term
                                            if D:
                                                grouped["direct_dce_held_with_bench"][key] += term
                                        continue
                                    if H > 0 or gh_in_deck < 1 or Q < 1:
                                        continue
                                    eligible = gh_in_deck + tag_in_deck
                                    miss = c(46-eligible, 4)
                                    hit = K-miss
                                    for j in range(1, Q+1):
                                        # Retrieved GH/Tag adds a card, later spent;
                                        # j physical held Mails are the hand reduction.
                                        slack = 8-j-B-M-D-2
                                        key = (other_in_hand, slack)
                                        term = weight * miss**(j-1) * hit * K**(3-j)
                                        grouped["mail"][key] += term
                                        if D:
                                            grouped["mail_dce_held"][key] += term
                                        if B >= 2:
                                            grouped["mail_with_bench"][key] += term
                                            if D:
                                                grouped["mail_dce_held_with_bench"][key] += term
    if enumerated != full:
        raise AssertionError("Incomplete legal Basic opening/Prize/draw partition")
    return grouped, full * K**3, nonzero_states


def payment_availability(protected_other: int, held_other: int, slack: int) -> Fraction:
    """Conditional Pr(at most slack protected items among held 'other' cards)."""
    if not 0 <= protected_other <= 47:
        raise ValueError("Protected other card count out of range")
    if not 0 <= held_other <= 8:
        raise ValueError("Inconsistent source hand other count")
    if slack < 0:
        return Fraction(0)
    if slack >= held_other:
        return Fraction(1)
    p = protected_other
    numerator = sum(
        c(p, x) * c(47-p, held_other-x)
        for x in range(slack+1)
    )
    return Fraction(numerator, c(47, held_other))


def exact_sweep() -> dict:
    """Produce source-name-grounded exact frequencies and conservative sensitivity."""
    document = loads(ORIGINAL.read_text(encoding="utf-8"))
    counts, protected_singletons = source_categories(document)
    grouped, denominator, states = count_coarse_outcomes()
    runs = []
    for protected in PROTECTED_SWEEP:
        numerators = {}
        for group, weighted in grouped.items():
            fraction = sum(
                (Fraction(weight, denominator) *
                 payment_availability(protected, held, slack)
                 for (held, slack), weight in weighted.items()),
                Fraction(0)
            )
            numerators[group] = fraction
        total = numerators["direct"] + numerators["mail"]
        with_bench = (
            numerators["direct_with_bench"] + numerators["mail_with_bench"]
        )

        def unpaid_if_dce_held(group: str) -> Fraction:
            return sum(
                (Fraction(weight, denominator) *
                 (1-payment_availability(protected, held, slack))
                 for (held, slack), weight in grouped[group].items()),
                Fraction(0)
            )

        # Original printed Guzma & Hala lets the owner search one Stadium
        # without discarding; the optional two-card payment is only needed
        # to ALSO obtain a Special Energy and Tool. If DCE was already held,
        # its printed Stadium search alone completes the resource search.
        unpaid_rescue = (unpaid_if_dce_held("direct_dce_held") +
                         unpaid_if_dce_held("mail_dce_held"))
        optional_total = total + unpaid_rescue
        optional_bench = (with_bench +
                          unpaid_if_dce_held("direct_dce_held_with_bench") +
                          unpaid_if_dce_held("mail_dce_held_with_bench"))
        runs.append({
            "protectedOtherCards": protected,
            "direct": str(numerators["direct"]),
            "mailMarginal": str(numerators["mail"]),
            "combined": str(total),
            "combinedPercent": round(100*float(total), 8),
            "combinedWithSecondBasic": str(with_bench),
            "combinedWithSecondBasicPercent": round(100*float(with_bench), 8),
            "optionalGhPaymentAvoidedIfDceAlreadyHeld": str(unpaid_rescue),
            "optionalGhPaymentCombined": str(optional_total),
            "optionalGhPaymentCombinedPercent": round(100*float(optional_total), 8),
            "optionalGhPaymentWithSecondBasic": str(optional_bench),
        })
    baseline = runs[0]
    assert baseline["direct"] == "148690835231/451798286940"
    assert baseline["mailMarginal"] == (
        "2036962192386516832799/41010331343049635767200"
    )
    assert baseline["combined"] == (
        "15533827047272343835079/41010331343049635767200"
    )
    assert runs[2]["protectedOtherCards"] == 19
    assert runs[2]["optionalGhPaymentCombined"] == (
        "392791589553272470125463/1070825318401851600588000"
    )
    assert runs[0]["optionalGhPaymentCombined"] == (
        "162399288709960885796971/428744373131882555748000"
    )
    return {
        "schema": SCHEMA,
        "sourceRank": 6,
        "originalCategoryCounts": counts,
        "protectedOtherSingletonNames": protected_singletons,
        "otherSingletonCount": len(protected_singletons),
        "scope": (
            "Sensitivity of first-turn direct/Mail G&H Thunder/DCE "
            "physical discard resources. Each protected item is assumed "
            "never expendable; all other cards outside the Basic and two "
            "required resources can be sacrificed as paid G&H cost."
        ),
        "exactWeightedSevenPrizeSixDrawOneStates": states,
        "exactFourCardMailSamples": FOUR_CARD_SETS,
        "allPaymentProtectCounts": runs,
        "competitivelyQualifiedGames": 0,
    }


if __name__ == "__main__":
    print(dumps(exact_sweep(), indent=2, ensure_ascii=False))
