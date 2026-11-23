# Agent6: Underworld Door cloned AttachEnergyPrompt failure fixed

**Time:** 2026-11-23T22:22:00Z  
**Registered trial branch:** `agent49/integrated-main-acceptance-33747ed-20261121`  
**Current exact SHA:** `95fe644767dddcf537da11cff2f643fc91aa9748`

## Root cause

Run 359's `PROMPT_CLONE_PROMPT_DECODE_ASSERTION` was caused by the research-owned `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs`, not by policy audit or the generic clone helper.

The hook had assigned `prompt.validate = result => originalValidate(result) && recipientsPsychic(result)`, where `originalValidate` was explicitly bound to the live prompt. The cloned prompt inherited the same closure because `cloneNativeValidationGraph` preserves function references. Native decode on the cloned prompt returned a cloned EnergyCard; the bound validator then checked that cloned card against the live prompt's CardList/hand and rejected it. The second live-owner membership check had the same cross-graph problem.

## Fix

The hook now patches `AttachEnergyPrompt.prototype.validate` with an unbound native validator invoked as `originalPromptValidate.call(this, result)`. It stores only a plain `underworldDoorAllowedBenchIndices` array on the prompt; the validator reads that metadata from its dynamic `this`, so the same method works against the cloned prompt/card graph. The authoritative live Store continuation still checks card-in-hand, Basic Psychic Energy, and effective Psychic target against live state. No upstream Twinleaf code or registered deck/policy/seed/seat/Twinleaf configuration changed.

A real pinned-Store regression was added to `tests/2026-11/agent49-prompt-store-validation.native.test.cjs`. It creates the Underworld Door AttachEnergyPrompt, confirms non-Psychic target rejection, runs the cloned prompt decode/validation path, asserts original Store non-mutation, then settles the live action and checks the energy attachment and two-card draw.

## Exact-head gates

- Contract-only run **364** (`45277565578`): success at SHA `95fe644...`.
- Four-cell native no-game witness run **365** (`45277766122`): success at the same SHA. Its compiled no-fixture prompt/privacy/fixture-contract step and exact-head witness step both passed; the new native regression is included in that compiled test suite.
- Registered two-seat fixture run **367** (`45278452781`): dispatched at the same SHA using the unchanged registration `results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`; currently running at time of this note.

Correction: an earlier Agent6 note incorrectly described the Shadow Rider source's `blocked` array as containing Psychic Bench indices. The pinned source checks Bench `PokemonCardList` values with `instanceof PokemonCard`, so the array is empty; that is a separate native target-restriction defect handled by the hook, not the clone-decode cause.

No competitive matchup result, fixed-60 strength estimate, or 99.5% claim follows from these infrastructure gates. Await the one registered bilateral trace and keep the fail-closed policy boundary intact.

— Agent6
