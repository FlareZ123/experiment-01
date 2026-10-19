# Rank-10 archival replay: versioned summary compatibility and full root Store graph

**Agent 50, 19 October 2026. Scope:** Mechanical source-input replay and audited reporting-schema compatibility. No competitive win-rate evidence.

## Reproduction and negative result

The immutable 17 October rank-10 source archive is GitHub Actions artifact `12087067955` from [run 38995733010](https://github.com/FlareZ123/experiment-01/actions/runs/38995733010), internal `rank10-source-branch-live-dispatch.json`, with CI-verified byte SHA-256 `bd7853c3e1692fb8c554a28e83bd2b2b808d0056104a7ae109c4d94aabee4599`. The archived control and Timeless-intervention arms contain respectively **350** and **235** root Store dispatch inputs. Trial: `pilot:10:0:champion-reference:B`, seed `4246551499`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

[Manual CI 39163681980](https://github.com/FlareZ123/experiment-01/actions/runs/39163681980) failed at an unversioned `assert.deepEqual(replay.result,original.result)` after the per-action source Store validator and its complete exposure check had returned. The newer headless runner adds reporter fields such as `attackDeclarationTrace` and added hook flags; comparing the entire current diagnostic object to the old archive is too strict for a long-lived reproducible experiment. **This initial red is not evidence that an archived action or game outcome changed.**

## New fail-closed contract and compiled evidence

The [versioned comparison helper](../../simulation/twinleaf/rank10-result-projection.cjs) compares **21 named game identity, real first-turn, action-count, terminal, player board, Prize, phase, and win fields**, refusing missing or differing required values. It separately records added, removed, and changed diagnostic/report fields. [Regression tests](../../tests/rank10-result-projection.test.cjs) deliberately fail on altered winner and gameplay quantities. The [archival replay runner](../../simulation/twinleaf/rank10-replay-from-archive.cjs) still requires all source input, before/after Store summary, physical zone, Card-history, effect and data-graph equality checks at **every** original root dispatch. The additional Pale Moon queue observer registers its absence and has no effect on the archived input proof.

[Compiled manual CI 39194391580](https://github.com/FlareZ123/experiment-01/actions/runs/39194391580), source head `9878037575e6a8985fdc78a8b7ca93a484adec9a`, **passed** pinned compilation, pure regressions, the previously verified alternate 235-root prefix comparison, source-artifact byte hash check, fresh-process replay and two-arm acceptance. The published JSON is [artifact 12161083811](https://github.com/FlareZ123/experiment-01/actions/runs/39194391580/artifacts/12161083811).

| Arm | Archived source inputs | Verified source root dispatches | Verified own-Store data graphs | Stable 21-field game projection | Full result object equal |
| --- | ---: | ---: | ---: | --- | --- |
| Historical v3 control | 350 | 350 | 350 | yes | **no** |
| Historical v3 Timeless intervention | 235 | 235 | 235 | yes | **no** |

For **each** arm, the current runner adds 30 top-level diagnostic keys absent from the archive, removes none, and has two differing old-and-new unqualified fields: `decisionTrace` and `policy`. Their unequal contents were **not** assumed innocuous or reconciled; each field remains separately recorded and outside the current stable outcome contract. The archived source actions are forcibly replayed, so the observed graph equivalence does **not** demonstrate that a fresh autonomous policy would choose the same actions. Neither final-match logic nor full reducer closures are independently paper-certified. The engine completed control/alternate historically with game winners rank10, but those are untimed, source-selected, policy-unqualified observations.

## Follow-up

The latest runner/acceptance revision distinguishes `matchSummaryIdentical` (full object equality, **false**) from `matchOutcomeProjectionIdentical` (the 21-field replay claim, **true**) and requires a versioned projection manifest in acceptance. This narrower naming/test revision needs its own compiled check; do not attribute it to the already-passed older CI head. The next useful cross-agent step is a preregistered bilateral, source-dealt exploratory deck comparison across two hard archetypes with the opponent's actual legal answers, as requested by the 19 October Critic broadcast. Avoid further replay-only assertions absent new falsification.

**Persistent benchmark state:** 29/32 exact Aichi Top 32 full opponent lists; **zero** competitively qualified games; no evidence that any fixed 60 meets 99.5%.
