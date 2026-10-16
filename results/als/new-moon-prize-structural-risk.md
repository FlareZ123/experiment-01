# New Moon Perfection: exact six-Prize twin-singleton retrieval capacity

**Agent 3, 16 October 2026.** The [source-image 60](new-moon-perfection-source-60.md) belongs to the **52nd-place** Aichi New Moon Perfection pilot. It includes exactly **one New Moon Lunatone**, **one Sunbeam Solrock CES62 English equivalent**, and **two Hisuian Heavy Ball**. This analysis does not promote the pilot into the Top32 benchmark or estimate wins.

## Model and exact results

With six face-down Prize cards sampled uniformly from a fixed 60, let `l` and `s` be the numbers (0 or 1) of the singleton Lunatone and Solrock Prized, and `h` (0–2) the number of two Heavy Balls Prized. The other 56 cards are interchangeable in this capacity model. For every case, exact physical combinations are `C(1,l) × C(1,s) × C(2,h) × C(56,6-l-s-h)`. The sum of all 12 cases is `C(60,6)=50,063,860`. **Physical unprized retrieval capacity is insufficient if `l+s > 2-h`**. [Hisuian Heavy Ball card text](https://limitlesstcg.com/cards/ASR/146) permits recovery of a Prized Pokémon by swapping it with that Item, once per copy.

| Initial six-Prize event | Distinct configurations | Probability |
|---|---:|---:|
| At least one singleton key Pokémon is Prized | 9,588,502 | **19.152542%** |
| Both are Prized | 424,270 | **0.847458%** |
| **Unprized Heavy Balls too few for all Prized key Pokémon** | **112,420** | **0.224553%** |
| Exactly one key Prized with both Heavy Balls Prized | 55,440 | 0.110739% |
| Both keys Prized with at least one Heavy Ball Prized | 56,980 | 0.113815% |

The last two rows partition the shortage event. [Exact BigInt enumerator](../../simulation/evaluation/new-moon-prize-access.cjs) and [fixed-count tests](../../tests/new-moon-prize-access.test.cjs) preserve a reproducible integer sample space and all twelve outcomes.

## Interpretation

The **0.224553%** event is a permissive *count-only capacity shortage* before taking Prizes, even if every unprized Heavy Ball is accessible and usable. It does **not** directly measure lost games, Item-lock response, search accessibility, hand/start constraints, or whether both key Pokémon are necessary in a matchup. Conversely, the remaining 99.775447% of physical configurations do **not** guarantee a playable route: an unprized Ball can be in an inaccessible deck zone, the active player may be Item-locked, or the opponent may force another plan. Opening Basic constraints change these unconditional probabilities.

Any proposal to replace one card with an additional Ball, a second Solrock/Lunatone, or another Prize recovery option should check what the replaced card did in real turns, legality, Bench capacity, and matchups. No card change is currently supported. This is a strategic boundary condition for the **99.5% target**, whose actual game win rate remains unmeasured.

## Next tests

The manual `aichi-deck-ingest.yml` workflow now runs `node --test tests/new-moon-prize-access.test.cjs`. Extend to valid seven-card openings with conditional Prize distributions, and resolve [the pinned Silent Lab-before-New Moon engine-order bug](../twinleaf/new-moon-silent-lab-order-fidelity.md) before any candidate match-rate inference.
