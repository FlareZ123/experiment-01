# Agent 42: preregistered, outcome-blind paired four-cell start accrual

**20 October 2026. Evidence class:** new pure scheduling/selection model and six synthetic Node 22 tests, with the existing native-v2 intake's full regression suite passing [manually dispatched statistical CI 39427978850](https://github.com/FlareZ123/experiment-01/actions/runs/39427978850). **Zero full games conducted, zero competitive wins certified, no win-rate estimate.**

## Research need

The [actual Temple 24-arm source panel](../aichi-2026/agent42-temple-actual-first-seat-confounding.md) demonstrated a design pitfall: candidate physical seat0 was candidate-second on 12/12 arms, while physical seat1 was candidate-first on 12/12 arms. That panel covered two actual starting-player classes, but physical position and actual starter were perfectly confounded. The [bilateral-v2 read-only four-cell intake](../../simulation/evaluation/agent42-four-cell-coverage.cjs) now records this additional distinction for aligned cross-candidate source-deal pairs. Future registered trials need a prospective way to *attain* four cells without selecting from gameplay outcomes after seeing them.

The repository already provides [fixed-physical-seat actual-start accrual](../../scripts/aichi-outcome-blind-start-accrual.cjs) and a [pre-outcome setup seal](../../scripts/aichi-sealed-start-veto.cjs). This new module specifically composes **two candidate rosters in the same rank, seed and physical seat** while checking that the actual first player and the entire source physical-deal fingerprint match across both candidate setup-only observations. A single-roster setup is insufficient to establish paired comparability.

## Implementation

[`accruePairedFourCells(plan, observations)`](../../scripts/aichi-paired-four-cell-accrual.cjs) consumes a finite precommitted schedule of `(pairId,rank,candidateSeat,seed)` entries, each containing two frozen candidate arm IDs. The plan specifies positive quotas per rank for every combination:

| Physical candidate seat | Candidate first | Source first |
| --- | --- | --- |
| 0 | `seat0-candidate-first` | `seat0-source-first` |
| 1 | `seat1-candidate-first` | `seat1-source-first` |

Each observed pair must match the next expected registered pair in chronological order. Each candidate arm supplies setup-only `firstTurnSlot`, `verifiedByDrawLog`, the player-ID/name/draw-name triple and an opaque SHA-256 source physical-deal fingerprint. The module checks identity, uniqueness, first-draw consistency, same actual starter and same source-deal fingerprint before crediting a four-cell quota. A mismatch or a complete source-deal misalignment is **retained** as a non-selected attempted pair. The first unverified/failed setup is **retained and blocks continuation**. Once quotas fill, any later observation is rejected rather than post hoc admitted.

The result returns every consumed pair, whether it was selected, its source-rank/seat, which cell it met, the reason for omission, remaining quotas, the planned setup-selected paired arms and an explicit `conditionalOnMatchedSourceDeals:true` caveat. It never reads wins, Prize counts, match actions or game-end fields. It does not dispatch games, check real Store action legality, certify the identity of a fingerprint or enforce that a claimed `precommitted` plan has actually been externally timestamped.

## Tests and evidence

[`tests/aichi-paired-four-cell-accrual.test.cjs`](../../tests/aichi-paired-four-cell-accrual.test.cjs) passed **6/6 local Node 22** pure tests: complete four-cell schedule, both starts yet perfect seat confounding, cross-candidate actual-start/deal mismatches, blocked unverified setup, outcome-bearing getters that throw if read, duplicate or altered identifiers. [The existing manual-only statistical workflow](../../.github/workflows/aichi-benchmark-stats.yml) now runs these regressions, the prior five pure four-cell tests, and the full bilateral-v2 gate suite. [CI run 39427978850](https://github.com/FlareZ123/experiment-01/actions/runs/39427978850) finished **success** at head `07f40c973d6cfea24d7da0b60831c61550579e10`; a preceding [CI 39427830460](https://github.com/FlareZ123/experiment-01/actions/runs/39427830460) also passed the existing central strict-v2 tests after the integration code changed, before the workflow explicitly included this new suite. These are code/test outcomes, not simulated wins.

## Interpretation and actionability

**The subset with identical source deals is conditional**, potentially composition- or setup-dependent. It is appropriate for controlled *matched-initial-source-state* diagnostics. It cannot replace a complete unconditional registered-denominator comparison in which candidate mulligan effects, unaligned source deals, caps, exceptions and genuinely adverse pairings remain part of the performance question. The existing [unconditional census](../../simulation/evaluation/agent2-bilateral-unconditional-census.cjs) remains authoritative for those attempts.

Recommended next use: after the canonical common decision policy passes its owner-information and native proposal-State integrity gates, freeze a finite paired setup-only seed queue, perform honest unaltered Store setups of **both** candidates, seal the result before observing any full-game outcomes, and use this helper only to designate aligned four-cell mechanistic comparison strata. Keep the full originally preregistered stream for unconditional strength evaluation.

This improves experiment design while **leaving the evidence board unchanged**: 29/32 exact source 60s, no independently competitively qualified wins, and no demonstrated 99.5% fixed deck. The upstream pinned Twinleaf engine, paper clock and complete policies remain separate unproven gates.
