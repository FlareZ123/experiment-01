# Agent50: rank4 Dedechange 32-seed per-seat setup-shuffle replay

**6 November 2026 | deterministic shuffle-protocol sensitivity arm | setup-only evidence.**

## Result

The same 32 seeds, source-seat assignments, rank4 source 60, rank1 reference 60, source-first choice, and opening policy were replayed under Agent26's independent per-seat setup-shuffle streams. This changed the actual physical deck permutations; the arms are seed-matched protocol variants, not identical physical deals.

- **32/32** source first turns reached the first unsupported root.
- Dedechange was available in **5/32 (15.625%)** openings; the native hook played, confirmed, and drew six cards in **all 5/5** opportunities.
- Ten attempts had unequal mulligan counts. In all ten, the public `ShowMulliganPrompt` receipts identified both seats' mulligan counts, and the `WANT_TO_DRAW_CARDS` recipient was exactly the player with fewer mulligans. The default selected draw amount equaled the difference.
- Bonus recipients were physical seat0 in **6** events and seat1 in **4**. By deck role, the source received compensation in **4** events and the reference in **6**.
- The ten prompts selected eight Draw-1, one Draw-2, and one Draw-3 choice: **13 compensation cards** total. All ten first compensation moves were verified at the actual deck-to-hand method boundary, including exact card identity.
- The source's first-turn hand contained seven cards in 28 attempts and eight cards in four attempts. The five Dedechange uses paid six cards in four cases and seven cards in one case; all five drew six. No Prism Star entered the Lost Zone in this cohort.

This is a setup and simulator-randomization result. It does not evaluate whether Dedechange is strategically correct, and it contains no completed competitive games.

## Registration and reproducibility

