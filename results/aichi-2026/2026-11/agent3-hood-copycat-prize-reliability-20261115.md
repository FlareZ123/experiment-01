# Hood Shield Shadow Rider v1 — Mimikyu/Apex/Timeless raw core-Prize exposure

**15 November 2026 · exact combinatorial derivation of a no-recovery core-Prize exposure bound · no gameplay or win-rate claim**

## Question

How often is at least one of the two required singleton Basic identities in the six Prize cards before recovery? This is a narrow no-recovery exposure calculation for the candidate's specific Mimikyu GRI 58 → opponent's prior-turn Regidrago VSTAR Apex Dragon → own Dialga-GX UPR 100 Timeless-GX counter-line. It deliberately ignores the current list's one Hisuian Heavy Ball and therefore does not estimate actual Prize-only availability of the line.

## Required candidate identities

The fixed `results/aichi-2026/candidate-hood-shadow-rider.json` inventory contains:
- **1 Mimikyu GRI 58** — required to use Copycat.
- **1 Dialga-GX UPR 100** — the Dragon-type donor whose Timeless-GX is selected by the copied Apex Dragon effect.

Both are necessary for this exact Apex→Timeless line. The Mimikyu-specific card-text/rules derivation is documented in `results/methodology/2026-11/agent49-mimikyu-copycat-regidrago-timeless-als-20261113.md`. This result does not generalize to other Copycat targets that do not need Dialga.

## Exact method

Assume a 60-card deck and six Prize cards sampled uniformly without replacement. Let:
- `m` = number of Mimikyu copies in the 60;
- `d` = number of Dialga-GX UPR 100 copies in the 60.

The raw core-Prize exposure event occurs if **all** Mimikyu copies are Prized or **all** Dialga copies are Prized. By inclusion–exclusion:

`P(unavailable) = [C(60-m, 6-m) + C(60-d, 6-d) - C(60-m-d, 6-m-d)] / C(60, 6)`

where `C(n,k)` is the binomial coefficient. The complement means only that at least one copy of each required identity is outside the Prize cards. It does not mean either card is drawn, searched, placed in the required zone, or successfully used. More importantly, raw core-Prize exposure does not itself establish line failure: the current 60 contains one Hisuian Heavy Ball, which can recover one Prized Basic when the Ball is outside Prizes, accessible, and playable.

## Results

| Mimikyu copies | Dialga UPR copies | Raw core-Prize exposure (no recovery) | No-recovery complement |
|---:|---:|---:|---:|
| 1 (current) | 1 (current) | **113/590 = 19.1525%** | 80.8475% |
| 2 | 1 | **923/8555 = 10.7890%** | 89.2110% |
| 1 | 2 | **923/8555 = 10.7890%** | 89.2110% |
| 2 | 2 | **550/32509 = 1.6918%** | 98.3082% |

With the current 1/1 core, at least one of the two mandatory identities is Prized before recovery in about **one six-Prize partition in 5.22**. Adding a second copy of either identity reduces this raw no-recovery exposure by 8.36 percentage points; duplicating both reduces it by 17.46 points. These are exposure deltas, not Heavy-Ball-aware route-failure deltas.

## Deck-building implication

The repository already contains a parked **Mimikyu-2 / Dialga-1 / Heavy Ball-1 60-card challenger** at `results/decks/hood-shadow-rider-v1-mimikyu2-challenger-60.md`, with a matched **Mimikyu-1 / Dialga-2 / Heavy Ball-1** arm at `results/decks/hood-shadow-rider-v1-dialga2-challenger-60.md`. The Mimikyu-2 list is a one-slot substitution: add the second Mimikyu and remove Trevenant & Dusknoir-GX; it retains one Dialga.

The raw no-recovery calculation gives that existing Mimikyu-2 arm a narrow structural rationale:
- it reduces the chance that a required core identity is Prized before any recovery from 19.15% to 10.79%; this is not the actual Heavy-Ball-aware route cut for the current 1/1/1 package;
- unlike a second Dialga, the extra Mimikyu also improves access to the candidate's broader Copycat target map (see `results/aichi-2026/2026-11/agent1-copycat-field-target-map-20261115.md`);
- it provides redundancy if the first Mimikyu is Knocked Out or otherwise unavailable, although this analysis does not model recovery or tempo.

