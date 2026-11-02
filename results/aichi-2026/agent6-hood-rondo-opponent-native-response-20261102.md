# Agent 6: settled native Hood/Rondo attack, two Prize pickups, and opposing real Tackle attack

**2 November 2026 | 4 staged actual Store cases | two physical seats | no full-match qualification**

This work extends the earlier [complete two-Prize Hood/Rondo local action](agent6-hood-rondo-native-prize-promotion-20261102.md) by making the opponent's immediate next attack a genuine Store action. The previously staged Thorns KO transferred turn to the opponent (`GamePhase.PLAYER_TURN=2`, global turn 5); merely showing a promotion did not establish an opponent continuation.

## Additional controlled setup and mechanism

For the `opponentReply:true` opt-in variant of [the native stage](../../simulation/twinleaf/agent6-skyliner-public-suppression-native.cjs), the opponent's first Benched Pidgey MEW is **pre-attached to two synthetic Basic Psychic Energy** before the original owner attacks. This printed Basic has `Tackle` at `[Colorless,Colorless]` for 20 damage, as confirmed in pinned `ptcg-server/src/sets/10-scarlet-and-violet/set-pokemon-151/pidgey.ts`. Source owner still starts uncharged Active Latias SSP with attached Stealthy Hood UNB and two-Psychic Clefairy on the Bench; opposing Active Iron Thorns ex TWM with 20 damage and five Benched Pokémon.

In the unjammed case, the *native* Store accepts the owner's genuine retreat, Full Moon Rondo attack, resolves actual Knock Out + two Prize selections + opposing promoted funded Pidgey. After the genuine transition to the opponent's next turn, the runner submits `new AttackAction(enemy.id,'Tackle')` and resolves only native animation `WaitPrompt` via `ResolvePromptAction(id,null)`. It verifies that the same original owner Clefairy ex JTG Active takes exactly **20 damage** and the new native response leaves no prompts pending. The owner next-turn continuation remains untested.

The opposing Active Tool Jammer arm tests that the same initial retreat from uncharged Latias is rejected because Tool Jammer suppresses Stealthy Hood and exposes Initialization; there is no selected owner attack or ensuing reply in that arm. No turn passing is improvised for the blocked arm.

## Independent compiled evidence

[Manual CI run 41482138209](https://github.com/FlareZ123/experiment-01/actions/runs/41482138209), [artifact 13160970713](https://github.com/FlareZ123/experiment-01/actions/runs/41482138209/artifacts/13160970713), downloaded ZIP SHA256 `528288c068b0e076bdf65e434d463d950c2a6abfd96b835cfcadeda128731d3a`, agrees with GitHub artifact digest. Embedded `agent6-hood-opponent-reply.json`.

- Unjammed physical source **seat 0**: original owner obtained two Prize cards, opponent's promoted Pidgey initiated native `Tackle` on turn 5 as physical seat1, attack accepted, three native WaitPrompts cleared, owner's Active Clefairy received 20 damage, no unresolved prompt.
- Unjammed physical source **seat 1**: same result, true opponent physical seat0, original owner's Active Clefairy received 20 native damage.
- Opposing Active Jammer variants, both seats: native owner retreat rejected (cost2), owner never attacked, no artificial opponent response generated.
- Summary: `stagedNativeCases=4, failedChecks=0, qualifiedCompetitiveGames=0`. Successful rows recorded `replyAttempted=true`, `replyAccepted=true`, `ownerDamageBefore=0`, `ownerDamageAfter=20`, `resolvedReplyWaitIds=[6,7,8]`, `pendingPrompts=[]`, after opponent native Tackle.

## Evidence status

This is a reproducible *staged owner action and opponent local response*, stronger than checking an accepted action or synthetic promotion alone. All starting cards and Energy remain artificially installed; only Pidgey's immediate reply is scripted; it does not defend against a skilled rank6 deck or model its natural 60-card action policy. A prospective same-deal original owner+opponent full match with a registered, symmetric chosen policy remains missing. Keep the research effect hook and public Hood selector default-off.

29 of 32 original Top32 printed sixties authenticated, ranks23/25/28 missing, zero full-paper qualified games and no demonstrated 99.5% fixed-deck win rate.
