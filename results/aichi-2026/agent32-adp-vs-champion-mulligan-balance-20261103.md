# Agent 32: equal-29 original field, seven-Basic ADP versus fourteen-Basic champion mulligan exposure

**3 November 2026 | exact bilateral setup arithmetic | no native games or qualified wins.**

## Fixed comparison

This is a direct cross-candidate pregame comparison holding the **same 29 original Aichi Top32 printed opponent sixties** constant. Agent5's [ADP/Thorton/Regidrago v2 fixed sixty](candidates/agent5-adp-thorton-regidrago-60-v2.json), canonical identity **bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b**, has **seven Basic Pokémon**. The [original rank-one Shadow Rider Calyrex reference](benchmark-shadow-rider.md), independently verified from the printed 60, has **fourteen Basics**. All 29 opponents' Basic counts derive from uniquely matched Pokémon printings in the supplied full-source rosters and bundled card database. Ranks 23, 25, 28 are excluded because their original sixties remain unverified.

Each player draws seven, retries if no Basic, and if both fail simultaneously both redraw without extra-card compensation. If one player has a legal first seven while the other repeatedly fails, the player with Basics may be **offered** optional extra cards for the opponent's mulligans. We count offered cards in **both directions**.

## Core equal-field results

| Equal-rank mean across 29 originals | ADP v2, 7 Basics | Rank-one reference, 14 Basics |
| --- | ---: | ---: |
| Opponent expected optional bonus offers | **0.5686149720** | **0.1306613789** |
| Candidate expected optional bonus offers | **0.2386327448** | **0.3040179024** |
| Net opponent minus candidate offers | **+0.3299822273** | **-0.1733565235** |

The ADP v2 candidate causes **0.4379535931 more expected offers to the opponent** than the rank-one reference on exactly the same field, while the ADP candidate itself receives **0.0653851576 fewer expected offers** from original opponents. The resulting difference in the **net source-oriented optional-card offer balance** is **+0.5033387507 per match** under equal weighting of the 29 authenticated opponents. This comparison uses opening-deal probabilities alone. An offer can be declined and extra cards may or may not change the winner; no advantage in Prizes, matchup win probability, or policy competence is claimed.

Two particular source comparisons highlight why the player-specific numerator and denominator matter:

| Original source opponent | Original Basic count | Candidate | Opponent expected offers | Candidate expected offers |
| --- | ---: | --- | ---: | ---: |
| Rank 6 Iron Thorns | 4 | ADP v2 | 0.349005 | 1.187909 |
| Rank 6 Iron Thorns | 4 | Rank-one reference | 0.070110 | 1.412353 |
| Rank 1 Shadow Rider | 14 | ADP v2 | 0.605674 | 0.102335 |
| Rank 1 Shadow Rider | 14 | Rank-one reference | 0.141305 | 0.141305 |

All **29 individual original opponent rows** receive more expected optional extra cards from ADP's starting-seven failures than from the champion's, and every row increases the source-oriented net offer balance. Both facts are asserted by deterministic tests.

## Exact model and proof

For a deck with A Basics, let qA = C(60-A,7)/C(60,7), and let qB be the same quantity for its original opponent's B Basics. Simultaneous failed openings restart both players without giving extras. When the **candidate** alone initially lacks Basics after the last simultaneous restart, the original opponent is offered at least one bonus with probability qA(1-qB)/(1-qA qB). The expected number of such offers is qA(1-qB)/[(1-qA qB)(1-qA)]. In the reciprocal case, **candidate** expected offers are qB(1-qA)/[(1-qA qB)(1-qB)]. The two expressions swap exactly on swapping the players. These are exact fractions of physical seven-card deals, calculated with BigInt.

Compare the resulting pair at A=7 and A=14 against each exact original opponent B count; average over 29 ranks only after obtaining each individual value. In this model starting seat and first-player order cannot alter the initial-hand Basic condition. The candidate's deck identity can alter the actual opponent setup through other mechanics, so these expressions cannot replace a matched native game.

## Reproducible implementation and gates

- [Source-census and exact bilateral mulligan engine](../../simulation/evaluation/agent32-adp-field-mulligan-offers.cjs) and [its six printing/identity tests](../../tests/agent32-adp-field-mulligan-offers.test.cjs).
- [Two-sided candidate-versus-reference comparison](../../simulation/evaluation/agent32-adp-vs-champion-mulligan-delta.cjs) and [six further tests](../../tests/agent32-adp-vs-champion-mulligan-delta.test.cjs), including reciprocity across candidate/opponent swaps, exact field aggregate numeric values, and every rank's difference sign.
- Same existing [manual card audit](../../.github/workflows/aichi-card-audit.yml); **actual GitHub Actions [41554713806](https://github.com/FlareZ123/experiment-01/actions/runs/41554713806) concluded SUCCESS** on research head **0bb1e2ff579aa8a4316366c1b625fc9ac3b67709**, with the focused comparison step SUCCESS. All twelve new bilateral test cases passed across the two modules. No on-push trigger, new deck, or native match was introduced.

## Decision consequence and constraints

The ADP candidate's small Basic count has a **measurable, recurring pregame resource-opportunity cost** against this field compared with the champion reference. This is additional independent falsification pressure on a hypothesis requiring a reliable first-available-turn GX. It deserves a tracked original-source opener ledger, separate from [the 28.99% first-seven ADP starter DDE access](agent32-adp-first-gx-exact-physical-window-20261103.md) and [the 7.46-percentage-point Switch/tutor route extension](agent32-adp-switch-tutor-extension-20261103.md). Those access events are conditioned on a Basic-valid initial seven and must not be casually multiplied by bonus-offer probabilities.

Do not interpret relative optional-card offers as a win rate, independent game events, or a sufficient reason to reject all other viable ADP policies. Real source choices, revealed mulligan information, optional bonus draws, evolving board and attack/lock pressure still require prospective two-seat source-authenticated evaluation. The common paper match-time adjudicator remains unqualified. The shared project has **29 authenticated original sixties, no selected best fixed sixty and zero competitively qualified games**.
