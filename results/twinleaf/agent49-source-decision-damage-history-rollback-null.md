# Source-ranked rollback of speculative damage-history writes: no trajectory change on one fixed seed

**Agent 49, 18 October 2026.** Compiled pinned-engine evidence from [manual-only CI 39026248995](https://github.com/FlareZ123/experiment-01/actions/runs/39026248995), run 17 October at commit `fc99f6d8b0778109d489655db21b40a1b29979db`. The complete job passed, including compiled Twinleaf, four pure rollback-hook tests, and the authentic-source single-seed contrast.

## Predeclared question

Can the **thirteen** `damageTakenLastTurn` changes observed across complete real-bot decisions in the stock Simulator account, by themselves, for any difference in the decisions or final headless trajectory for the exact Aichi rank-1/rank-10 source-dealt game under the existing weak bots?

## Fixed methodology

- Exact 60-card source ranks **1 Shadow Rider** (seat A) and **10 Regidrago** (seat B) from `results/aichi-2026/full-decklists.json`, `resolveManifestFile` with existing research mapping allowances.
- Pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; source engine game seed `20261049`, action cap 350.
- Matched flags: `strictPromptValidation`, `forestSealSearchCorrection`, `supporterDecisionCorrection`, `doubleDragonRecovery`, `isolatePolicyRandomness`.
- Run (1) unobserved control, (2) read-only full-decision `damageTakenLastTurn` observer, (3) observer with narrowly scoped restore of each source Card's entry value at the end of `SimpleTacticsAi.decodeNextAction`, before the selected real action dispatches.
- Compare unobserved vs read-only `selectTrajectory` for observer noninterference; compare source deck hashes and actual first-turn seat across baseline and rollback. Compare complete **collected decision-action projection** by ordinal.
- The rollback wrapper only undoes changes to `damageTakenLastTurn` on Card identities present at the decision entry; it does not fix any other speculative Card field mutations, source topology, cloned action/object histories, global session state, or invalid decisions.

Reproducer: [`decision-damage-history-experiment.cjs`](../../simulation/twinleaf/decision-damage-history-experiment.cjs); hook [`decision-damage-history-rollback.cjs`](../../simulation/twinleaf/decision-damage-history-rollback.cjs); [pure tests](../../tests/decision-damage-history-rollback.test.cjs); [manual CI workflow](../../.github/workflows/twinleaf-decision-history-rollback.yml).

## Compiled observations

| Measurement | Unmodified observer | Same source game, history rollback |
|---|---:|---:|
| Monitored complete bot decisions | 189 | 189 |
| Source Card `damageTakenLastTurn` changes detected | 13 | 13 restored |
| First changed decision ordinal | 20 | 20 |
| Finished | true | true |
| Real root actions | 203 | 203 |
| Engine winner seat | 0 | 0 |
| First differing collected policy decision | none | none |
| Reported trajectory fingerprint | `3e8c594d9ec5b02dd92926a3d1d2b3e1885aa1f2a8c633ae8d3cb7df9809687a` | identical |
| Collected policy action SHA-256 | `c3019993d54d58cfc4359ac74248a06acc8519af73d5ac35ce14e508d83e1832` | identical |

The observer-only control and truly uninstrumented source match have identical `selectTrajectory` projections. Samples include Koraidon ex TEF at decision 20, turn 2, 0→10, and repeated Dialga-GX UPR / Trevenant & Dusknoir-GX SMP changes. The rollback undid each sampled field before corresponding Store dispatch; the rest of the bot's source mutation behavior was unchanged.

## Interpretation

This is a **negative causal test** for one field and one specific source-game trajectory under one exact policy, seed, and hook configuration: restoring those 13 observed history writes did **not** alter any collected chosen action or the engine result. The separately proven [controlled Conkeldurr Counter phantom damage](simulator-card-reference-leak.md) remains valid on its conditioned board. It is inappropriate to infer that all source Card aliasing is harmless, that the repaired `post-super` clone's earlier winner reversal came from this single field, or that the 13 writes were individually benign in untested match conditions.

The `selectTrajectory` and selected-action digests are bounded projections rather than byte-for-byte full State/reducer verification. Actual opponent competitive quality, paper-rule coverage, official Aichi clock, and broader seeds remain unqualified. **Qualified competitive games: zero; no inference toward 99.5%.**

## Research consequences

1. Stop attributing the stock-vs-post-super rank1/rank10 engine winner reversal solely to `damageTakenLastTurn`; that hypothesis failed on this seed under isolated rollback.
2. Focus next falsification on a same-Store action/effect at a mutation boundary for **other** leaked flags (`cannotUseAttackUntilLeavesPlay`, `whileInPlayOpponentWeakness`, `movedToActiveThisTurn`) or on copied-attack module-global session contamination.
3. Include a post-decision **source graph noninterference invariant** in competitive qualification and retain untouched, repaired and unobserved controls. This is an engine-integrity gate, separate from strength evaluation.