The Dialga-2 arm produces the same raw no-recovery exposure reduction for the specific Apex→Timeless line, but its broader value outside Regidrago matchups is not established. A 2/2 core has the best raw no-recovery exposure in this model but consumes two additional deck slots. None of these copy-count comparisons establishes the Heavy-Ball-aware capacity cut or actual game performance; any candidate must be evaluated unchanged against the full field.

This result does **not** unpark or nominate either challenger. The current decision board defers core-copy experiments until the candidate-aware Max Geist/attack-conversion policy is competent. After that gate, compare the existing 1/1 and 2/1 arms with the same playing policy across the full opponent field. Do not cut a named card solely from this prize calculation: the removed Trevenant & Dusknoir-GX and all other matchup-specific slots have opportunity costs.

## Heavy Ball reconciliation — read before interpreting the table

The current Hood v1 list contains one Hisuian Heavy Ball and 14 Basic Pokémon. The separate Heavy-Ball-aware model defines the optimistic Prize-zone capacity cut as `(M AND D) OR (H AND (M OR D))`: both required Basics are Prized, or Heavy Ball is Prized alongside at least one required Basic. For the current 1 Mimikyu / 1 Dialga / 1 Heavy Ball package, that cut is **2.3669091034% conditional on a legal initial seven**, assuming every unprized Heavy Ball is accessible and usable. The raw **19.152542%** above is unconditional on the opening hand; the same no-recovery exposure is **18.766341% conditional on a legal seven**. These figures answer different questions and use different conditioning, so do not compare them as if they were the same failure probability.

The 2.366909% value is an optimistic Prize-zone capacity cut, not an actual attack-line or game-loss estimate. Heavy Ball may be inaccessible, unplayable under Item lock, or strategically unusable; other requirements can also fail. An independent exact enumeration of disjoint seven-card opening hands and six-Prize sets, conditioned on at least one of the list's 14 Basic Pokémon in the opening seven, reproduces the raw-exposure fraction `162938799/868250240` and the capacity-cut fraction `139744719/5904101632`. See [Agent35's exact reconciliation](agent35-copycat-heavyball-prize-risk-reconciliation-20261117.md), [Agent6's original Heavy-Ball-aware min-cut](agent6-champion-copycat-two-basic-prize-mincut-20261107.md), and [Agent21's independent multiplicity extension](agent21-copycat-prize-access-multiplicity-sensitivity-20261107.md).

## What this does not establish

The table is a **no-recovery core-Prize exposure bound**, not a probability of executing Copycat or losing the game. It ignores:
- finding Mimikyu and moving it to the required board position;
- attaching enough Psychic Energy and preserving a legal promotion/retreat route;
- getting Dialga-GX UPR 100 into the discard pile (the candidate has Battle Compressor, Quick Ball, and Mysterious Treasure, but their access and Item-lock exposure are not modeled);
- the opponent actually using Apex Dragon on the immediately preceding turn;
- the candidate's one Hisuian Heavy Ball, including whether it is outside Prizes, drawn/searched, playable, and usable before the route is needed;
- the candidate's GX attack remaining unused;
- the V3 worker's current missing tracker receipt, Apex protocol exception, selected-history dispatch, and native compatibility-hook integration;
- opponent responses, prize taking, knockouts, and any other game-state constraints.

A prize-available line may still be unreachable in a particular game. No simulated games, matchup rates, or competitive performance are claimed.

## Reproduction

Run `node scripts/agent3-hood-copycat-prize-bound.cjs` to reproduce the exact BigInt table. The regression cases are in `tests/agent3-hood-copycat-prize-bound.test.cjs`.

The current 1/1 case is:

`[C(59,5) + C(59,5) - C(58,4)] / C(60,6) = 113/590 = 19.1525%`

The numerator/denominator results are exact; percentages are presentation-only.

**Conclusion:** the current list has **19.152542% unconditional raw core-Prize exposure before recovery** (18.766341% conditional on a legal initial seven). The separate optimistic Heavy-Ball-aware Prize-zone capacity cut is **2.366909% conditional on a legal seven**, assuming the unprized Heavy Ball is accessible and usable. Neither value is an executable-line failure rate or matchup estimate. Mimikyu-2 remains a parked challenger with a narrower no-recovery exposure and independent Copycat-target rationale; no deck change is authorized, and only complete fixed-60 testing can establish its value.
