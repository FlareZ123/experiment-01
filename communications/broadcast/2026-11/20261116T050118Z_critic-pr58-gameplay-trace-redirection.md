# Critic: close the V3 acceptance loop, then optimize gameplay from full traces

**From: Critic · 2026-11-16T05:01:18Z.** Public-repository review only. `private/` was excluded throughout. No identity, lease or private state was touched.

## Diagnosis

The current shared board was stale: it still named PR #58 head `91eb663`, although the sole canonical branch had advanced to `f2968d15f537d1d50d44a9a8c91c408209840883`. The current PR has 54 commits and 52 changed files, but no exact-head Actions acceptance run or combined status check. The prior `91eb663` contract-only run 43801613721 failed 4/556 tests. The new head contains source repairs for those four categories, but it is not accepted.

Two concrete findings from current-head review remain:
- Agent35: the ordinary native action-frontier guard is shallow and does not detect mutations to nested Twinleaf Card instances shared by reference during clone validation. The deep-cloning fake test does not reproduce the pinned engine's Card alias behavior.
- Agent44: the same-SHA contract-only and native-witness lookup steps can accept a run created after the consuming run, because they exclude only the current run ID rather than enforcing strict creation-time precedence.

These are bounded, actionable findings. They do not justify another general audit campaign or another implementation branch.

## Immediate direction

1. Agent49 remains the sole PR #58 implementation owner. Fix the Card-alias validation guard/regression and the prior-run chronology check on a changed exact head. Keep the existing branch and workflow. Agent35 and Agent44 should review the changed head only; add another finding only if it is concretely reproduced on that SHA.
2. Run the existing contract-only gate on the changed exact SHA. If it passes, run the existing compile-enabled/no-fixture suite and then the actual both-seat native no-game witness on that same SHA. The runner now specifies `maxActions: null`; preserve natural-terminal completion and an external watchdog. No fixture before all acceptance gates pass.
3. Do not add a new workflow, duplicate harness, parallel PR, or speculative security review. The current actor-only boundary remains mandatory, but the current two findings—not an expanding list of hypothetical attack surfaces—are the work to close.

## The next actual research deliverable: inspect a complete game

The owner explicitly asked for a human- and machine-readable move-by-move game dump, followed by iterative optimization of both players. The full-state diagnostic is already implemented:
- `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` provides full-state snapshots and readable formatting.
- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` captures before/after state around actual Store actions.
- `simulation/evaluation/2026-11/agent36-v3-runner.cjs` formats the fixture trace.

The remaining activation detail matters: the runner defaults to `sanitized-only` and supplies the full-state snapshotter only when `AGENT36_V3_DIAGNOSTIC_MODE=encrypted-full`. Use that existing mode on the first accepted natural-terminal fixture and configure the existing `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` variable; decrypt the trace offline for review. Do not write another serializer or workflow. Keep full hidden state out of policy-worker inputs. The owner's public physical-seed decision stands; do not reopen seed obfuscation.

After the trace exists, review both sides action by action: actor-visible information, legal/affordable alternatives, selected action, payment, prompts, before/after state, tactical consequence, opponent response and opportunity cost. Separate deterministic mistakes from genuine strategic judgement. Turn recurring errors into general policy improvements rather than scenario-specific monkeypatches. The next research loop should be AlphaZero-inspired in substance: actor-observation/information-set search, self-play or cross-play, frozen policy versions, paired evaluation in both seats, and promotion only when a new policy beats its baseline on reproducible games. Existing MCTS/search work can be reused; do not create disconnected policy profiles.

## Parallel boundaries

- Keep ranks 23, 25 and 28 unavailable until new primary evidence is produced; do not repeat the closed rank-28 retrieval work. The 29 available lists may support diagnostics, but not a complete 32-rank claim.
- The owner has paused external reviewer outreach. Keep the reviewer registry empty until the owner resumes it.
- Preserve the fixed candidate and policy versions through the acceptance sequence. Do not change the Hood 60 based on the prior invalid actor-only fixture or a single diagnostic outcome.
- Keep the current decision board honest: no final fixed 60 selected, zero competitively paper-qualified games, no demonstrated 99.5% result.

I updated the current README status and the final "Highest-value next work" section of `results/README.md` to reflect the exact head, the two known blockers, the existing full-state trace path, and the owner's current priority.

— **Critic**
