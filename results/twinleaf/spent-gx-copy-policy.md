# Default Twinleaf bot retries spent GX attack three times; opt-in resolver selects Shred

**Agent 12, 16 October 2026.** Pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Verified in [fully passing manual CI 38884970803](https://github.com/FlareZ123/experiment-01/actions/runs/38884970803) at research commit `5339d8da6254f5d938f713dfff3e0f7651be4d1f`. This is a source-compatible injected state and **actual SimpleTacticsAi prompt-decision test**, without full source-ranked match setup, competing Supporters, policy qualification, or sampled win rates.

## Mechanism

The pinned `ChooseAttackPromptResolver` sorts unblocked attacks by printed damage (then cost length), ignoring `player.usedGX`. Source rank-10 Aichi Regidrago includes Dialga-GX UPR; a paid Apex Dragon may copy Dialga-GX's Timeless-GX. The engine correctly enforces the used-GX restriction, but the generic bot chooses the 150-damage Timeless-GX over 80-damage ordinary Shred and repeats that same choice on the `maxRetries:3` copy-selection prompt, wasting the whole attack.

## Controlled comparison

[`spent-gx-copy-policy-test.cjs`](../../simulation/twinleaf/spent-gx-copy-policy-test.cjs) invokes a real `AttackAction('Apex Dragon')` from a prepared Regidrago VSTAR with two Grass plus one Fire, discarded Dialga-GX, six occupied Prizes and nonempty decks. A real constructed `SimpleTacticsAi` owns `allPromptResolvers`; the same engine `ChooseAttackPrompt` is resolved by either the generic pinned resolver or the opt-in [GX-aware resolver](../../simulation/twinleaf/spent-gx-copy-prompt-resolver.cjs). The latter temporarily registers a replacement only while the bot is constructed, restoring the registry in `finally`.

| Setting | Chosen attack(s) | Damage dealt | GX spent afterward | Extra turn armed |
| --- | --- | ---: | --- | --- |
| GX already used, pinned bot | Timeless-GX, Timeless-GX, Timeless-GX | **0** | yes | no |
| GX already used, opt-in bot | Shred | **80** | yes | no |
| GX still available, opt-in bot | Timeless-GX | **150** | yes | yes |

All attack choices passed the actual `ChooseAttackPrompt.validate` path; the source engine processed each `ResolvePromptAction`. In this staged board, the corrected option avoids three futile GX retries and reaches a legal ordinary attack.

## Scope and follow-up

The opt-in policy is conservative: it operates only when `player.usedGX===true`, `GamePhase.ATTACK`, and the prompt message is `CHOOSE_ATTACK_TO_COPY`; if the pinned default would choose an already-used GX, it selects the highest-damage unblocked non-GX attack and preserves all other decisions. This is a narrow tactical policy improvement, not proof the source rank-10 Regidrago reliably sets up, survives or chooses an optimal strategic line. It may need composition work to coexist with other experimental copy-prompt resolvers. The policy currently falls back to the pinned resolver if no non-GX alternative is offered; handling that dead end is further work.

The original engine also corrupts last-declared-attack metadata after a failed/canceled copied GX. The separate [metadata regression](apex-gx-denied-history.md) and [two-turn Copycat reproduction](spent-gx-copycat-consequence.md) establish that issue independently. Do not use this test as game-win evidence or a reason to nominate a changed fixed decklist without properly matched, policy-qualified source-game evaluation.
