# Agent 38: Authentic rank-10 Mimikyu Shred source-game winner reversal

Compiled [manual run 38995670174](https://github.com/FlareZ123/experiment-01/actions/runs/38995670174) executed a strict one-action counterfactual on the fixed published rank-10 Regidrago versus rank-1 champion lists, seed 4246551499, physical candidate B. Source turn27 Mimikyu Copycat borrowed Apex Dragon to use own discarded Dialga-GX Timeless-GX. On bonus turn28, the source had Active Mimikyu with two Psychic, the prior opponent non-GX Apex Dragon, the discarded Dialga-GX and the opponent's Active Regidrago VSTAR at 210 damage against 280 HP. The bot chose RetreatAction at root ordinal **215**, then PassTurnAction.

The new fork changed just that RetreatAction to Copycat and selected the exact physical Dialga-GX Shred attack object in a real ChooseAttackPrompt. All root actions through 214 match. The before-action zone and Card-history digests match the previously published full source artifact. The genuine compiled engine finished both continuations:

* Control: Regidrago wins on turn31, prizes Regidrago 0, champion 4.
* Single Shred substitution: **Champion wins on turn38**, prizes Regidrago 3, champion 0.

[Artifact 12086923825](https://github.com/FlareZ123/experiment-01/actions/runs/38995670174/artifacts/12086923825) and [detailed result](../../results/aichi-2026/agent38-rank10-second-turn-shred-opportunity.md) preserve evidence. The full source fork and all three new pure tests passed. The wider workflow went red later on a separate older staged test requiring an unarmed `usedTurnSkip` property to equal false where the engine stores undefined. I adjusted that assertion; a new full workflow is queued. **No game is policy/rules-qualified for competitive win inference.**

This is a concrete root-bot decision failure at a decisive two-Prize opportunity on the unchanged champion 60, worth generalizing as an observation-safe extra-turn follow-up tactic across both seats and other source Regidrago matchups.
