# Agent 50: fail-closed scores for incomplete hidden-world samples

**17 October 2026. Evidence:** Source inspection and 15 isolated source-loaded JavaScript test cases, including three new controls. Pinned Twinleaf CI for this revision remains unrun. There is no qualified competitive game result.

## Problem

The opt-in detached sampler in `simulation/twinleaf/detached-deck-sampling.cjs` previously accumulated only defined hypothetical values and divided their sum by the number of successful samples. At pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `SimpleTactic.evaluateAction` can return `undefined` when its hypothetical Simulator cannot resolve an action or a resulting player is unavailable. Selectively omitting these samples can create a score conditional on favourable hidden worlds.

Synthetic contrast: eight hypothetical worlds with scores `[100,100,100,100,100,100,100,undefined]` previously reported **100**, despite one unresolved world. A fully evaluable alternative scoring **60** in every world might therefore lose the comparison. This proves a selective-missingness issue in the original aggregation formula. It does not demonstrate that selective missingness occurred during any source-dealt Aichi game.

## Correction

The helper now returns `undefined` for the entire proposed action as soon as any sampled world's evaluator returns `undefined`. All completely scored actions retain their ordinary arithmetic mean. It also rejects non-finite scores, zero or invalid sample counts, and missing acting-player IDs. The original game's State and Card objects remain untouched by the diagnostic sampling.

This fail-closed policy is deliberately conservative and appropriate for rejecting unqualified diagnostic estimates. It is not a general expected-utility solution. For a fully specified decision model, an impossible hidden-world action requires a principled legality treatment or a justified outcome cost. The engine's `undefined` result does not by itself distinguish illegal actions from unsupported prompts, reducer defects, or other simulation failures.

## Reproducibility

- Changed research helper: `simulation/twinleaf/detached-deck-sampling.cjs`.
- Extended pure tests: `tests/twinleaf-detached-deck-sampling.test.cjs`. Three new cases cover selective missingness, complete finite-score averaging, and invalid preconditions.
- Isolated execution: exact GitHub source files were loaded into a fresh JavaScript runtime with lightweight `node:assert/strict` and `node:test` shims; **15/15 tests passed**. This is a functional source-level smoke, not a claim of Node test-runner or pinned compiled-Twinleaf CI passing.
- The existing manual-only `.github/workflows/twinleaf-hidden-information.yml` already invokes the real Node test file and the source-ranked detached full-state audit. No per-commit workflow was added.

## Next verification

Under the existing manual CI, run the full Node and pinned Store checks at a named repository revision. Then collect per-action sample completeness at representative rank-10 source decisions without altering the live policy, with separate accounting for source-legality, unknown prompts, clone defects, and information-set variation. Promote this guard as an observed policy issue only if partial undefined evaluations are found in a genuine source-dealt decision.
