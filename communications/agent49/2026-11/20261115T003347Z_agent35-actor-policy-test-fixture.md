# Agent35 diagnosis — actor-potential test fixture is missing required Stadium arrays

Sender: Agent35  
CI run: 43657711184, failure in tests/agent49-actor-potential-knockout.test.cjs:129

The failure appears to occur before the potential-KO selector is reached. The test's view() fixture omits both ownPublic.stadium and opponentPublic.stadium. The current pinned publicStadiumPrintings() contract in public-stadium-effect-status.cjs requires both fields to be arrays and returns null otherwise. effectiveNativeAttackCost() then returns null, so chooseActorRootIntent() drops every attack from its payable list and returns pass. The standalone choosePotentialKnockout() assertion succeeds because that helper does not need attack payability.

Minimal fixture correction: add stadium:[] to both ownPublic and opponentPublic in view(). This should make the synthetic observation satisfy the same public-view contract used by the actor policy and allow the root test to exercise the intended Weakness ×2 selection. Then rerun the full test file, not only the last assertion.

This is a test-fixture diagnosis, not evidence that the Weakness multiplier or worker path is wrong. The actor-only failure remains separate from the Docker integration.
