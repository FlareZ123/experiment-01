# Agent20: diagnostic plan for the two selected-v3 UNKNOWN_POWER aborts

**Date:** 2026-11-06  
**Status:** proposed; no replay dispatched by Agent20.

## Exact contexts

The selected-v3 report records two new native aborts, both in the rank6 Iron Thorns source matchup against the champion-reference candidate:

| Trial ID | Seed | Candidate slot | Acting seat | Reported turn | Root-action ordinal |
|---|---:|---|---:|---:|---:|
| `6:401:A:champion-reference` | 582147744 | A | 0 | 32 | 141 |
| `6:402:B:champion-reference` | 2765516960 | B | 1 | 17 | 69 |

Both aborts occurred in all three selected-v3 policy arms. The historical Agent39 diagnostic used seed 3738819225, so it does not identify these two new contexts.

## Correct witness

Use `simulation/twinleaf/agent39-live-unknown-power-action-witness.cjs`. It is a read-only Store-dispatch observer that records plaintext `UseAbilityAction` fields, including abilityName, powerName, target/slot information, actor ID, turn/phase, dispatch ordinal, and the rejected error. It preserves the original dispatch result/error.

Do not rely on `agent23-native-decision-dispatch-witness.cjs` as the sole diagnostic. That witness stores a SHA-256 action identity; it does not retain the plaintext ability name.

## Required diagnostic protocol

1. Create a new diagnostic registration; do not modify the frozen selected-v3 registration or its historical 48-attempt artifact.
2. Select only the two exact trial IDs above and preserve their seeds, source/candidate decklists, source seat, pinned Twinleaf revision, policy options, and runtime hooks.
3. Run the two contexts under each of the three original v3 modes, for six diagnostic games total.
4. Wrap the exact native Store boundary with the Agent39 plaintext witness. Record every `UseAbilityAction` in each live game, not only a guessed ordinal. The witness's dispatch ordinal is not the same counter as the v3 root-action ordinal.
5. Preserve every native error. Do not convert `UNKNOWN_POWER` into a pass, skip, or substitute action.
6. Compare source-deal fingerprints and accepted root-ledger prefixes with the original v3 report. If they differ, label the run a changed-code diagnostic rather than an exact replay.
7. Report the rejected ability's exact printed name, power identity, physical actor seat, source Pokémon printing/position, opponent Active printing/ability-lock geometry, and native error.
8. Treat the output as failure attribution only. It is not a competitive sample and must not be added to win-rate denominators.

## Version caveat

The original v3 workflow checked out repository commit `1ad802631d...`. The current main branch's Agent41 runner and some frozen inputs have changed since that run. The current Agent41 runner blob, paper-owner-necessary screen, and canonical actor-composition blobs do not match the v3 registration's frozen hashes. A diagnostic that runs current main must declare those code changes. For an exact-code replay, use the original checked-out snapshot and add only the read-only Agent39 witness, with all added diagnostic files separately frozen.

## Interpretation boundary

The older Agent37/Agent39 investigation attributes a historical rank6 abort to Underworld Door being proposed from a Rule Box Pokémon while the opponent's Active Iron Thorns ex has Initialization. That is a plausible hypothesis for the new aborts, not an established cause. The two new contexts must be identified from their own plaintext witness records before changing the policy.
