"""Independent physical 60-card shuffle check for RegV-starter Compressor donors.

Seeded simulation pays one Regidrago V Active, T1 DDE, Compressor and first
Thorton. Starting Regidrago is put in discard by the Thorton swap, so
Compressor may remove ADP + M Charizard, or both plus Goodra. Same first
deal and six Prizes tested under all three strategies; each physically
randomized after deck search. T2 tests a hand Supporter/VS, Basic Energy,
and VSTAR or payable Ultra Ball. This is not a whole game simulator.
"""
from random import Random

from agent12_adp_regv_starter_compressor_donor_exact import (
    A, B, C, D, E, H, M, R, S, T, U, V, counts,
)

SEED = 91212025
TRIALS = 3_000_000
TARGETS = ((A, R, M), (A, M), (A, M, H))


def run():
    random = Random(SEED)
    cards = [
        group for group, amount in enumerate(counts())
        for _ in range(amount)
    ]
    assert len(cards) == 60
    eligible = 0
    r_started_with_resources = 0
    first_turn = [0, 0, 0]
    complete = [0, 0, 0]
    for _ in range(TRIALS):
        random.shuffle(cards)
        seven = cards[:7]
        if not any(group in (A, R, B) for group in seven):
            continue
        eligible += 1
        if A in seven or R not in seven:
            continue
        hand = seven + [cards[13]]
        if not all(group in hand for group in (D, C, T)):
            continue
        r_started_with_resources += 1
        for index, targets in enumerate(TARGETS):
            # These are the physical deck after the initial seven, six
            # face-down Prizes, and T1 ordinary draw.
            deck = cards[14:].copy()
            if any(group not in deck for group in targets):
                continue
            first_turn[index] += 1
            for target in targets:
                deck.remove(target)
            random.shuffle(deck)
            held = hand.copy()
            for spent in (R, D, C, T):
                held.remove(spent)
            held.append(deck.pop())  # Exactly one normal T2 draw.
            if E not in held or not (T in held or S in held):
                continue
            if V in held or (U in held and V in deck):
                # Five physical hand cards at start T2; retaining a
                # Supporter, Basic Energy and Ultra permits discarding
                # exactly the two remaining objects.
                complete[index] += 1

    print("seed", SEED)
    print("physical_uniform_sixties", TRIALS)
    print("Basic_valid_sevens", eligible)
    print("R_starter_first8_resources", r_started_with_resources)
    for targets, t1, t2 in zip(TARGETS, first_turn, complete):
        print("targets", targets, "T1", t1, "T2", t2,
              "T1_pct", 100 * t1 / eligible,
              "strict_T2_pct", 100 * t2 / eligible)


if __name__ == "__main__":
    run()
