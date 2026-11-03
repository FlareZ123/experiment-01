"""Independent literal-60 shuffled-deal check for the exact RegV Gear model.

This driver deliberately uses physical lists, actual six-card Prize removal,
a real top-seven Pokégear search, post-search shuffles, and physical Ultra Ball
two-card payments. No exact-combinatoric helper is imported. Three policies
share the same original deals but independently randomize each search:

- first Thorton held and second Thorton/VS held (older narrow control);
- first Thorton held, second Pokégear may find it (direct-T1 extended);
- first Thorton may come from Pokégear, T2 may also use Pokégear.

It models resource opportunity only; no opponents, locks, AMR/UDP, or wins.
"""
from collections import Counter
from math import sqrt
from random import Random

from agent12_adp_regv_starter_compressor_donor_exact import (
    A, R, B, D, C, T, S, V, E, U, M, G, H, counts,
)

TRIALS = 750_000
SEED = 12051212
EXPECTED = {
    ("two", "strict"): 0.09938359047861786,
    ("two", "T2-Gear"): 0.12306273956685171,
    ("two", "both-turn-Gear"): 0.13660693557668366,
    ("goodra", "strict"): 0.08491684892968843,
    ("goodra", "T2-Gear"): 0.10544335452185956,
    ("goodra", "both-turn-Gear"): 0.11719424937119034,
}


def spend(hand, card):
    if card in hand:
        hand.remove(card)
        return True
    return False


def gear_search(hand, deck, rng, tries):
    """Play one or two genuine Gear cards; shuffle after every look."""
    for _ in range(tries):
        if not spend(hand, G):
            break
        if T in deck[:7]:
            deck.remove(T)
            rng.shuffle(deck)
            return True
        rng.shuffle(deck)
    return False


def source_opportunity(dealt, targets, policy, rng):
    first_seven = dealt[:7]
    hand = first_seven + [dealt[13]]
    deck = dealt[14:].copy()
    if R not in first_seven or A in first_seven:
        return False, False
    if C not in hand or D not in hand:
        return False, False
    if any(card not in deck for card in targets):
        return False, False
    for card in targets:
        deck.remove(card)
    rng.shuffle(deck)

    # The original starting Regidrago V is the discarded T2 donor. It is
    # physically removed from the Active as part of the T1 Thorton switch.
    for spent in (R, C, D):
        assert spend(hand, spent)

    if not spend(hand, T):
        if policy != "both-turn-Gear":
            return False, False
        if not gear_search(hand, deck, rng, 2):
            return False, False

    # Successful enhanced-GX resource opportunity on T1. Draw exactly
    # one card from the actual remaining deck at the beginning of T2.
    hand.append(deck.pop(0))

    if E not in hand or (V not in hand and U not in hand):
        return True, False

    if not (spend(hand, T) or spend(hand, S)):
        if policy == "strict":
            return True, False
        # A second failed Gear consumes a fourth physical hand object.
        # It leaves too few other cards to pay Ultra Ball's two discards.
        attempts = 2 if V in hand else 1
        if not gear_search(hand, deck, rng, attempts):
            return True, False

    assert spend(hand, E)  # Attach before Thorton if desired.
    if spend(hand, V):
        return True, True
    if U not in hand or V not in deck:
        return True, False
    assert spend(hand, U)
    if len(hand) < 2:
        return True, False
    del hand[:2]  # Two actual remaining objects pay Ultra Ball.
    deck.remove(V)
    return True, True


def run(trials=TRIALS, seed=SEED):
    rng = Random(seed)
    printed = [
        category for category, number in enumerate(counts())
        for _ in range(number)
    ]
    assert len(printed) == 60
    hits = Counter()
    valid = 0
    for _ in range(trials):
        dealt = printed.copy()
        rng.shuffle(dealt)
        if not any(c in (A, R, B) for c in dealt[:7]):
            continue
        valid += 1
        if R not in dealt[:7] or A in dealt[:7]:
            continue
        for name, targets in (("two", (A, M)), ("goodra", (A, M, H))):
            for policy in ("strict", "T2-Gear", "both-turn-Gear"):
                t1, t2 = source_opportunity(dealt, targets, policy, rng)
                hits[name, policy, "T1"] += t1
                hits[name, policy, "T2"] += t2

    assert 0 < valid < trials
    print("Literal 60-card shuffle seed", seed)
    print("Physical shuffled deals", trials, "Basic-valid openings", valid)
    for key in EXPECTED:
        name, policy = key
        n_t1 = hits[name, policy, "T1"]
        n_t2 = hits[name, policy, "T2"]
        observed = 100 * n_t2 / valid
        expected = EXPECTED[key]
        expected_fraction = expected / 100
        sigma_pp = 100 * sqrt(
            expected_fraction * (1 - expected_fraction) / valid
        )
        # Five-sigma sampling envelope prevents genuine stochastic
        # differences from masquerading as a deterministic failure.
        assert abs(observed - expected) <= 5 * sigma_pp, (
            key, observed, expected, sigma_pp
        )
        print(name, policy, "T1", n_t1, "T2", n_t2,
              "T2 percentage", observed, "expected", expected,
              "binomial_sigma_pp", sigma_pp)
    return hits


if __name__ == "__main__":
    run()
