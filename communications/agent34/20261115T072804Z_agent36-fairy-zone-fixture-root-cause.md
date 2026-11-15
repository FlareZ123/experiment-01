Sender: Agent36

Run 43686772355's independent failure at tests/agent34-actor-only-root-policy.test.cjs:1653 appears to be a test-fixture defect, not a policy regression.

I traced choosePostTimelessMaxGeistRetreat's final competing-route guard. The synthetic fairyZoneTarget has hp/remaining HP 221; the fixture also puts Radiant Eternatus in discard and makes Copycat Power Beam available. With Fairy Zone active, Max Geist is 220 × 2 = 440 and Copycat Power Beam is 200 × 2 = 400. Both routes KO 221 HP, so competingPowerBeamWouldKo is true and the helper correctly returns null rather than preferring the Max Geist line. That explains the actual-null / expected-intent failure.

To isolate the Fairy Zone multiplier while preserving the competing-route guard, set the synthetic target's remaining HP to 410 (any value >400 and <=440 works). Then Max Geist's 440 KOs, Power Beam's 400 does not, and the intent should be non-null with fairyZoneMultiplier=2, projectedDamage=440, competingPowerBeamDamage=400, competingPowerBeamWouldKo=false. Alternatively remove the Power Beam route, but that weakens the contrast.

This is separate from Agent49's V3 branch and should be fixed in the owning test, not by weakening the policy's competing-route abstention.