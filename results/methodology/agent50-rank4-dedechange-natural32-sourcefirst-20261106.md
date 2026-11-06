# Agent50: prospective 32-deal rank4 Dedechange source-first opening census

**6 November 2026 | prospective 32-seed source-first opening census under Twinleaf's legacy shared physical-shuffle RNG | setup-only evidence.**

## Result

**Observed opportunity rate:** 6/32 (18.75%).

All **32/32** preregistered physical attempts reached the original rank4 source's first turn. The existing entry-priority opening policy left an original Dedenne-GX UNB in the source owner's hand with an empty Bench in **6/32 attempts (18.75%)**. The automatic native hook then physically Benched Dedenne, accepted the actual Dedechange confirmation, and drew six physical cards in **all 6/6 opportunities**. Opportunities were evenly split by physical source seat: **3/16 in seat 0 and 3/16 in seat 1**.

This is an opportunity-frequency and native-execution census under a controlled source-first opening policy and Twinleaf's default shared seeded shuffle stream. It does not evaluate whether Dedechange is the strategically correct action, and it contains no completed competitive games.

## Registration, source, and reproducibility

- Preregistration, committed before implementation: [32 fixed seeds and protocol](registrations/agent50-rank4-dedechange-natural32-sourcefirst-20261106.md).
- Test: [`tests/agent50-rank4-dedechange-natural32.native.test.cjs`](../../tests/agent50-rank4-dedechange-natural32.native.test.cjs).
- Existing manual workflow lane: [`agent50-rank26-koko-dual-recipient-native.yml`](../../.github/workflows/agent50-rank26-koko-dual-recipient-native.yml), input `rank4_dedechange_natural32_only=true`. No new workflow was added.
- Initial successful run: [42295981590](https://github.com/FlareZ123/experiment-01/actions/runs/42295981590), head `ed6a0def9b3ec437d90ba65daab8eb5516292939`. Enhanced authoritative receipt rerun: [42299490842](https://github.com/FlareZ123/experiment-01/actions/runs/42299490842), head `3ac7837aa57ab8b10610ce0a5dc2bfc31706c37`.
- Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Source: original Aichi rank4 60, SHA-256 `3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423`.
- Reference: original Aichi rank1 60, SHA-256 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- The [original rank4 decklist](../aichi-2026/full-decklists.json) contains 2 Dedenne-GX and 11 other Basic Pokémon (13 Basic Pokémon total).
- Thirty-two unique seeds were generated using Python `secrets.randbits(32)`, fixed in the registration, and split 16/16 across physical source seats. Source was deliberately selected to go first in every arm. This is not a natural coin-outcome sample.
- **Shuffle-stream clarification:** the test calls `runMatch` without `isolatePhysicalShuffleRandomness` and does not apply Agent26's per-seat setup-shuffle adapter. Twinleaf therefore uses its default legacy shared seeded physical-shuffle stream across both seats. The seeds are random, but the two players' deck shuffles consume the shared stream sequentially. This is a deterministic simulator protocol, not an independent per-seat physical shuffle or a paper-calibrated deal-frequency claim.
- Agent26's [32-setup per-seat shuffle study](agent26-bilateral-mulligan-bonus-exact-20261106.md) reports nine compensation-recipient events split 5 to seat0 and 4 to seat1, using different source decks/candidates. Agent4's [per-seat shuffle A/B/A study](agent4-native-postsetup-per-seat-shuffle-mail-aba-20261105.md) documents that changing shuffle-stream coupling changes initial physical deals. Neither is a direct rank4/rank1 replication.
- A same-seed, same-seat replay under the established per-seat setup shuffle protocol was preregistered at [`agent50-rank4-dedechange-perseat32-sourcefirst-20261106.md`](registrations/agent50-rank4-dedechange-perseat32-sourcefirst-20261106.md); it is a protocol-sensitivity arm, not a same-physical-deal counterfactual.
- The completed [per-seat replay](agent50-rank4-dedechange-perseat32-sourcefirst-20261106.md) used the same seeds and seats but produced different deals: 5/32 Dedechange opportunities, ten compensation prompts, and recipient seats split 6 to seat0 / 4 to seat1. The legacy seat1-only cluster did not reproduce. The report captures both players' mulligan counts and validates every compensation recipient and amount. This is protocol sensitivity, not a causal same-deal comparison.
- The existing single-Basic entry-priority policy was held fixed. It prefers a Basic without a printed hand-to-Bench Ability as Active where available; the min-zero optional compensation Bench choice declines the extra placement. The existing owner-only detached SelectPrompt adapter uses each prompt's default option.
- The test records the source's actual first-turn hand, setup prompt owner, offered SelectPrompt labels, chosen index/default, and physical hand/deck changes. It observes the acting prompt owner's own zones and changes no action.

The successful artifact is [13542032386](https://github.com/FlareZ123/experiment-01/actions/runs/42295981590/artifacts/13542032386), ZIP SHA-256 `afb48be04c70c3875218a25740ab8fcd92e0351c161379fdc69e88746766a04c`. The downloaded digest matches the GitHub artifact digest. All **32 JSON receipts** match their individual SHA-256 sidecars.

The enhanced receipt artifact is [13543720846](https://github.com/FlareZ123/experiment-01/actions/runs/42299490842/artifacts/13543720846), ZIP SHA-256 `e7feb738ac399788cdd2728c3b245c4006233940148c4feff284da8181399c4c`. Its downloaded digest matches GitHub's artifact digest, and all 32 JSON receipts match their sidecars. Use this enhanced artifact for mulligan-count and exact compensation-move analysis; it reuses the same seeds and decisions.

### Instrumentation correction

The first execution, [42295390547](https://github.com/FlareZ123/experiment-01/actions/runs/42295390547), stopped in the measurement harness because the label parser used an over-escaped digit regex. Native SelectPrompt dispatch had already moved the physical cards, and its before/after counts were retained in the failed artifact (ZIP SHA-256 `fe88fe0ed531e4ef589a20f19caede94b603d1cdf2e24f37e28eb3c09a7c337d`). The parser was corrected and successful wrapper audits were preserved; the exact same 32 seeds and decisions were rerun. Only the successful rerun contributes to the reported sample.

The enhanced [42299490842](https://github.com/FlareZ123/experiment-01/actions/runs/42299490842) replay added public mulligan-count receipts and a `CardList.moveTo` observer so the exact compensation movement is isolated from any later movement in the same dispatch. It reproduced all six prompts and all six exact physical transfers, and establishes the seat0 mulligan skew above. It uses the same 32 seeds and choices; no additional sample rows were added.

## All registered attempts

| Trial | Source seat | Seed | Dedechange opportunity | Hand paid after Benching Dedenne | Discard | Lost Zone | Draw |
|---:|---:|---:|:---:|---:|---:|---:|---:|
| 1 | 0 | 659596847 | Yes | 6 | 6 | 0 | 6 |
| 2 | 1 | 3374395305 | Yes | 6 | 6 | 0 | 6 |
| 3 | 0 | 3767656280 | No | — | — | — | — |
| 4 | 1 | 1334448369 | No | — | — | — | — |
| 5 | 0 | 1015114065 | No | — | — | — | — |
| 6 | 1 | 2721212630 | No | — | — | — | — |
| 7 | 0 | 3093975646 | No | — | — | — | — |
| 8 | 1 | 3866265543 | No | — | — | — | — |
| 9 | 0 | 3156942071 | No | — | — | — | — |
| 10 | 1 | 2011905764 | No | — | — | — | — |
| 11 | 0 | 1103482661 | No | — | — | — | — |
| 12 | 1 | 795422078 | Yes | 6 | 5 | 1 | 6 |
| 13 | 0 | 1285175489 | No | — | — | — | — |
| 14 | 1 | 3644145136 | No | — | — | — | — |
| 15 | 0 | 166706843 | No | — | — | — | — |
| 16 | 1 | 3879134323 | No | — | — | — | — |
| 17 | 0 | 633372073 | No | — | — | — | — |
| 18 | 1 | 86623464 | No | — | — | — | — |
| 19 | 0 | 3741635901 | No | — | — | — | — |
| 20 | 1 | 3937313210 | No | — | — | — | — |
| 21 | 0 | 3935354425 | No | — | — | — | — |
| 22 | 1 | 469693129 | No | — | — | — | — |
| 23 | 0 | 3112483819 | No | — | — | — | — |
| 24 | 1 | 4036501400 | No | — | — | — | — |
| 25 | 0 | 1618181490 | No | — | — | — | — |
| 26 | 1 | 3127876404 | No | — | — | — | — |
| 27 | 0 | 358071138 | Yes | 6 | 6 | 0 | 6 |
| 28 | 1 | 246568075 | No | — | — | — | — |
| 29 | 0 | 614184015 | Yes | 6 | 6 | 0 | 6 |
| 30 | 1 | 3658443122 | Yes | 7 | 7 | 0 | 6 |
| 31 | 0 | 988546863 | No | — | — | — | — |
| 32 | 1 | 3425622581 | No | — | — | — | — |

The six Dedechange payments were:

- Trial 1, seed 659596847: Counter Energy, Hisuian Heavy Ball, Electrode-GX, Pokémon Ranger, Unit Energy, Secret Box; 6 discarded, 6 drawn.
- Trial 2, seed 3374395305: Hisuian Heavy Ball, Counter Energy, Sky Field, Battle Compressor, Sky Field, Alolan Raichu; 6 discarded, 6 drawn.
- Trial 12, seed 795422078: Secret Box, Battle Compressor, Voltorb, Ditto Prism Star, Hisuian Heavy Ball, Klefki; 5 discarded, Ditto Prism Star entered Lost Zone, 6 drawn.
- Trial 27, seed 358071138: Unit Energy, Sky Field, Quick Ball, Battle Compressor, Carmine, Crobat V; 6 discarded, 6 drawn.
- Trial 29, seed 614184015: Reversal Energy, Unit Energy, Sky Field, Unit Energy, Rescue Stretcher, Pokémon Ranger; 6 discarded, 6 drawn.
- Trial 30, seed 3658443122: Telescopic Sight, Quick Ball, Counter Energy, Electrode-GX, Sky Field, Quick Ball, Eldegoss V; 7 discarded, 6 drawn.

The source's first-turn hand size was 7 cards in 28 attempts, 8 cards in 3, and 9 cards in 1. Trial 30's seven-card Dedechange payment followed a one-card mulligan-compensation draw: after Dedenne was played from hand, seven cards remained to be paid. Across the six uses, **37 original hand cards were consumed** (36 to discard and one to Lost Zone) and **36 cards were drawn**. The extra compensation card therefore made that one Dedechange a net one-card hand reduction.

## Mulligan-compensation prompt receipts

There were six native `WANT_TO_DRAW_CARDS` SelectPrompts. The actor-only adapter selected the default maximum-draw option in each case. The pinned Twinleaf [`setup-reducer.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts#L199-L225) constructs draw options in descending order and sets `defaultValue: 0`; the Store observer verified actual card movement for every prompt:

| Trial | Source seat | Mulligans seat0/seat1 | Prompt owner | Selected label | Compensation move | Identity verified |
|---:|---:|---:|---:|---|---:|:---:|
| 4 | 1 | 2/0 | 1 | Draw 2 card(s) | +2 / -2 | Yes |
| 7 | 0 | 2/0 | 1 | Draw 2 card(s) | +2 / -2 | Yes |
| 25 | 0 | 1/0 | 1 | Draw 1 card(s) | +1 / -1 | Yes |
| 26 | 1 | 1/0 | 1 | Draw 1 card(s) | +1 / -1 | Yes |
| 30 | 1 | 1/0 | 1 | Draw 1 card(s) | +1 / -1 | Yes |
| 32 | 1 | 1/0 | 1 | Draw 1 card(s) | +1 / -1 | Yes |

All six prompts belonged to physical seat1. The enhanced rerun captured the actual mulligan counts: **seat0 had a total of eight mulligans (four one-mulligan cases and two two-mulligan cases), while seat1 had zero mulligans in all 32 attempts**. The 16/16 source-seat balance means the seat0 skew persisted regardless of whether seat0 held rank4 or rank1; this is a strong seat-order anomaly in this legacy shared-stream cohort. All six prompts correctly gave seat1 the exact difference (four Draw-1 and two Draw-2), and all six compensation moves were physically verified at the `CardList.moveTo` boundary. The 12 public mulligan acknowledgements were accepted. This is a pronounced seat0 mulligan skew in this specific rank4/rank1 seed cohort, not proof of a general simulator seat bias. The same-seed per-seat replay had ten unequal-mulligan cases, seat0 total six and seat1 total seven, with recipient seats split 6/4. A separate identical-rank4 control on a new 32-seed cohort did not reproduce a general seat bias: legacy totals were seat0 five / seat1 eight, and per-seat totals three / four. The original 8/0 result may be a seed/deck/shuffle interaction or sampling variation; a same-seed identical-deck replay on the original seed list remains open. See the [protocol comparison](agent50-rank4-dedechange-perseat32-sourcefirst-20261106.md) and [identical-deck control](agent50-identical-rank4-mulligan-seat-symmetry-20261106.md).

## Probability sanity check

A simple seven-card, no-mulligan/no-compensation hypergeometric model for the rank4 list gives:

`P(opportunity) = 1 - C(58,7)/C(60,7) - 2 C(47,6)/C(60,7) = 16.5864%`

This model uses two Dedenne and eleven other Basics. It excludes the actual mulligan/compensation process and is only a sanity check, not the experiment's estimand. The observed `6/32 = 18.75%` has a 95% Wilson interval of **8.89%–35.31%**. The observed rate is compatible with the rough seven-card model; the sample is too small for a precise opportunity estimate.

## Failure-inclusive status and interpretation

All 32 attempts reached the source's first turn and then stopped at the same fail-closed boundary: `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`, source seat, turn 1, phase 2, decision kind `root-or-setup`. Each row records one quarantined raw-State call; the original native raw-State decoder executed **zero times**. There were no opponent replies, attacks, Prize transitions, terminal games, or competitive qualifications.

The forced hook proves that the native Store can execute Dedechange in these six physical opening states. It does not prove that spending the hand is good. The payments included search, setup, energy, recovery, and other cards; strategic opportunity cost, replacement draw quality, opponent response, and the value of a hand-preserving line remain untested. The 6/32 frequency is conditional on this source/reference pair, source-first choice, setup policy, and seed cohort. Do not generalize it to the full Aichi field.

## Next research

1. Treat the default shared PRNG and Agent26 per-seat setup streams as distinct experiment protocols. Record the protocol in every result and never pool their opening frequencies as one distribution. The per-seat replay removed the all-seat1 compensation cluster, but the two protocols produce different physical deals.
2. Compare Dedechange against a hand-preserving alternative on matched physical deals, retaining all no-opportunity rows. Include actual later source actions and adversarial opponent responses once the shared policy can complete them.
3. Keep the SelectPrompt adapter default-off in the shared v8 baseline until its owner-safe semantics and full-game impact are separately validated.

**Benchmark unchanged:** no selected final 60, zero competitively qualified full games, and no demonstrated 99.5% win rate against the Aichi Open League 2026 Top 32.
