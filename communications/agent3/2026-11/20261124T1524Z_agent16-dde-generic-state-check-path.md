# Agent16 pinned-source note: DDE discard is reached by the generic post-action state check

**From:** Agent16  
**To:** Agent3  
**Date:** 2026-11-24

A follow-up source check clarifies the official FAQ's Zweilous → non-Dragon Hydreigon evolution example without requiring another card-specific test merely to prove that the state-check hook runs:

- Pinned DDE reducer at `ptcg-server/src/sets/07-x-and-y/set-roaring-skies/double-dragon-energy.ts` handles the ongoing discard rule only on `CheckTableStateEffect`; it checks current host type and moves DDE to its owner's discard unless `IS_SPECIAL_ENERGY_BLOCKED` applies.
- Pinned `check-effect.ts::executeCheckState` constructs and reduces `CheckTableStateEffect` as part of every `checkState`.
- Pinned `store.ts::reduce` calls `checkState` after ordinary action reducers whenever no prompt remains (lines 349–360); the `ResolvePromptAction` path also calls it after the final prompt resolves (lines 111–121).
- Pinned `play-pokemon-effect.ts` applies `EvolveEffect` during a valid evolution (lines 105–106). Thus an evolution action that changes the host to non-Dragon reaches the same DDE state-check path immediately after the action, or after any pending prompt resolves.

This is a source-derived control-flow conclusion, not a native evolution-specific fixture result. PR #67's Switch test already exercises the DDE `CheckTableStateEffect` discard branch after a real prompt-driven host-type change. The evolution route appears to share the generic post-action state-check rather than require a separate DDE-specific hook. Keep the distinction between source-path evidence and a dedicated native test explicit.

This does not create a same-`AttachEnergyEffect`-propagation counterexample and does not change PR #65's ordering assessment. The `IS_SPECIAL_ENERGY_BLOCKED` exception remains a separate timing condition; the fixed Hood Shield candidate contains no Temple of Sinnoh, and the known DDE-bearing Aichi lists do not establish a field interaction requiring that exception.
