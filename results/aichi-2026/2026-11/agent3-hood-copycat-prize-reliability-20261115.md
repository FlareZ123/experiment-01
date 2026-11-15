# Hood Shield Shadow Rider v1 — Mimikyu/Apex/Timeless prize reliability

**15 November 2026 · exact combinatorial derivation · no gameplay or win-rate claim**

## Question

How often is the candidate's specific Mimikyu GRI 58 → opponent's prior-turn Regidrago VSTAR Apex Dragon → own Dialga-GX UPR 100 Timeless-GX counter-line unavailable before any search, draw, setup, or sequencing is considered, solely because a required singleton is among the six Prize cards?

## Required candidate identities

The fixed `results/aichi-2026/candidate-hood-shadow-rider.json` inventory contains:
- **1 Mimikyu GRI 58** — required to use Copycat.
- **1 Dialga-GX UPR 100** — the Dragon-type donor whose Timeless-GX is selected by the copied Apex Dragon effect.

Both are necessary for this exact Apex→Timeless line. The Mimikyu-specific card-text/rules derivation is documented in `results/methodology/2026-11/agent49-mimikyu-copycat-regidrago-timeless-als-20261113.md`. This result does not generalize to other Copycat targets that do not need Dialga.

## Exact method

Assume a 60-card deck and six Prize cards sampled uniformly without replacement. Let:
- `m` = number of Mimikyu copies in the 60;
- `d` = number of Dialga-GX UPR 100 copies in the 60.

The line is prize-unavailable if **all** Mimikyu copies are Prized or **all** Dialga copies are Prized. By inclusion–exclusion:

`P(unavailable) = [C(60-m, 6-m) + C(60-d, 6-d) - C(60-m-d, 6-m-d)] / C(60, 6)`

where `C(n,k)` is the binomial coefficient. The prize-available complement means only that at least one copy of each required identity is outside the Prize cards. It does not mean either card is drawn, searched, placed in the required zone, or successfully used.

## Results

| Mimikyu copies | Dialga UPR copies | Prize-unavailable | Prize-available upper bound |
|---:|---:|---:|---:|
| 1 (current) | 1 (current) | **113/590 = 19.1525%** | 80.8475% |
| 2 | 1 | **923/8555 = 10.7890%** | 89.2110% |
| 1 | 2 | **923/8555 = 10.7890%** | 89.2110% |
| 2 | 2 | **550/32509 = 1.6918%** | 98.3082% |

With the current 1/1 core, at least one of the two mandatory cards is Prized in about **one game in 5.22**. Adding a second copy of either identity reduces that specific prize failure mode by 8.36 percentage points. Adding a second copy of both reduces it by 17.46 percentage points.

## Deck-building implication

The repository already contains a parked **Mimikyu-2 / Dialga-1 / Heavy Ball-1 60-card challenger** at `results/decks/hood-shadow-rider-v1-mimikyu2-challenger-60.md`, with a matched **Mimikyu-1 / Dialga-2 / Heavy Ball-1** arm at `results/decks/hood-shadow-rider-v1-dialga2-challenger-60.md`. The Mimikyu-2 list is a one-slot substitution: add the second Mimikyu and remove Trevenant & Dusknoir-GX; it retains one Dialga.

The prize calculation gives that existing Mimikyu-2 arm a specific structural rationale:
- it reduces the Apex→Timeless line's prize-only failure rate from 19.15% to 10.79%;
- unlike a second Dialga, the extra Mimikyu also improves access to the candidate's broader Copycat target map (see `results/aichi-2026/2026-11/agent1-copycat-field-target-map-20261115.md`);
- it provides redundancy if the first Mimikyu is Knocked Out or otherwise unavailable, although this analysis does not model recovery or tempo.

The Dialga-2 arm produces the same prize-only reduction for the specific Apex→Timeless line, but its broader value outside Regidrago matchups is not established. A 2/2 core has the best prize resilience but consumes two additional deck slots and must be tested against all 32 opponents rather than accepted on this metric alone.

This result does **not** unpark or nominate either challenger. The current decision board defers core-copy experiments until the candidate-aware Max Geist/attack-conversion policy is competent. After that gate, compare the existing 1/1 and 2/1 arms with the same playing policy across the full opponent field. Do not cut a named card solely from this prize calculation: the removed Trevenant & Dusknoir-GX and all other matchup-specific slots have opportunity costs.

## What this does not establish

The table is a **prize-only ceiling**, not a probability of executing Copycat. It ignores:
- finding Mimikyu and moving it to the required board position;
- attaching enough Psychic Energy and preserving a legal promotion/retreat route;
- getting Dialga-GX UPR 100 into the discard pile (the candidate has Battle Compressor, Quick Ball, and Mysterious Treasure, but their access and Item-lock exposure are not modeled);
- the opponent actually using Apex Dragon on the immediately preceding turn;
- the candidate's GX attack remaining unused;
- the V3 worker's current missing tracker receipt, Apex protocol exception, selected-history dispatch, and native compatibility-hook integration;
- opponent responses, prize taking, knockouts, and any other game-state constraints.

A prize-available line may still be unreachable in a particular game. No simulated games, matchup rates, or competitive performance are claimed.

## Reproduction

Run `node scripts/agent3-hood-copycat-prize-bound.cjs` to reproduce the exact BigInt table. The regression cases are in `tests/agent3-hood-copycat-prize-bound.test.cjs`.

The current 1/1 case is:

`[C(59,5) + C(59,5) - C(58,4)] / C(60,6) = 113/590 = 19.1525%`

The numerator/denominator results are exact; percentages are presentation-only.

**Conclusion:** the current candidate's one-of Mimikyu/Dialga counter-line has a 19.15% prize-only failure rate. A second Mimikyu is the more promising first challenger because it improves that line's prize resilience and has independent Copycat field coverage, but only a full-field experiment can establish whether the extra slot improves the fixed 60.
