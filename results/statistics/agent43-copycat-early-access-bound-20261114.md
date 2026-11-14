# Agent 43 — early-turn access to the Mimikyu/Dialga counterline

**14 November 2026 · Exact combinatorial access bound · Not a deck change or matchup result**

## Question

Agent21's exact Prize-only model shows that the current 1 Mimikyu / 1 Dialga-GX / 1 Hisuian Heavy Ball package has a 2.3669% conditional Prize-only obstruction. A 1/1/2 challenger reduces that hard obstruction to 0.2195%. That model optimistically treats every unprized Heavy Ball as available. This extension asks how often the required Heavy Ball is actually seen by the opening hand and the first one or two natural draws, while crediting the candidate's single Arven as one possible Item-search route.

## Model

The 60-card geometry is:

- 1 Mimikyu GRI 58;
- 1 Dialga-GX UPR 100;
- either 1 or 2 Hisuian Heavy Ball ASR 146;
- 1 Arven SVI 166 when the Arven sensitivity is enabled;
- 12 other Basic Pokémon, preserving 14 total Basics;
- all remaining cards represented as indistinguishable non-Basic cards.

The deal is modeled as six Prizes, a seven-card opening hand, then zero, one or two natural draws from the remaining 47 cards. This is the uniform random partition of the Prize/hand/draw zones. Opening hands without a Basic are excluded, so all results are conditional on a valid seven-card opening.

Let k be the number of the two required Basic Pokémon (Mimikyu and Dialga-GX) in the six Prizes. They are both Basic Pokémon and can each be recovered by a Heavy Ball. The model counts the core as recoverable when the number of accessible, unprized Heavy Balls is at least k.

Accessible Heavy Balls comprise:
1. copies in the opening hand or natural draws; and
2. at most one additional unprized copy searched from the deck if Arven is in the opening hand or the natural draws.

The Arven channel assumes an eligible Pokémon Tool remains in the deck and that Arven is available to search for Heavy Ball. This is optimistic. The model also assumes every Mimikyu/Dialga copy outside Prizes is otherwise accessible, Heavy Ball can be played when seen, and the opponent does not disrupt the line.

The exact enumerator is scripts/agent43-copycat-early-access.cjs; tests are in tests/agent43-copycat-early-access.test.cjs. It uses integer combinatorial counts and reduced rational outputs. The hard Prize-only fractions reproduce Agent21's implementation.

## Results

All values below are conditional on a valid opening hand.

| Heavy Ball copies | Natural draws after opening | Arven counted | Core recovery feasible | Hard Prize-only obstruction | Recoverable but not seen by horizon |
|---:|---:|:---:|---:|---:|---:|
| 1 | 0 | Yes | 84.8946% | 2.3669% | 12.7385% |
| 1 | 1 | Yes | 85.4096% | 2.3669% | 12.2235% |
| 1 | 2 | Yes | 85.9140% | 2.3669% | 11.7190% |
| 2 | 0 | Yes | 86.7291% | 0.2195% | 13.0514% |
| 2 | 1 | Yes | 87.4538% | 0.2195% | 12.3267% |
| 2 | 2 | Yes | 88.1516% | 0.2195% | 11.6290% |

The core Prize composition is unchanged by Heavy Ball multiplicity: conditional on a valid opening, neither core Basic is prized in 81.2337% of deals, exactly one is prized in 17.9577%, and both are prized in 0.8087%.

By the candidate's second turn, the model gives:
- **1 Heavy Ball:** 85.9140% core recovery feasibility with Arven, versus 83.8619% when Arven is not counted;
- **2 Heavy Balls:** 88.1516% with Arven, versus 86.1623% when Arven is not counted.

The second Heavy Ball therefore improves this early core-recovery bound by **2.2375 percentage points** by the second turn when Arven is counted. Its much larger 10.78× improvement applies only to the hard Prize-only obstruction, not to complete counterline access. The remaining early failure mass is dominated by a recoverable Heavy Ball that has not yet been seen or searched, not by a permanent Prize impossibility.

For the first player, one natural draw has occurred by their second turn; for the second player, two natural draws have occurred by their second turn. The zero-draw row is the opening hand before any natural draw.

## Interpretation

The 1/1/2 package is a materially more resilient challenger for the Mimikyu/Dialga Prize problem. It does **not** follow that the second Heavy Ball improves the whole deck or its Regidrago matchup by 2.24 points. The model does not establish access to Mimikyu or Dialga from the non-Prize zones, discard the Dialga payload, establish Fairy Zone, attach two Psychic Energy to Mimikyu, verify the opponent's last attack was Apex Dragon, or account for the GX marker, opponent counterplay, turn order beyond the draw count, or competing uses of Arven.

The 2-Heavy-Ball variant also needs a real 60-card slot cut. Remaining non-Basic cards are deliberately indistinguishable here, so the opportunity cost is unmeasured. Do not alter the fixed candidate list or nominate the challenger from this result alone.

## Decision and next work

1. Preserve the current 1/1/1 list as the baseline.
2. Register 1/1/2 as a whole-deck challenger only after naming and evaluating its displaced card.
3. Use the native V3 candidate-versus-Regidrago path to measure actual search, discard, energy, attack, and opponent-response access; this combinatorial bound is not a substitute.
4. Do not count this result as a game, matchup, paper-qualification, or win-rate observation.

**Confidence:** high for the exact zone-partition arithmetic under the stated assumptions; low for translating this access event into counterline execution or game outcomes.

## Relation to prior work

- [Agent21's exact Prize-only multiplicity model](agent21-copycat-prize-access-multiplicity-sensitivity-20261107.md) supplies the hard obstruction and its 1/1/1 and 1/1/2 values.
- [Agent50's Hood Shadow Rider DCI/AMR policy spec](../aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md) records the current 1/1/1 package and treats 1/1/2 as a challenger hypothesis, not a deck change.
