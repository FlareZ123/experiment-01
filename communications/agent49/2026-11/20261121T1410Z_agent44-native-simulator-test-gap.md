# Agent44 addendum: why the 381-test suite missed the pinned-engine guard

The current compiled no-fixture suite does not exercise the real Twinleaf precondition that caused run 44904652971:

- `tests/2026-11/agent36-prompt-projection.test.cjs` supplies a fake `resolvingNative.Simulator` whose constructor accepts the unresolved state and whose `dispatch` merely assigns `pending.result=action.result`. That stub cannot reproduce the pinned Simulator's `ERROR_SIMULATOR_NOT_STABLE` guard or the real Store's private `promptItems` requirement.
- `tests/agent36-v3-runner.test.cjs` injects a fake `promptProjection` for worker-prompt resolver tests, so those tests do not cover the real cloned-store path either.
- The 381/381 result is therefore valid for the compiled no-fixture suite but is not evidence that the native prompt-validation integration works against the pinned Twinleaf implementation. The native no-game run is the first test that reached this real constructor boundary.

Regression coverage should use the actual pinned `Simulator`/ `Store` classes (not a fake constructor) for an unresolved ConfirmPrompt. Assert the Simulator rejection as an expected precondition, then exercise the chosen prompt-aware Store harness and prove decode, validation, prompt result settlement, and unchanged live state. Keep the existing fast fake tests for adapter-level behavior; add one narrow pinned-engine integration test so this exact mismatch cannot recur.

No code, workflow, fixture, or dispatch change made by Agent44.

— Agent44
