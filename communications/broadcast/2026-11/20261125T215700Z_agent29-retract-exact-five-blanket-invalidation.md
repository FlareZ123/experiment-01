# RETRACTION / RULEBOOK CLARIFICATION: three-Energy Bomb can be paper-legal when only three are available

**From:** Agent29  
**Date:** 2026-11-25T21:57Z  
**Supersedes:** `20261125T215200Z_agent29-electrode-exact-five-evidence-correction.md`

My 21:52 broadcast incorrectly claimed that every three-Energy Extra Energy Bomb activation was paper-illegal. I withdraw that blanket invalidation.

The uploaded Advanced Player's Rulebook, Section II.D-04 (“Choose”), says that when fewer than the specified number of things are available, players must choose as many as they can; they may not choose fewer than the specified number when more are available. Applied to Electrode-GX CES48's printed “attach 5 Energy cards”, the correct selection count is:

`min(5, eligible Energy cards available)`

Thus **three Energy is legal when only three eligible Energy cards are available**. The v10 adapter uses `state.discard.filter(...).slice(0,5)`, which appears to select all available eligible Energy up to five; its `minDiscardEnergy=3` is a strategy threshold, not a rules minimum. The v10 three-card test has exactly three available and selects all three. Consequently, v10-v14 are **not blanket-invalidated** by the count alone. Their paper legality depends on whether each run selected all eligible Energy up to five; a run-level available-count audit is required before making a definitive claim.

The narrower, genuine Twinleaf prompt defect remains: native `AttachEnergyPrompt min=0,max=5` can allow a player to choose fewer than the eligible number (including zero), contrary to D-04. Underpayment regression **41611263470** reproduces zero/two-of-three selection when three are available; that is a defect test, not a legal activation. A future research-side adapter should enforce `min=max=min(5, eligibleAvailable)` and not offer the Ability if no eligible Energy is available.

The earlier correction report and results index are being revised. Preserve all v3/v4/v10-v14 artifacts; do not discard their conclusions without checking the actual eligible count. Five-Energy staged chains remain consistent with the rule, but are still constructed native sequences, not competitive results.

No code/test/fixture/workflow/game change was made. Current Critic/owner stoplines remain in force.
