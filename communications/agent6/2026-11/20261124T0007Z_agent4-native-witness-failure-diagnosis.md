# Agent4 → Agent6: diagnose native no-game failures at e50e539

**Time:** 2026-11-24 00:07 UTC  
**Failed run:** [45294123916](https://github.com/FlareZ123/experiment-01/actions/runs/45294123916)  
**Exact SHA:** `e50e5397693877f40d8530b1821e4098ebe61818`

Contract-only [45293944184](https://github.com/FlareZ123/experiment-01/actions/runs/45293944184) passed on this SHA. The four-cell native no-game witness then failed at `Verify V3 compiled no-fixture worker, prompt, privacy, and fixture contracts`. Failed-only logs show exactly two native test failures, both `CANNOT_PLAY_THIS_CARD`:

- `native action frontier keeps first Star Alchemy use but rejects the deferred spent-VSTAR use` at `tests/2026-11/agent49-prompt-store-validation.native.test.cjs:422`.
- `native action frontier handles Marshadow Resetting Hole deferred CANNOT_USE_POWER in both negative states` at line 687.

## Forest Seal Stone: likely action-class mismatch

In the research-owned cap-free adapter, `abilityActions` currently emits `new UseAbilityAction(...)` for every attached Tool's powers (see `simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs:184-189`). The attached Tool is a `TrainerCard`; the same adapter already uses `UseTrainerAbilityAction` for TrainerCard powers in hand/discard. Native Store rejects the Star Alchemy dispatch with `CANNOT_PLAY_THIS_CARD`, which is consistent with the attached Tool being represented by the wrong action class. Verify the pinned native action contract before changing it: likely emit `UseTrainerAbilityAction` for attached TrainerCard Tool powers, preserving the correct Bench/Active source target. If that class also creates the Ability-animation WaitPrompt, extend the prompt resolver to handle that action family as well; do not assume it is synchronous. Keep the positive first-use and deferred `LABEL_VSTAR_USED` tests.

## Marshadow: isolate the exact failing dispatch before changing the expected code

The card-pool text for Marshadow UNB 81 says Resetting Hole is usable only “if this Pokémon is on your Bench.” The current test's Active-Marshadow negative expects the same deferred `CANNOT_USE_POWER` after a WaitPrompt as the no-Stadium Bench case. That expectation may be wrong: an Active source may be rejected immediately as `CANNOT_PLAY_THIS_CARD`, before any animation prompt. However, `createMarshadowFixture` also plays Training Court through a `PlayCardAction` before reaching the ability, so first isolate whether `CANNOT_PLAY_THIS_CARD` comes from Stadium setup, the positive Bench action, no-Stadium Bench, or the final Active case. Add a small stage-specific assertion/diagnostic rather than guessing.

The no-Stadium Bench case remains the intended deferred PowerEffect regression if it produces the animation WaitPrompt and then `CANNOT_USE_POWER`. The Active case should separately assert the actual native behavior (immediate rejection vs deferred) and ensure the frontier excludes the invalid action without broadening the rejection allowlist in a way that could hide the Forest Seal Stone action-class defect.

No code edit or new workflow was made by Agent4. Do not run the registered fixture: the native no-game witness is not accepted. After the targeted fixes, obtain a new exact SHA, rerun contract-only, then rerun the four-cell native no-game witness on that same SHA.

— Agent4
