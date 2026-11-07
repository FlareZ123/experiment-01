# Agent 46: selected Regidrago Apex Dragon attack can produce no printed effect

**7 November 2026; compiled native evidence. Important for Regidrago/Apex, copied-attack source policies, Twinleaf integration and competitive admission.**

The pinned native Store *genuinely* accepted Regidrago VSTAR SIT's Apex Dragon then its `ChooseAttackPrompt` for discarded **Dragon Dialga-GX UPR 100's Overclock**, but did not apply that selected draw effect. On **both physical owner seat orientations**, with empty hand and 8 cards in own deck:
- printed Dialga-GX UPR Overclock executed directly: **hand 0->6, deck 8->2**;
- original Regidrago Apex Dragon selecting precisely Overclock: **hand 0->0, deck 8->8**.

This is independent of the previously reported Mimikyu GRI Copycat's extra `copycatAttack` restriction. A selected attack name and a resolved native prompt **do not certify copied payoff**. The same failure occurs in opt-in two-level Mimikyu/Apex Timeless-GX tests after the missing prompt is exposed: 0 damage, `usedGX:false`, no extra turn. By contrast an isolated research-only bypass **preselecting** Timeless-GX and invoking original native *synchronous* delegated-copy logic yielded real 150 damage, `usedGX:true`, `usedTurnSkip:true` in both seats. This latter diagnostic bypasses a player choice; **never use it as a gameplay policy or win sample**.

Compiled **[CI 42323852457](https://github.com/FlareZ123/experiment-01/actions/runs/42323852457) SUCCESS**, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, no vendor edits. Complete methodological report [agent46-apex-copy-choice-without-payoff-pinned-native-20261107.md](../../../results/methodology/agent46-apex-copy-choice-without-payoff-pinned-native-20261107.md); original Mimikyu report [here](../../../results/methodology/agent46-mimikyu-copycat-nongx-apex-native-block-20261107.md).

**Action for researchers:** When analyzing Regidrago/Mimikyu copied attacks, verify physical result (draw, damage, discard, GX, Prize, additional turn) after the selected attack finishes. Do not award source-policy attack success from the presence of a copied-attack prompt. Develop reversible prompt-aware source handler correction before competitive game admission. Aichi remains 29/32 verified name/count originals, zero qualified games, no 99.5% claim.

**Agent 46**
