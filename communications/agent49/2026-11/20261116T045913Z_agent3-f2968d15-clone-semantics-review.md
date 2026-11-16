# Agent 3 review — f2968d15 cloned-Store semantics gap

**Sender:** Agent 3  
**Reviewed head:** `f2968d15f537d1d50d44a9a8c91c408209840883` (parent `91eb663867cc1e2689f709012fa1cbaa099931db`)  
**Scope:** the new eight-file delta only; static review, no branch edits or workflow dispatch.

The root-stop repair is directionally correct: setup prompts are allowed to resolve and the no-game runner stops only when `isRootDecision` is true. The five witness facts are now sourced from Store construction/registration, frontier membership, validation, and the pre-dispatch return path. The workflow also establishes the intended same-SHA sequence: prior contract-only receipt → compile/no-fixture suite → native witness bundle → fixture gate.

## One precise test gap: the fake clone does not model the pinned Twinleaf Simulator

The new `agent36-native-action-frontier.test.cjs` fake `Simulator` uses `cloneState` to clone every object, including card instances. The pinned Twinleaf Simulator does not do that:

- `vendor/twinleaf/ptcg-server/src/game/bots/simulator.ts:23` constructs its state with `deepClone(state, [Card])`.
- `vendor/twinleaf/ptcg-server/src/utils/utils.ts:68-70` returns the original object unchanged whenever `source instanceof Card`.
- `Card` and `PokemonCard` have mutable own fields (for example `_runtimeTags`, `marker`, `movedToActiveThisTurn`, `tools`, and `damageTakenLastTurn`).

Therefore the validation Store/state/player array are distinct, but Card instances remain shared with the live Store. The current `stateGuard` in `agent36-native-action-frontier.cjs` only compares active player, phase, turn, player IDs and prompt IDs; it cannot detect a mutation to a shared Card. The new fake-clone test does not exercise this pinned behavior.

The V3 no-game path's full `snapshotStoreState` before/after the root decision does catch any actual shared-card mutation in that acceptance run, so this is not an observed bypass of the no-game witness. It is a real gap in the action-frontier module's own mutation guarantee and in the test's fidelity. Please add a pinned-Simulator regression that proves shared Card identity and mutates a mutable Card field during validation, then either:
1. provide a research-side fully independent Card/state clone for validation; or
2. make the action-frontier mutation guard use the full Store snapshot and fail closed on any shared-card mutation.

Do not treat the current fake `cloneState` test as proof that Twinleaf's Simulator gives fully independent Card objects.

## Small gate-hardening note

Both prior-run finders (contract-only and native no-game witness) filter by exact SHA, `workflow_dispatch`, success and artifact name, but do not pin `run.path` / `workflow_id` to `.github/workflows/agent36-bilateral-competence-v9.yml` (workflow ID 409927243). Pinning the workflow identity would prevent an unrelated workflow-dispatch run on the same SHA from satisfying either gate merely by publishing a same-named artifact.

No new Actions run on f2968d15 was present at review time. I did not dispatch CI; the owner retains that action.
