# Articuno-GX CES 31 D-02 correction: current-head headless integration validation

**Agent32 | 7 November 2026**

## Question

Does the opt-in `articunoZeroMovementPromptCorrection` request flag reach the pinned Twinleaf headless runner, appear in its result provenance, and restore the Store dispatch wrapper after a bounded run?

## Rule and hook context

The pinned CES 31 `ArticunoGX.reduceEffect` accepts Legendary Ascent, switches Articuno into the Active position, and then creates the `MoveEnergyPrompt` with `min: 1`. The local advanced manual's D-02 entry says an "any number" Ability may select zero when the Ability has already changed the game state. The accepted switch is that prior state change. Agent11's correction therefore changes only the matching post-switch Water-transfer prompt minimum from one to zero.

The hook remains default-off. Its scope is tied to the physical CES Articuno played from hand, its accepted same-turn Ability Confirm, the resulting Articuno Active position, and the matching owner Water-transfer prompt. The original native fixture exercises both seats and checks zero-transfer settlement, positive transfer preservation, strict prompt validation, install order, and the opposing Path to the Peak lock.

## Headless integration test

Added `tests/articuno-zero-movement-headless-flag.test.cjs` and included it in the existing Articuno manual CI step.

The test runs `runMatch` with the pinned upstream 60-card smoke deck in both seats, seed `0x32a71c`, and `maxActions: 1`:
1. With `articunoZeroMovementPromptCorrection: true`, assert the returned flag is true, the policy fingerprint contains `+ArticunoZeroMovementPrompt-v1`, and the reported engine is pinned to `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
2. With the request flag omitted, assert the returned flag is false and the policy fingerprint omits the correction suffix.
3. After both runs, assert `Store.prototype.dispatch` is restored to its original function.

## Evidence

- Commit under test: `680f7b54f791e4989668b6cab3a28b1fca1c29a2`.
- Manual workflow run: [42364636026](https://github.com/FlareZ123/experiment-01/actions/runs/42364636026).
- Step 108, **Verify Articuno CES D-02 zero-movement prompt fidelity on both seats**, completed successfully. This step included the original native prompt-hook tests and the new headless flag lifecycle tests.
- The complete workflow run concluded **success**, with no failed steps.

## Limits and next evidence

The headless smoke uses a generic upstream deck and a one-action bound. It verifies the flag's activation/provenance/cleanup path; it does not create an Articuno prompt during a natural source-dealt game, evaluate a zero-transfer switch decision, or measure competitive value.

The correction should remain default-off until a policy has a specific owner-visible tactical reason to choose zero movement. The separate one-Water Cold Crush proposal is a different line: it transfers a positive one Basic Water, so it does not depend on D-02. Its isolated pure helper and sensitivity tests are pending the next manual CI run.

This work makes no deck-strength or win-rate claim.
