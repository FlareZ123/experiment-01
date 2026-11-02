# Agent 12: genuine Store proves copied Genesect Techno Blast locks Mew VMAX's next attack, then expires

**2 November 2026. Pinned native card-effect fidelity on prepared board, two physical seats.** This is not a complete source-dealt Aichi game or competitive win.

## Why this test was necessary

After the original rank-5 Mew/Genesect source's **eight** copied Techno Blast attacks passed an independent printed damage/Prize comparison ([same-date report](agent12-rank5-crossfusion-printed-damage-prize-native-20261102.md)), another printed effect remained unverified: Genesect V FST 185 states “During your next turn, this Pokémon can't attack.” When copied by Mew VMAX FST 114's Cross Fusion Strike, the temporary restriction must apply to the **attacking Mew VMAX**, and must expire after the next owning turn. Pure card-text inspection or absence of consecutive native attacks from the 16-arm archive cannot establish correct rejection of an attempted illegal attack.

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` has a specific implementation route: Mew VMAX's printed `COPY_ATTACK_FROM_POKEMON_LIST`, `copy-attack-delegation.ts` executing the donor's cloned attack with `sourceCard.reduceEffect.call(copycatCard,...)`, and Genesect V's `THIS_POKEMON_CANNOT_ATTACK_NEXT_TURN(effect.player)`. The latter writes an Active-slot pending next-turn lock. The correct source card and copied-attack effect must both participate in the actual Store call, and the native GamePhase/owner turn transitions must recognize and expire the marker.

## Reproducible actual native test

New experimental fixture: `simulation/twinleaf/agent12-mew-genesect-nextturn-native.cjs`. One Active **Mew V → Mew VMAX FST**, actually attached **Double Colorless Energy SUM**, a real Benched **Genesect V FST**, opposing Active **Mimikyu PAL** and backup Snorlax, each player with six Prize cards and a small deck. The PAL Mimikyu Safeguard intentionally prevents the copied VMAX's damage: this isolates the **next-turn restriction** from a game ending by Knock Out. Both arms execute the genuine pinned `Store.dispatch(new AttackAction(attackerId, 'Cross Fusion Strike'))`, select the exact original Benched Genesect's Techno Blast from the real native `ChooseAttackPrompt`, and settle all original Store prompts. The engine advances to global turn 6. The opponent passes; on the source Mew's global turn 7, the fixture **deliberately attempts another real `AttackAction`**, records rejection, then legally passes. The opponent passes once more, and on the original owner turn 9, Mew attempts another actual copied attack.

| Actual attacker physical seat | After first printed copy (turn 6) | Next own turn 7 copied attack attempt | Subsequent own turn 9 |
| --- | --- | --- | --- |
| 0 | Mew VMAX `cannotAttackNextTurn=true` | **Rejected** by native Store: `BLOCKED_BY_EFFECT`; turn remains 7 | Marker `false`; copied attack **accepted and prompts settled** |
| 1 | Mew VMAX `cannotAttackNextTurn=true` | **Rejected** by native Store: `BLOCKED_BY_EFFECT`; turn remains 7 | Marker `false`; copied attack **accepted and prompts settled** |

The two arms each generated **two genuine ChooseAttackPrompt settlements** (first accepted Techno Blast, then again after cooldown). Source Mew remained Active throughout, and attack restrictions were checked on the actual Active Pokémon object. No paper-invalid early fresh attack was credited.

**Actual run:** [manual CI 41392329378](https://github.com/FlareZ123/experiment-01/actions/runs/41392329378), workflow `.github/workflows/agent5-owner-root-native.yml` with opt-in `agent12_mew_copy_cooldown_native:true` and exact head `63db93e648046ca762372899b2ccd7fd32c7bfeb`. The compiled two-seat test `tests/agent12-mew-genesect-nextturn-native.test.cjs` **passed** and both source arms completed successfully. Native JSON is inside [artifact 13117609444](https://github.com/FlareZ123/experiment-01/actions/runs/41392329378/artifacts/13117609444), ZIP SHA-256 `21dd47f763f67adc5b2b82cdbe965b874e81b5421de0c7e90294104fb9f67ffa`, 3,042-byte JSON SHA-256 `7626d4662ec3bede8feb5dcad3d0abb4e16d2f8c91f7c24f6a9ddfc5e85c0e2e`.

### Why this remains developmental

The trial uses authentic printed card classes, a real pinned Store and real attack/prompt/turn effects on a **constructed** game state with preattached DCE and established Mew VMAX and Benched Genesect. It does not measure natural setup frequency, all opposing counters, Prize/mulligan variance, match-clock compliance, or strategic play. Nor does it prove every copied donor attack's effects use the correct next-turn marker. It strengthens the particular original rank-5 Techno Blast route from [Agent13's existing 16-arm developmental release](agent13-rank5-v31-corrected-root-native-16arm-20261102.md) without modifying that frozen policy.

The archived original rank-5 native root ledger also showed no immediate repeated AttackAction on the five immediate following Mew owner turns that were actually observed after the eight copied-attack declarations. These were all owner passes, and three further immediate owner-turn outcomes were right-censored by terminal/end of the archived action record. That observational pattern is supportive but could reflect bot choice; the staged **explicit illegal attempted action** is the decisive additional enforcement witness.

**Unchanged benchmark status:** 29 authenticated original opposing 60s of 32, missing ranks 23/25/28, zero competitively qualified complete matches, no demonstrated 99.5% fixed-60 game win rate.
