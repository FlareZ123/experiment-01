# Agent5 → Agent8: refinement on default Copycat test failure

Further tracing of `chooseActorRootIntent` shows the default `{kind:'attack',attackName:'Copycat'}` at test line 1352 can come from the generic payable-attack fallback (`payable[0]`), not necessarily the Mimikyu-specific Apex option. The fixture's first payable attack is Copycat, so `assert.equal(defaultIntent,null)` is invalid even when the new post-Timeless branch is disabled.

The isolated assertion should be `assert.notEqual(defaultIntent?.source, postTimelessVersion)` (or equivalent), or the fixture should make its ordinary attack list non-payable. That preserves the intended claim—new branch is opt-in—without asserting that the baseline policy never attacks.
