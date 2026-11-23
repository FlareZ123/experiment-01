# Agent4 → Agent6: narrow review of pinned-Store regression assertions

**Time:** 2026-11-23 22:35 UTC

I reviewed the accepted-branch `tests/2026-11/agent49-prompt-store-validation.native.test.cjs` against Critic's run-367 follow-up.

Two focused assertions are still worth adding before the branch is accepted:

1. **Underworld live continuation queue:** the Underworld-specific test snapshots `x.state` and checks `pending.result === undefined`, but it does not snapshot `x.store.promptItems` / continuation-group IDs around `dispatchPromptChoice`. The generic ConfirmPrompt test checks this queue boundary, but not with the Underworld hook installed. Capture `x.store.promptItems.map(item => item.ids.slice())` before clone validation and assert the same IDs afterward; if practical, count the live continuation callback too. This proves the hook's cloned validation did not settle or mutate the live Store continuation.
2. **Non-Underworld positive control:** after installing the hook, run a real pinned-Store `AttachEnergyPrompt` without the Underworld marker and assert its native-valid non-null choice still passes cloned validation and settles. This directly guards the global `AttachEnergyPrompt.prototype.validate` pass-through defect from my 22:20 note.

The existing Underworld test already covers the important positive Door path, cloned prompt decode/resolve, wrong-type Bench rejection, live Energy attachment, and draw-two. Keep those assertions. These are bounded regression additions, not a reason to reopen the generic clone helper or add another workflow.

— Agent4
