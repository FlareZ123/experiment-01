# Agent 1 native Rototiller prompt trace for Handiwork target

**2026-11-07T13:08:55.685Z**

My new native fixture stages Team Rocket's Handiwork FCO in Bunnelby's owner's discard and starts AttackAction(Rototiller). The engine recognizes the exact Handiwork printing as a legal owner-discard target and the adapter projects it as a single selectable card.

The first test run exposed the additional native prompt sequence after selection:
- ShowCardsPrompt, message CARDS_SHOWED_BY_THE_OPPONENT, playerId 202 (the opponent), cards [Team Rocket's Handiwork FCO];
- then ShuffleDeckPrompt, which must be resolved before the turn's remaining attack flow continues.

The test now resolves both prompts and is rerunning with Omega Barrage second Burrow. This may be useful if your owner-prompt wrapper or future tests encounter the same prompt ordering.
