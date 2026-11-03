"""Independent physical-deal Monte Carlo for the fixed ADP v2 T1 Gear bridge.

Shuffles all 60 categorical cards (with physical multiplicity), deals seven
then six face-down Prize cards, draws on T1, physically removes three named
Compressor targets from the remaining deck, and uses shuffled Pokégear
top-seven views and a natural T2 draw. Models the same intentionally strict
line as agent12_adp_t1_gear_t2_exact.py; neither script models opponents.

Run standalone using Python 3.12. This validation code is deliberately
independent of the exact inclusion-exclusion/weighted-ninth enumerator.
"""
from random import Random

from agent12_adp_pokegear_exact_supporter import (
    A, B, C, D, E, G, M, R, S, T, U, V, load_counts,
)

SEED = 92771205
TRIALS = 3_000_000


def run():
    rng = Random(SEED)
    cards = [
        bucket for bucket, amount in enumerate(load_counts())
        for _ in range(amount)
    ]
    assert len(cards) == 60
    eligible = t1_direct = t1_gear = t2_direct = t2_gear = 0
    t2_gear_first = t2_gear_second = 0

    for _ in range(TRIALS):
        rng.shuffle(cards)
        opening = cards[:7]
        if not any(c in (A, R, B) for c in opening):
            continue
        eligible += 1
        if A in opening:
            continue
        hand = opening + [cards[13]]  # cards[7:13] are the six Prizes.
        if D not in hand or C not in hand or (T not in hand and G not in hand):
            continue
        deck = cards[14:].copy()
        if not all(target in deck for target in (A, R, M)):
            continue
        for target in (A, R, M):
            deck.remove(target)
        rng.shuffle(deck)

        was_direct = T in hand
        used_gears = 0
        if not was_direct:
            for _ in range(hand.count(G)):
                used_gears += 1
                hand.remove(G)
                if T in deck[:7]:
                    deck.remove(T)
                    rng.shuffle(deck)
                    hand.append(T)
                    break
                rng.shuffle(deck)
            if T not in hand:
                continue
            t1_gear += 1
        else:
            t1_direct += 1

        # Pay the opening Active, DDE, Compressor and T1 Thorton.
        hand.remove(R if R in opening else B)
        for resource in (D, C, T):
            hand.remove(resource)

        # Fresh natural draw from 43 cards (direct) or 42 (Gear).
        hand.append(deck.pop())
        if E not in hand:
            continue
        if V not in hand and (U not in hand or len(hand) < 5):
            continue

        supporter_ready = T in hand or S in hand
        if not supporter_ready:
            available_gear = hand.count(G)
            if V not in hand and len(hand) < 5:
                available_gear = 0
            for _ in range(available_gear):
                hand.remove(G)
                if T in deck[:7]:
                    supporter_ready = True
                    hand.append(T)
                    deck.remove(T)
                    rng.shuffle(deck)
                    break
                rng.shuffle(deck)

        if supporter_ready and (V in hand or (U in hand and len(hand) >= 5)):
            if was_direct:
                t2_direct += 1
            else:
                t2_gear += 1
                if used_gears == 1:
                    t2_gear_first += 1
                else:
                    t2_gear_second += 1

    print("seed", SEED)
    print("uniform physical full-deck deals", TRIALS)
    print("Basic-valid opening sevens", eligible)
    print("T1 direct Thorton", t1_direct)
    print("T1 Gear-acquired Thorton", t1_gear)
    print("strict T1/T2 direct T1", t2_direct)
    print("strict T1/T2 Gear-assisted T1", t2_gear)
    print("Gear first attempt T2 completions", t2_gear_first)
    print("Gear second attempt T2 completions", t2_gear_second)
    print("T1 percentage", 100 * (t1_direct + t1_gear) / eligible)
    print("T1/T2 percentage", 100 * (t2_direct + t2_gear) / eligible)
    print("T1/T2 Gear-added percentage points", 100 * t2_gear / eligible)


if __name__ == "__main__":
    run()
