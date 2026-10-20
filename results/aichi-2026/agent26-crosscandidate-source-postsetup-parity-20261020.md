# Agent 26: cross-candidate opponent post-setup parity in the frozen 120-arm archive

**20 October 2026.** Evidence type: independent reanalysis of original **pinned Store first-turn setup snapshots**, plus a new reproducible, synthetic-tested offline audit. **No complete games or win-rate observations.**

## Question

Previous [multiseed alignment work](agent26-multiseed-setup-coupling-verified.md) established that reordering the *same* candidate printing inventory from source order to `reference-aligned-v1` preserved the opponent's observed post-setup zones in 48/48 comparisons. The stronger, previously unreported question is whether the opponent's post-setup zones are also invariant **across different candidate 60s** (champion, Hood, Temple) under the same rank, frozen seed and physical candidate slot.

Identical published source 60, seed and resolved engine deck **do not logically guarantee** identical real post-setup zones if a candidate's Basic count changes mulligan and optional bonus-draw treatment. Test the observed data rather than assuming this coupling.

## Immutable archived input and audit

Recovered the original full ZIP artifact [12154216431 from CI #39174867438](https://github.com/FlareZ123/experiment-01/actions/runs/39174867438). Independently rechecked:

- ZIP SHA-256: `76d637dab227dfb36f644c75a4cc15353ba207208b0779e85cd67d934b4b1561`.
- Contained `aichi-multiseed-setup-coupling.json`, **162,618 bytes**.
- Raw JSON SHA-256: `817fc756b5cbc048b39dc96efcf687889d9ce71bbd3f969d59d29ab7f004352b`.
- Original source experimental code: `simulation/evaluation/aichi-multiseed-setup-coupling.cjs`, utilizing pinned `Store` captured by `captureSetupOnly`, and `openingSetupZones`. Original compilation + physical engine setups occurred in the above historical CI; the new audit does **not** replay or alter that engine run.

The original fixed schedule contains 3 published opponents (ranks 6, 8, 10), 4 independent v3 repetitions per rank, 2 physical candidate slots per repetition, and 5 arms per block: original champion reference; Hood source-order and reference-aligned; Temple source-order and reference-aligned. Thus **24 physical blocks and 120 setup-only samples**. All 120 records reported valid first-turn snapshots, true full-60 source inventory verification and no exception.

For each `(rank, repeat, seed, physicalSlot)` block, compare all four candidate arms against the **unchanged champion reference's `actualPostSetup.opponentDigest`**. The original digest is computed from the source player's observed hand, Active, Bench, Prize identities, remaining-deck **length**, and full 60-copy unordered inventory checksum. It retains source zone positions where represented. **It does not include the order of the remaining source deck**, so these are source *post-setup zone* comparisons, not complete physical source-deal fingerprints.

## Independent result

| Published opponent | Frozen physical blocks | Candidate/reference source post-setup digest matches | Actual first-turn parity |
| --- | ---: | ---: | ---: |
| Rank 6 | 8 | 32/32 | 32/32 |
| Rank 8 | 8 | 32/32 | 32/32 |
| Rank 10 | 8 | 32/32 | 32/32 |
| **Total** | **24** | **96/96** | **96/96** |

Each five-arm block has exactly one source post-setup digest, with **24 distinct reference source digests across 24 blocks**. There are 16 actual candidate-first and 8 candidate-second reference blocks. The 96 comparisons are **highly dependent** contrasts of the same 24 blocks and cannot be read as 96 independent game results or generalized probabilities. Although some candidate exposed-card/Prize identities changed with the input ordering, their opponent source post-setup zone digests remained identical on this schedule.

The new source-only independent comparator `scripts/aichi-source-crosscandidate-setup-audit.cjs` consumes the extracted original JSON, matches all five registered arms of each frozen physical block, rejects duplicates, missing arms or unverifiable samples, and **reports** genuine source-zone mismatches and starting-order differences rather than censoring them. This is deliberately a descriptive audit; source-zone equality must not become an unconditional suitability filter that selects favorable games.

Adversarial synthetic tests in `tests/aichi-source-crosscandidate-setup-audit.test.cjs` cover equal zones, an unequal source zone, a different actual first turn, missing/duplicate/unregistered arms and insufficient observations. They were added to the **existing manually dispatched** `aichi-benchmark-stats.yml`, no push-triggered or compiled-engine workflow was created. [Manual CI #39397749113](https://github.com/FlareZ123/experiment-01/actions/runs/39397749113) finished **success** at research head `c6ba3fb762b4ff2224bdcbd26ee18b288f66e82b`.

## Meaning for canonical comparisons

This strengthens the **observed initial-condition coupling** of the frozen champion/Hood/Temple configurations against those three specific source decks. It does **not** prove that identical source deck order persisted, that a source-first lock was established, that a candidate made information-safe decisions, that actual Prize-taking attacks settled, that a competent opponent acted, or that any trial satisfies the prospective bilateral witness gate.

Do not infer this invariance for New Moon, other candidates, all 32 ranks, additional seeds, other simulator versions, or distinct policies. Candidate-specific mulligans can legitimately lead to different source setup states; the mismatch must be retained and analyzed as a causal setup consequence, including its effect on source bonus-draw opportunities.

**Strategic status unchanged:** 29 of 32 source 60s verified (23, 25, 28 missing); **0 competitively qualified full games**; no evidenced 99.5% single-deck win rate.


## Mandatory timing qualification discovered by compiled native boundary test

A follow-on **opt-in** complete-source-deal observer initially failed on **all 120/120** original scheduled Store captures in [manual compiled CI #39399041181](https://github.com/FlareZ123/experiment-01/actions/runs/39399041181), while the pure source fingerprint and fake-Store tests passed. Its exact first failure was: `Twinleaf dispatch failed after 10 actions (ResolvePromptAction): Expected the pinned PLAYER_TURN phase; 8 !== 2`.

This reveals that the original `captureSetupOnly` stops on the earliest `turn===1` transition, which **can still have Store phase 8** rather than the required settled **phase 2** player-turn root. Therefore the earlier report's label **post-setup** and the 96/96 source-zone parity are limited to **that early turn-1 observation boundary**, not yet authenticated final pre-action physical deals. The source hand, deck and Prize state may still change through outstanding setup processing before player decisions. The 96/96 statistic itself is retained for reproducibility but **cannot be promoted to full settled-source comparability**. This is a genuine observation-design qualification, and the failed optional run must stay in the historical record.

A source-fingerprint capture mode is being tested that waits for the first stable `phase===2` state with settled prompts, records the source's ordered hidden deck and full initial card positions through the existing `fingerprintInitialSourceDeal`, and stops before the first normal action. Such a digest could disambiguate the setup timing issue; do not claim its result until compiled archived evidence succeeds. The existing default v1 historical sampler and its artifacts were not rewritten.
