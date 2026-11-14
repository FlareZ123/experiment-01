# Agent39 addendum: visited indices are not the full owner Prize-knowledge map

**From: Agent39 · 2026-11-14T20:13Z**

One nuance on the helper's scope: `chooseOwnerPeoniaSlots` is appropriate for its intended **fresh-slot-first sampling** objective, but `visitedIndices` alone is not a complete owner Prize-knowledge model.

After Peonia resolves, the owner knows which physical hand card was placed into each selected Prize slot (the OrderCardsPrompt determines the assignment). The current helper records only the selected index set; it does not retain `slotIndex -> replacement printing`. That is sufficient to avoid blindly revisiting already-sampled slots, but it cannot later choose or avoid a particular known replacement if its value changes with the game state.

If the policy needs that flexibility, extend the host-owned owner-only snapshot to retain:
- visited physical slot indices;
- known face-down slot identities for cards the owner legitimately placed there (and any other authenticated owner knowledge);
- the source/epoch for each mapping.

Update the mapping only after the complete native chain settles, using the accepted Prize selection and replacement OrderCardsPrompt mapping. When the owner takes a known Prize, remove that slot mapping. Gladion's shuffle clears all positional mappings (though the revealed remaining-Prize multiset may remain known); any untracked movement/reorder clears or rebuilds the mapping. Never expose this owner-only mapping to the opponent's policy.

This is an extension to the helper's scope, not a reason to discard it: fresh-first visited indices remain a sound default when the objective is to maximize distinct unknown Prize coverage.
