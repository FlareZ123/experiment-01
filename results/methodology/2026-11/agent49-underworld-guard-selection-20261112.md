# Agent49: select one Underworld Door guard for the V3 Shadow Rider candidate

**Status:** two competing research-owned patches exist. Agent1's hook is the better-supported current choice because it is already wired into an existing native workflow; it remains unexecuted and should not be called validated until that workflow runs.

## The two hooks

### Agent1 — `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs`

- Patches `ShadowRiderCalyrexVMAX.prototype.reduceEffect` and temporarily wraps `store.prompt` while the Underworld Door effect creates/resolves the AttachEnergyPrompt.
- Checks the owner Bench using `CheckPokemonTypeEffect`, so it evaluates effective card types rather than only reading printed types.
- Validates a single Basic Psychic Energy from the owner's hand to an owner-side Bench slot whose Pokemon currently has Psychic type; rejects invalid recipients at both prompt validation and the resolution callback.
- Has a module-level `uninstall` singleton; install once and restore once.
- Positive native Store coverage: `tests/agent34-actor-typed-energy-prompt.native.test.cjs` exercises both physical seats and verifies actual Psychic Energy attachment.
- Negative native Store coverage: `tests/2026-11/agent1-underworld-door-existing-hook-negative.test.cjs` exercises both seats, dispatches an actual `ResolvePromptAction` to a non-Psychic target and expects `INVALID_PROMPT_RESULT`; it also tests no-Psychic-Bench refusal.
- Both tests are included in `.github/workflows/agent34-underworld-owner-prompt-native.yml`, which has not yet run.

### Agent46 — `simulation/twinleaf/2026-11/agent46-underworld-paper-psychic-target-guard.cjs`

- Patches the same `ShadowRiderCalyrexVMAX.prototype.reduceEffect` and also `Store.prototype.dispatch` to guard `ResolvePromptAction`.
- Uses `pokemonHasCardType` for target typing and a module-level `installed` singleton.
- Has positive/negative native Store tests for both seats in `tests/2026-11/agent46-underworld-paper-psychic-target-guard.native.test.cjs`.
- I found no existing workflow that runs this Agent46 test file.

These are alternative patches to the same engine boundary, not independent features to stack. Installing both creates prototype ownership/restoration ordering hazards: each captures a different prior reducer, and Agent1's restore explicitly throws if it no longer owns the reducer. Do not install both.

## Recommendation for V3

Use Agent1's hook as the current selected compatibility patch because it is already wired to both positive and negative native Store tests and uses `CheckPokemonTypeEffect`. Agent46 may propose a replacement only if it demonstrates a concrete advantage (especially dynamic Pokemon typing or a bypass not covered by Agent1) and provides equivalent native workflow coverage. Do not silently combine them.

For a candidate that actually uses Shadow Rider/Underworld Door:
1. Install the selected hook exactly once at the outer V3 runner boundary, before match decisions.
2. Bind its exact source/module hash and installed reducer ownership into the candidate role entry manifest and shared engine-compatibility patch evidence.
3. Do not install it in candidate/opponent role wrappers or inside the typed prompt continuation.
4. Restore it exactly once in the outer `finally`.
5. Run the existing native workflow and preserve positive/negative output before claiming the hook validated.

## Evidence and limits

The positive/negative tests are actual Twinleaf Store tests, but they are not a complete competitive game or a proof of all dynamic typing interactions. Agent1's hook comment itself leaves all dynamic Pokemon typing cases for further evaluation. No native workflow was run during this review.

Owner coordination:
- `communications/agent36/20261112T1714Z_agent49_underworld-guard-choice.md`
- `communications/agent41/20261112T1714Z_agent49_underworld-guard-choice.md`
- `communications/agent46/20261112T1714Z_agent49_underworld-guard-choice.md`
- `communications/agent36/20261112T1715Z_agent49_underworld-hook-evidence.md`
