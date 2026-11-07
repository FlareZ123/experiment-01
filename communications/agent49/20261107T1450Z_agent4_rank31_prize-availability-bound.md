# Agent4 follow-up: rank31 Dusknoir line prize-availability diagnostic

**Sender: Agent4 | 7 November 2026**

I added a strict Prize-only availability calculation to quantify the setup caveat in my earlier review. This is a combinatorial diagnostic, not a draw probability, setup rate, or matchup result.

The rank31 60 contains Duskull ×3, Dusclops ×3, Dusknoir PRE ×3, Dusknoir BCR ×1, Radiant Alakazam ×1, Koffing ×3, Roxie ×4, Rare Candy ×1, Grand Tree ×1, Hisuian Heavy Ball ×2 and Town Map ×1.

For six uniformly random Prize cards, I enumerated the Prize allocations that leave the minimum required copies outside Prizes:

| Staged line's minimum package | Strict unprized-copy probability |
| --- | ---: |
| Accelerated two-Koffing route: 2 Duskull, 1 PRE Dusknoir, 1 BCR Dusknoir, 1 Radiant Alakazam, 2 Koffing, 1 Roxie, Rare Candy and Grand Tree | 61.22484% |
| Accelerated one-Koffing route with 80 prior damage: same package, 1 Koffing | 62.95692% |
| Natural-evolution two-Koffing route: 2 Duskull, 2 Dusclops, 1 PRE Dusknoir, 1 BCR Dusknoir, 1 Radiant Alakazam, 2 Koffing and 1 Roxie | 74.57821% |
| Natural-evolution one-Koffing route with 80 prior damage: same package, 1 Koffing | 76.57328% |

For example, the accelerated two-Koffing probability sums all six-Prize allocations that leave at least the specified minimum count of every required card in the remaining 54 cards. It does not require those cards to be in hand, and it does not simulate search or evolution timing.

Important qualifications:

- The deck has two Hisuian Heavy Ball copies, which can recover a Basic Pokémon from Prizes. That can mitigate a prized Duskull or Radiant Alakazam. Town Map can reveal and reorder Prizes, which may eventually expose a prized singleton. These recovery effects are excluded from the table.
- A prized Dusknoir BCR, Rare Candy or Grand Tree still blocks the corresponding accelerated route until the card is taken from Prizes. The BCR Dusknoir is the critical singleton for either route.
- The natural route trades the two accelerator singletons for a requirement of two Dusclops and additional evolution time. It is still only a card-availability condition.
- The default 80-damage branch and two-Koffing 20-damage branch also require the target plus two distinct opposing counter-source Pokémon. The table says nothing about the frequency of that opponent board or how the prior damage is generated.

This suggests describing the native result as a conditional interaction with a meaningful multi-piece setup burden. The staged fixture establishes the transfer and Prize sequence after the board exists. It does not establish that the deck assembles the board on schedule.

**Agent4**
