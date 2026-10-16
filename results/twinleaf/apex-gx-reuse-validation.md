# Regidrago Apex Dragon: spent GX allowance and completed Prize prompts

**Agent 12, 16 October 2026.** Pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Manual-only compiled CI 38883186841](https://github.com/FlareZ123/experiment-01/actions/runs/38883186841) **passed**, on research SHA `258b018a207c4316d588eea13644e76cd6f6d5d3`. All prior Apex workflow checks passed too. The results are **staged game-action mechanics**, not sampled game wins or competent source-list policies.

## Question

When a Regidrago VSTAR copies Dialga-GX's Timeless-GX using its own paid Apex Dragon attack, does a prior GX use suppress the copied GX and permit a different copied attack? The paper-rule requirement is once-per-game GX use. The pinned Dialga-GX handler calls `BLOCK_IF_GX_ATTACK_USED(player)` before setting `usedGX` and `usedTurnSkip`; the pinned copy-from-list generator offers up to three selection attempts.

## Method and observed evidence

New [actual AttackAction regression](../../simulation/twinleaf/apex-gx-reuse.cjs) reuses [preparedRegidrago](../../simulation/twinleaf/apex-attack-action.cjs): manually staged Active Regidrago VSTAR with two Grass and one Fire Energy, a discarded Dialga-GX UPR, nonempty decks, six occupied Prizes per side, and opponent Active Shadow Rider Calyrex V. It dispatches `AttackAction('Apex Dragon')` and resolves the engine's real `ChooseAttackPrompt` using `ResolvePromptAction`. It tests independent fresh and previously-spent GX positions, resetting copy sessions between tests.

| Staged case | Printed action/copy choice | Observed target damage | GX marker | Bonus turn |
| --- | --- | ---: | --- | --- |
| GX available | Apex Dragon → Timeless-GX | 150 | consumed | armed |
| GX previously used | Apex Dragon → Timeless-GX | 0 | still consumed | **not** armed |
| Retry on same spent-GX attack | Choose Dialga-GX Shred | 80 | still consumed | **not** armed |

The second case exposes a second pending `ChooseAttackPrompt`, which is then successfully resolved by selecting Shred. In this tested pinned Store path, the once-per-game GX restriction is enforced through an attack copied from the discard pile, and an illegal copied GX choice does not block a legal retry. All assertions passed in the manual CI.

## Repair of a misleading longstanding workflow failure

The same workflow had failed previously at [`regidrago-prize-window-interaction.cjs`](../../simulation/twinleaf/regidrago-prize-window-interaction.cjs), asserting Budew should already be Knocked Out immediately after the copied Phantom Dive's `PutDamagePrompt`. The [prior failed run 38882872543](https://github.com/FlareZ123/experiment-01/actions/runs/38882872543) recorded **60 Bench damage, zero taken Prizes and a pending `WaitPrompt`**. This was a premature observation during the attack lifecycle.

The test now resolves pending engine `WaitPrompt` and `ChoosePrizePrompt` actions and uses `Player.getPrizeLeft()` to count remaining Prizes. The passing compiled run observed:

- **Baseline Rolling Iron**: protected Active Mimikyu PAL takes zero damage, Budew ASC survives, zero Prizes taken; three WaitPrompts resolved.
- **Opt-in Phantom Dive**: protected Active still takes zero, Budew is Knocked Out and moved to defending discard, **one actual Prize** taken; WaitPrompt, ChoosePrizePrompt, WaitPrompt, WaitPrompt resolved.

This verifies the decisive staged Prize transition when the full engine's attack/prompt lifecycle finishes. The chosen board combines cards from different opposing source rosters and is explicitly synthetic.

## Limits and next gates

These boards were injected. They omit normal legal startup, card search, evolution, attacker promotion, realistic opponent choice, hidden information, and complete-game response sequences. The GX test does not evaluate all printed GX-copy targets, nested Mimikyu Copycat, or a GX-denial policy faced with one remaining retry; the Prize fixture does not establish a tournament matchup. No reported output should enter the 99.5% benchmark's win-rate evidence.

Next: add declarative history/attack-state checks around failed GX selection (the upstream `openCopyAttackSession` overwrites last-attack metadata before source reduction), verify no stale invalid copy session or hidden alternate selection leaks into future turns, and exercise the source-locked ranked matchup with actual player's options after simulator clone and opponent-policy qualification.
