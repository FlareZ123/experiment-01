# Pinned Twinleaf reuses a stale last attack after a player passes

**Agent 1; 16 October 2026.** Source: pinned `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Verification: [manual CI 38849043945](https://github.com/FlareZ123/experiment-01/actions/runs/38849043945), **passed**.

## Error and expected rule

Mimikyu GRI Copycat requires an opponent's non-GX attack **during the opponent's last turn**. If that opponent passes without attacking, their preceding attack from an older turn does not qualify.

The pinned `ptcg-server/src/game/store/reducers/player-turn-reducer.ts` handles `PassTurnAction` by ending the turn without clearing `state.playerLastAttack[player.id]`. `ptcg-server/src/game/store/prefabs/attack-effects.ts` `copyOpponentsLastAttackGenerator` reads that record and checks only whether it is a GX/copycat-tagged attack. It does not check the age of the record. Thus an older ordinary attack can remain copyable after a pass.

## Controlled before/after reproduction

The [`mimikyu-stale-attack.cjs` regression](../../simulation/twinleaf/mimikyu-stale-attack.cjs) stages Mimikyu and Dratini as Active Pokémon. The opponent's previous Dratini Tail Snap (20 damage) is inserted into the source engine's history. The fixture gives each player six occupied Prizes and a nonempty deck to avoid the zero-Prize sudden-death artifact identified separately.

It dispatches a **real `PassTurnAction`**, completes the **two resulting WaitPrompts** through real `ResolvePromptAction` objects, then injects a separate Mimikyu Copycat `AttackEffect` to isolate its conditional response. The attack probe bypasses legal costs and declaration, while the prior Pass and transitions are real.

| Outcome | Pinned baseline | Opt-in repair |
| --- | --- | --- |
| Last attack record after Pass | Tail Snap | absent |
| Turn transition waits resolved | 2 | 2 |
| Subsequent isolated Copycat damage | **20** | **0** |

The compatibility patch [`last-attack-pass-hook.cjs`](../../simulation/twinleaf/last-attack-pass-hook.cjs) is a reversible wrapper on pinned `Store.prototype.dispatch`. For a valid current-player `PassTurnAction`, it clears that player's previous attack record **before** executing the upstream dispatch, so EndTurn observers cannot consume a stale record. If upstream rejects the action, it restores the old record and rethrows. No vendored code is changed.

The earlier failure of [CI 38848735301](https://github.com/FlareZ123/experiment-01/actions/runs/38848735301) resulted from failing to resolve the pending between-turn WaitPrompt before the isolated copied-attack probe; its baseline copied damage appeared to be zero due to suspended effect processing. The test was fixed to resolve those prompts. [CI 38849043945](https://github.com/FlareZ123/experiment-01/actions/runs/38849043945) passed the corrected before/after comparison.

## Limits

This demonstrates stale history plus a controlled compatibility correction in a staged board using an injected earlier attack and later Copycat reducer. A complete rules-legal multi-turn match using proper Card/AttackAction setup is still needed. The fix is opt-in, disabled by default, and broad enough to affect all players' `playerLastAttack` on Pass, so additional checks of other historical-attack consumers are appropriate. It supplies no matchup win-rate or deck-strength claim.
