"""Exact strict first- and second-turn ADP/Thorton chain on the fixed v2 60.

No mulligan bonus, one natural draw per turn, one triple-target Compressor.
All probabilities condition on a valid seven-card opening hand.
"""
import hashlib
import json
from math import comb
from pathlib import Path

CANDIDATE = (
    Path(__file__).resolve().parent.parent
    / "results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json"
)
EXPECTED_SHA = "bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b"
BUCKETS = (
    {"sm12-156"},  # ADP
    {"swsh12-135"},  # Regidrago V
    {"sm2-60", "swsh3-104"},  # alternative Basic starters
    {"xy6-97"},  # Double Dragon Energy
    {"xy4-92"},  # Battle Compressor
    {"swsh11-167"},  # Thorton
    {"swsh12-136"},  # Regidrago VSTAR
    {"swsh12pt5-152", "swsh12pt5-153"},  # Basic Grass/Fire Energy
    {"xy2-69"},  # M Charizard-EX (Wild Blaze)
)
A, R, B, D, C, T, V, E, M, X = range(10)


def load_counts(path=CANDIDATE):
    manifest = json.loads(path.read_text(encoding="utf-8"))
    cards = manifest["cards"]
    canonical = json.dumps(
        [{"count": row["count"], "id": row["id"], "name": row["name"]} for row in cards],
        ensure_ascii=False, separators=(",", ":"),
    ).encode("utf-8")
    digest = hashlib.sha256(canonical).hexdigest()
    assert digest == manifest["canonicalCardsSha256"] == EXPECTED_SHA, digest
    result = [0] * 10
    for row in cards:
        group = next(
            (i for i, identities in enumerate(BUCKETS) if row["id"] in identities),
            X,
        )
        result[group] += row["count"]
    assert sum(result) == 60
    assert tuple(result) == (2, 3, 2, 4, 4, 4, 3, 7, 1, 30)
    return tuple(result)


def compositions(total, caps, i=0):
    if i == len(caps) - 1:
        if total <= caps[i]:
            yield (total,)
        return
    for n in range(min(total, caps[i]) + 1):
        for tail in compositions(total - n, caps, i + 1):
            yield (n,) + tail


def choose(n, k):
    return comb(n, k) if 0 <= k <= n else 0


def prize_options(deck_size, n_prize, remainder):
    """Inclusion-exclusion: at least one deck A, R and M after the six Prizes."""
    required_groups = [remainder[A], remainder[R], remainder[M]]
    if min(required_groups) == 0:
        return 0
    total = 0
    for mask in range(8):
        forced = sum(required_groups[i] for i in range(3) if mask & (1 << i))
        total += (-1 if mask.bit_count() % 2 else 1) * choose(
            deck_size - forced, n_prize - forced
        )
    return total


def analyze():
    counts = load_counts()
    valid_seven_weight = 0
    t1_weight = 0
    t1_t2_weight = 0
    for seven in compositions(7, counts):
        opening_weight = 1
        for n, h in zip(counts, seven):
            opening_weight *= choose(n, h)
        if seven[A] + seven[R] + seven[B] == 0:
            continue  # invalid opening; player must mulligan
        valid_seven_weight += opening_weight
        if seven[A]:
            continue  # this specific route starts a non-ADP Basic
        for eighth_group, n in enumerate(counts):
            eighth_options = n - seven[eighth_group]
            if eighth_options == 0:
                continue
            first_eight = list(seven)
            first_eight[eighth_group] += 1
            if not all(first_eight[k] >= 1 for k in (D, C, T)):
                continue
            deck_after_eight = [n - h for n, h in zip(counts, first_eight)]
            valid_prize_sets = prize_options(52, 6, deck_after_eight)
            if not valid_prize_sets:
                continue
            weight = opening_weight * eighth_options
            t1_weight += weight * valid_prize_sets
            missing_t2 = [
                k for k in (T, V, E)
                if first_eight[k] < (2 if k == T else 1)
            ]
            if not missing_t2:
                # After 8 seen and 6 Prizes, Compressor removes 3 targets.
                second_draw_options = 43 * valid_prize_sets
            elif len(missing_t2) == 1:
                # Reserve one necessary T2 draw from Thorton, VSTAR or Basic Energy.
                k = missing_t2[0]
                second_draw_options = (
                    deck_after_eight[k] * prize_options(51, 6, deck_after_eight)
                )
            else:
                second_draw_options = 0
            t1_t2_weight += weight * second_draw_options

    valid_seven = choose(60, 7) - choose(53, 7)
    t1_denominator = valid_seven * 53 * choose(52, 6)
    t2_denominator = t1_denominator * 43
    assert valid_seven_weight == valid_seven == 232063840
    assert t1_weight == 7133590891308288
    assert t1_denominator == 250397245379590400
    assert t1_t2_weight == 5390833234048416
    assert t2_denominator == 10767081551322387200

    print("fixed_candidate_sha", EXPECTED_SHA)
    print("t1_numerator", t1_weight)
    print("t1_denominator", t1_denominator)
    print("t1_conditional_probability", t1_weight / t1_denominator)
    print("t1_t2_numerator", t1_t2_weight)
    print("t1_t2_denominator", t2_denominator)
    print("t1_t2_conditional_probability", t1_t2_weight / t2_denominator)
    print("strict_followthrough_given_t1", t1_t2_weight / t2_denominator / (t1_weight / t1_denominator))


if __name__ == "__main__":
    analyze()
