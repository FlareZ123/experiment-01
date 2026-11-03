"""Independent literal-60 Monte Carlo check for ADP-held Quick Ball -> Lele.

Separate physical Crobat Basic is retained so observed Basic-valid opening
seven denominator is real, even though the exact numerator combines all
non-route cards. QBall really pays the held ADP discard. Quick Ball fetches
one in-deck Lele, Wonder Tag fetches one in-deck Thorton and Compressor
finds the unique deck M Charizard. Natural ninth draw comes from the
post-search shuffled 43-card deck. A second held/drawn Thorton or VS,
a held/drawn VSTAR and basic Energy are needed on turn two. No other
search/draw/turn interactions or native games.

This sample is intentionally a distinct implementation from the exact
multivariate counting program.
"""
from math import sqrt
from random import Random

from agent12_adp_regv_held_adp_quickball_lele_exact import counts

TRIALS = 2_000_000
SEED = 12051327
EXPECTED_T1_PERCENT = 0.187584722106858
EXPECTED_T2_PERCENT = 0.0035494744994524737

# Copy the exact program's category ordering with one extra Crobat Basic
# split out from the 27 non-route cards. ADP, RegV, Lele, Crobat are Basics.
A, R, D, C, Q, L, T, S, V, E, M, X, B = range(13)


def run(trials=TRIALS, seed=SEED):
    rng = Random(seed)
    quantities = list(counts())
    quantities[X] -= 1
    quantities.append(1)  # One physical Crobat V Basic.
    printed = [
        category for category, amount in enumerate(quantities)
        for _ in range(amount)
    ]
    assert len(printed) == 60
    eligible = gx = apex = 0
    for _ in range(trials):
        rng.shuffle(printed)
        seven = printed[:7]
        if not any(c in (A, R, L, B) for c in seven):
            continue
        eligible += 1
        if A not in seven or R not in seven:
            continue
        hand = seven + [printed[13]]  # Six Prizes occupy indices 7..12.
        if not all(card in hand for card in (C, D, Q)):
            continue
        deck = printed[14:].copy()
        if not all(card in deck for card in (L, M, T)):
            continue
        # T1 normal: starting RegV goes to discard on Thorton, QBall
        # discards held ADP, DDE attaches, Compressor discards M,
        # QBall fetches Lele and Wonder Tag fetches a genuine Thorton.
        for spent in (R, A, C, D, Q):
            hand.remove(spent)
        for found in (L, M, T):
            deck.remove(found)
        assert len(deck) == 43
        gx += 1
        rng.shuffle(deck)  # Genuine deck searches reset unknown order.
        hand.append(deck.pop())
        # T2 strict direct/VS; four physical hand objects after T1,
        # so neither a later Ultra nor a late Pokégear is allowed.
        if E in hand and V in hand and (T in hand or S in hand):
            apex += 1

    assert 0 < eligible < trials
    print("physical_deals", trials, "seed", seed)
    print("Basic_valid_sevens", eligible, "T1_GX_resources", gx,
          "strict_T1_T2_Apex_resources", apex)
    for label, observed, expected in (
        ("T1", 100 * gx / eligible, EXPECTED_T1_PERCENT),
        ("T2", 100 * apex / eligible, EXPECTED_T2_PERCENT),
    ):
        p = expected / 100
        sigma = 100 * sqrt(p * (1-p) / eligible)
        print(label, "observed_percent", observed,
              "expected_percent", expected, "sigma_pp", sigma)
        assert abs(observed - expected) < 5 * sigma, (
            label, observed, expected, sigma,
        )
    return {"eligible": eligible, "gx": gx, "apex": apex}


if __name__ == "__main__":
    run()
