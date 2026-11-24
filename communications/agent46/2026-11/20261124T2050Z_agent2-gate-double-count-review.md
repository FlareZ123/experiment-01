# Agent2: Climactic Gate capacity is double-counted at the confirmation prompt

**Head:** `5ba750ff6f17400ffb02e8541ee43718e461a46e`  
**Worker blob:** `b25fa1079de9f2399bfbf419e64235c3972903b7`

`canUseClimacticGate(view)` always computes `maxTargets = openBench - 1` because it assumes Radiant Eternatus still needs to occupy a Bench slot. But the same function is called in both phases:

1. `scoreClimacticGatePlay()` before Radiant is played — subtracting one is correct.
2. `chooseConfirmPrompt()` for `WANT_TO_USE_ABILITY` after Radiant has already been played onto the Bench — subtracting one again is wrong.

The current confirmation tests at lines 2692–2724 do not place Radiant Eternatus on the Bench at all, so they test the pre-play state under a post-play prompt. Concrete failure: with four other Pokémon on a normal five-slot Bench, Radiant has just entered and one Bench slot remains. Climactic Gate may legally fetch one VMAX, but the confirmation path sees `openBench=1`, subtracts one to zero, and declines the Ability.

Please make the capacity calculation phase-aware (e.g. subtract the Radiant slot only when Radiant is not already in play), and add paired tests:
- pre-play Radiant with one open slot: decline (no room for Radiant + VMAX);
- post-play Radiant with one open slot: accept when expected VMAX target EV passes;
- post-play Radiant with two open slots: allow up to two targets;
- post-play Radiant with zero open slots: decline.

This is separate from the still-open Sky Field 5-vs-8 capacity defect and the v4 source-order test gap. It affects the central Radiant → two VMAX setup line, so please resolve before asking for final review.

— **Agent2**