- Preregistration: [`agent50-rank4-dedechange-perseat32-sourcefirst-20261106.md`](registrations/agent50-rank4-dedechange-perseat32-sourcefirst-20261106.md).
- Test: [`tests/agent50-rank4-dedechange-perseat32.native.test.cjs`](../../tests/agent50-rank4-dedechange-perseat32.native.test.cjs).
- Workflow: [`agent50-rank26-koko-dual-recipient-native.yml`](../../.github/workflows/agent50-rank26-koko-dual-recipient-native.yml), input `rank4_dedechange_perseat32_only=true`.
- Successful CI run: [42298886655](https://github.com/FlareZ123/experiment-01/actions/runs/42298886655), head `b53cb6ad7db2760ce9cbbf331d39c86c7392fd22`.
- Artifact: [13541919790](https://github.com/FlareZ123/experiment-01/actions/runs/42298886655/artifacts/13541919790), ZIP SHA-256 `06b042fb6884b2803f46f8317751106bd89ed108af354b9a791eaa02a32cd491`. Downloaded ZIP digest matches GitHub's artifact digest; all 32 JSON files match their individual SHA-256 sidecars.
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Source: original Aichi rank4 60, SHA-256 `3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423`.
- Reference: original Aichi rank1 60, SHA-256 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- The exact seed/seat cohort is reused from the [legacy-shared-stream preregistration](registrations/agent50-rank4-dedechange-natural32-sourcefirst-20261106.md): 32 unique seeds, 16 source-seat-0 and 16 source-seat-1 arms. Source deliberately goes first in every arm.
- Only the setup shuffle protocol changes: `simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs`, using its fixed seat salts `0x243f6a88` and `0x85a308d3` for native `ShuffleDeckPrompt` resolution while `state.turn===0`. Both seats had at least one recorded setup shuffle in every attempt. The headless runner separately exposes `runMatch({isolatePhysicalShuffleRandomness:true})` with different built-in salts (`0x3c6ef372` / `0xa54ff53a`); that flag was not enabled in this cohort and should be tested as a distinct protocol.
- The same entry-priority Active policy, optional min-zero Bench decline, public mulligan acknowledgements, actor-only SelectPrompt default, source-first choice, Dedechange hook, and raw-State quarantine were retained.

## Full 32-attempt receipts

Mulligan counts are shown as absolute physical seat0/seat1 counts. The bonus recipient is the player with fewer mulligans. A dash means both players had equal mulligan counts and no compensation prompt occurred.

| Trial | Source seat | Seed | Mulligans seat0/seat1 | Bonus recipient | Draw | Dedechange |
|---:|---:|---:|---:|---:|---:|:---:|
| 1 | 0 | 659596847 | 0/0 | — | — | No |
| 2 | 1 | 3374395305 | 0/0 | — | — | No |
| 3 | 0 | 3767656280 | 0/0 | — | — | No |
| 4 | 1 | 1334448369 | 0/0 | — | — | No |
| 5 | 0 | 1015114065 | 1/0 | 1 | 1 | No |
| 6 | 1 | 2721212630 | 1/0 | 1 | 1 | No |
| 7 | 0 | 3093975646 | 0/1 | 0 | 1 | Yes |
| 8 | 1 | 3866265543 | 0/2 | 0 | 2 | No |
| 9 | 0 | 3156942071 | 0/0 | — | — | No |
| 10 | 1 | 2011905764 | 0/0 | — | — | No |
| 11 | 0 | 1103482661 | 0/1 | 0 | 1 | No |
| 12 | 1 | 795422078 | 0/0 | — | — | No |
| 13 | 0 | 1285175489 | 0/0 | — | — | Yes |
| 14 | 1 | 3644145136 | 0/0 | — | — | No |
| 15 | 0 | 166706843 | 0/0 | — | — | No |
| 16 | 1 | 3879134323 | 0/0 | — | — | Yes |
| 17 | 0 | 633372073 | 0/1 | 0 | 1 | No |
| 18 | 1 | 86623464 | 0/1 | 0 | 1 | No |
| 19 | 0 | 3741635901 | 0/0 | — | — | No |
| 20 | 1 | 3937313210 | 0/0 | — | — | No |
| 21 | 0 | 3935354425 | 0/0 | — | — | No |
| 22 | 1 | 469693129 | 0/0 | — | — | No |
| 23 | 0 | 3112483819 | 1/0 | 1 | 1 | No |
| 24 | 1 | 4036501400 | 0/0 | — | — | No |
| 25 | 0 | 1618181490 | 3/0 | 1 | 3 | No |
| 26 | 1 | 3127876404 | 0/0 | — | — | No |
| 27 | 0 | 358071138 | 0/0 | — | — | No |
| 28 | 1 | 246568075 | 0/1 | 0 | 1 | No |
| 29 | 0 | 614184015 | 0/0 | — | — | Yes |
| 30 | 1 | 3658443122 | 0/0 | — | — | No |
| 31 | 0 | 988546863 | 0/0 | — | — | No |
| 32 | 1 | 3425622581 | 0/0 | — | — | Yes |

## Mulligan-compensation validation

The Store observer captured 20 public `ShowMulliganPrompt` acknowledgements (two views per unequal-mulligan attempt), all natively accepted. It mapped `SETUP_PLAYER_NO_BASIC` to the actor's seat and `SETUP_OPPONENT_NO_BASIC` to the other seat, using `hands.length` as the mulligan count. The test then checked the actual `WANT_TO_DRAW_CARDS` prompt owner and default draw amount against the count difference.

The pinned [setup reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts#L185-L260) contains both recipient branches and builds descending draw options with default index zero. All ten prompt recipients and selected counts matched the observed counts; all ten physical compensation transfers matched the requested amount and exact card identity.

### Measurement-boundary correction

The first per-seat execution, [42298239129](https://github.com/FlareZ123/experiment-01/actions/runs/42298239129), failed one receipt assertion. Its prompt owner, mulligan counts, and selected Draw-1 amount already matched. The Store-dispatch-wide hand/deck delta was +2/-2 because the setup reducer continued through `initNextTurn` in the same synchronous dispatch; the first +1 was the compensation draw, and the subsequent turn-start `MOVE_CARDS` was outside the compensation effect. The initial observer incorrectly attributed the aggregate delta to the SelectPrompt.

The successful rerun [42298886655](https://github.com/FlareZ123/experiment-01/actions/runs/42298886655) wraps the pinned `CardList.moveTo` method during the SelectPrompt dispatch and records the compensation call itself. In the affected attempt (source seat0, seed 633372073), the selected option was Draw 1 and the first compensation move was exactly one card with identity preserved; the total dispatch delta remained two because of the subsequent turn-start movement. The two effects are now distinguished. The setup reducer calls [`initNextTurn`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts#L48-L105) after setup, where turn-start movement is handled through `MOVE_CARDS`.

## Dedechange opportunity and payment

Five opportunities occurred:

- Trial 7, seed 3093975646, source seat0: seven cards paid to discard, six drawn. The source had received a one-card compensation draw.
- Trial 13, seed 1285175489, source seat0: six discarded, six drawn.
- Trial 16, seed 3879134323, source seat1: six discarded, six drawn.
- Trial 29, seed 614184015, source seat0: six discarded, six drawn.
- Trial 32, seed 3425622581, source seat1: six discarded, six drawn.

The five opportunities are 15.625%, with a 95% Wilson interval of **6.86%–31.75%**. The legacy shared-stream cohort observed 6/32 (18.75%; Wilson 8.89%–35.31%). These wide intervals overlap substantially; the one-opportunity difference is not evidence of a meaningful rate change.

## Comparison with the legacy shared-stream cohort

| Measure | Legacy shared stream | Per-seat setup streams |
|---|---:|---:|
| Source first turns reached | 32/32 | 32/32 |
| Dedechange opportunities | 6/32 | 5/32 |
| Native Dedechange plays / confirms / six-card draws | 6 / 6 / 6 | 5 / 5 / 5 |
| Unequal-mulligan attempts / compensation prompts | 6 | 10 |
| Compensation cards selected | 8 | 13 |
| Compensation recipient seats | seat0 0, seat1 6 | seat0 6, seat1 4 |
| Total mulligans by physical seat | seat0 8, seat1 0 | seat0 6, seat1 7 |
| Compensation recipient deck roles | source 4, reference 2 | source 4, reference 6 |

The all-seat1 compensation-recipient pattern from the legacy stream did not reproduce under the per-seat protocol. The enhanced legacy rerun captured the mulligan counts: **seat0 accumulated eight mulligans and seat1 accumulated zero** across 32 attempts, despite source-seat assignments being balanced 16/16. Under per-seat streams, seat0 accumulated six and seat1 seven. An independent identical-rank4 control on a new seed cohort produced legacy totals seat0 five / seat1 eight and per-seat totals three / four, so the original 8/0 result does not establish a general seat-order bias. It remains a pronounced cohort-specific contrast; the exact original seed list has not yet been replayed with identical decks.

The default [`headless.cjs` RNG](../../simulation/twinleaf/headless.cjs#L120-L135) is a single xorshift32 stream assigned to `Math.random` for the whole match ([runMatch setup](../../simulation/twinleaf/headless.cjs#L491-L500)); the two players' physical shuffles therefore consume one sequential stream. The per-seat adapter instead derives two streams using seat-specific salts and intercepts turn-zero `ShuffleDeckPrompt` resolutions. This is a plausible explanation for the observed asymmetry, but a matched identical-deck seat-symmetry test and shuffle-level validation are still needed before attributing causality.

The per-seat stream also yielded more unequal-mulligan attempts and more reference-deck compensation, consistent with the rank1 list's one-Basic advantage over rank4 in this cohort. These are protocol-sensitive observations, not proof that the legacy engine is defective or that per-seat streams exactly reproduce paper shuffling. The two protocols create different physical openings even when seed and seat assignment are held constant.

## Failure-inclusive status and interpretation

Every attempt reached source turn1 and then stopped at the fail-closed `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED` boundary. Each row records one quarantined raw-State call; the original native raw-State decoder executed zero times. No opponent response, attack, Prize transition, terminal game, or competitive qualification occurred.

The per-seat protocol is a useful reproducible alternative for setup experiments. The data support recording shuffle protocol explicitly and never pooling results from shared-stream and per-seat-stream runs as if they were the same deal distribution. They do not support a Dedechange strength claim or a tournament win-rate estimate.

**Benchmark unchanged:** no selected final 60, zero competitively qualified full games, and no demonstrated 99.5% win rate against the Aichi Open League 2026 Top 32.
