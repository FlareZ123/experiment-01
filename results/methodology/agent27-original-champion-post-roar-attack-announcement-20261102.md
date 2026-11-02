# Four original-champion post-Celestial-Roar Passes: no native printable attack accepted

**2 November 2026 | pinned original-source, post-choice detached Store attack-announcement probes.** This is a source response audit on three already-selected original Regidrago rank10 versus champion rank1 original 60-card deals. It does not introduce a policy or claim a qualified game.

The [compiled native CI run 41461839999](https://github.com/FlareZ123/experiment-01/actions/runs/41461839999) succeeded at revision `0043fb06b83093bb77bc9db160b2cecdb59909dc`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. It continued the four independent physically accepted dual-Energy resource transfers and settled *Celestial Roar* episode-to-opponent links already archived in [the source-chain report](agent27-regidrago-source-energy-attack-opponent-chain-20261102.md) and [the post-choice owner resource census](agent27-champion-post-roar-pass-context-20261102.md).

The prior [selected profile run 41460538259](https://github.com/FlareZ123/experiment-01/actions/runs/41460538259) passed all source-chain gates but yielded **no attack-probe observations** due to a mistaken observer field: the real pinned `PassTurnAction` uses `clientId`, whereas the observer expected `playerId`. This was independently resolved by reading the pinned [upstream game-actions.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/actions/game-actions.ts). The new [fail-closed source-followup matcher](../../simulation/evaluation/agent27-source-followup-pass.cjs) and [pure tests](../../tests/agent27-source-followup-pass.test.cjs) bind each Pass to actual owner identity and the immediate next turn after an accepted physical Energy prompt.

## Observed attack-announcement results

The selected native root Pass action had already been chosen when the observer cloned the Store state and attempted each printed Active attack in a separate detached clone. This does not alter real decisions, hidden information, source hands, target prompts, or game events.

| Original rank10 source seed | Rank1 original reply turn and actual Active | Public attached Energy at Pass | Printed native clone attack announcements |
| --- | --- | --- | --- |
| `20261106` | Turn21, Radiant Eternatus | 4 Psychic Energy | Power Beam: **rejected** |
| `20261113` | Turn16, Latias ex | 2 Psychic Energy | Eon Blade: **rejected** |
| `20261114` | Turn9, Dialga-GX | 3 Psychic Energy | Overclock, Shred, Timeless-GX: **all rejected** |
| `20261114` | Turn21, Dialga-GX | 3 Psychic Energy | Overclock, Shred, Timeless-GX: **all rejected** |

All **eight** clone attempts across four exact Pass episodes produced `engineAcceptedAnnouncement:false`, `truncated:false`, and no probe error. The same original rank1 deck contained exactly **11 Psychic Energy** and no naturally named Metal Energy or other Energy; the Active board positions lacked printed requirements for those attacks under ordinary Energy matching, including Dialga-GX's Metal requirements. The Store acceptance evidence is stronger than a printed-cost heuristic because it considers the actual loaded native state and its current restrictions. However, the probe returned only a boolean and did not separately certify the rejection reason.

These results materially correct the earlier speculative claim that the rank1 bot simply passed despite having a playable printed Active attack. **No such missed native printed attack was found in these four exact situations.** Rank1 had a legal native Pass, and could have made other decisions on earlier turns. The probe enumerates printed and Tool attacks only; it cannot certify all granted/copied attacks, possible movement and Energy funding lines, hand-Trainer sequences, or the strategic quality of not evolving and moving a Bench attacker. In particular, original rank1 has Mimikyu and Dialga-GX counter-line pieces, and the observed rank1 Dialga play in one reply could be staging future play; that interpretation is untested.

## Fixed canary release disposition

The machine-readable original source profile at [agent27-original-regidrago-min2-source-canary-v1.json](../../simulation/evaluation/profiles/agent27-original-regidrago-min2-source-canary-v1.json) and [release-stage helper](../../simulation/evaluation/agent27-source-profile-disposition.cjs) have established `CONFIG_FROZEN:true`, `BOTH_SEATS_EXECUTED:true`, `PAPER_PAYMENT_VERIFIED:LOCAL_MIN2_ATTACH_ONLY`, `SOURCE_PAYOFF_WITNESSED:CELESTIAL_ROAR_RESOURCE_ATTACK_SETTLED`, and `OPPONENT_CONTINUATION_WITNESSED:ACTUAL_ROOTS_ONLY`. The accepted source physical transfer count is four. These are intentionally narrow native-regression statuses.

There remain **zero competitively qualified games**, two capped original-source treatments and one untimed native terminal, no verified official 25-minute game clock, incomplete paper-rule coverage, untested tactical correctness, and only 29/32 authentic Aichi Top32 lists. No win-rate claim follows.
