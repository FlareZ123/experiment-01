# Rank-1 turn 16: Dimension Valley -> Energy Drive -> actual opposing Eon Blade

**8 November 2026 | Agent11 | One original-source detached-native game-state fork; no qualified game**

## Question

The earlier rank-1 original source mirror at global turn 16 had a genuinely legal but missed attack: Tapu Lele-GX GRI with one Psychic Energy MEE and owner-held Dimension Valley PHF can use Energy Drive for 80 after playing the Stadium. Previous native evidence stopped the attack branch before the opponent responded. The detached defensive branch separately retreated to Trevenant & Dusknoir-GX SMP before Eon Blade and survived, but no attack occurred in that branch. These two branches cannot coexist on the same turn because an attack ends the turn.

The new probe continues the **same cloned Stadium-and-Energy-Drive Store** into the opponent's next turn. This settles the immediate tactical comparison without changing the genuine original source or presenting a simulated full match.

## Native evidence

- Frozen original-source rank1 mirror row: actual source seat 0, global source turn 16; original root SHA-256 `3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a`, 110 original actions, 12 genuine source Passes and zero source attacks. This source match remains unchanged by detached forks.
- Pinned Twinleaf Store: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Native GitHub Actions run 42523127009](https://github.com/FlareZ123/experiment-01/actions/runs/42523127009), `abort-custody` job, dedicated test **PASS** `post-choice exact rank1 source t16 owner-held Dimension Valley -> Energy Drive cloned Store` (15.52 seconds), source `0ec0077f50f98c6b52582f994f1d5b17391bf142`. The combined step was **red** because its separate synthetic pure Store fixture lacked a `bench` array and raised `Cannot read properties of undefined (reading 'findIndex')`. This did **not** occur in the pinned native fork. Fixture amended in commit `dadfabfef79178b80dbbb55cfa79d30ab2450247` and added to an existing pure benchmark gate.
- The native `AGENT11_T16_DETACHED_RAW_DIAGNOSTIC` logged the same-branch receipt: `stadiumNativeAccepted=true`, `attackNativeAccepted=true`, `attackSettled=true`, `attackDamage=80`, `nativeOpponentTurnAfterAttack=true`, `nextActorId=202`, `opponentAttackNativeAccepted=true`, `ownerActiveAfter=null`, `opponentActiveDamageAfter=80`, `pendingPrizePrompt=true`, `unresolvedPromptTypes=["ChoosePrizePrompt"]`.
- **Same branch:** After Tapu Lele-GX deals 80, the actual opposing Latias ex SSP uses Eon Blade and Knocks Out Tapu Lele-GX. A native opponent Prize-selection prompt is pending. Recorded Prize counts remain 6/6 because the prompt has **not** been resolved. The KO is a settled native event; the Prize-taking transition and source next-turn continuation remain unverified.
- **Unmodified original-source pass baseline:** Opposing Eon Blade also knocks out the exposed Tapu Lele-GX; native Prize selection pending. This establishes the threat faced by the original Pass, without ranking the Stadium play against every alternative.
- **Independent pre-attack defensive branch:** Owner Retreat into Trevenant & Dusknoir-GX SMP was Store-accepted, then Eon Blade was accepted and settled for 200 damage while that Active remained in play; source and opposing Prize counts remained 6/6 and prompts were cleared. The branch takes no Energy Drive attack.
- Stored native artifact [agent11 owner resources and cloned evidence](https://github.com/FlareZ123/experiment-01/actions/runs/42523127009/artifacts/13634278003); detailed native logger source [v3 probe](../../../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs) and [native test](../../../tests/agent11-rank1-dimensionvalley-energy-drive.native.test.cjs).

## Strategic consequence

A fundable damaging attack is not automatically a good line. In this exact original-source state, Energy Drive makes progress on opposing Latias ex but immediately exposes a two-Prize Tapu Lele-GX to a published, already-energy-funded lethal return attack. A distinct Retreat line keeps a Pokémon alive for a subsequent turn. The tested defenses and attack are **alternatives**, and the result alone does not establish optimal choice: target HP, subsequent gust effects, future energy, turn sequencing and opponent policy can change the ranking.

The existing funded-Stadium chooser returns a paper preflight candidate and lacks opponent-reply risk or comparison with retreat. A useful shared policy would compare the **whole attack/retreat/opponent-reply branch**, including future Prize implications, and use the actor's public hand/board and native Store legality gates. This exact fork now provides a causal regression fixture for such a policy. Do not simply increase the Stadium branch's action count.

## Qualification boundary

One retrospective original-source state, one opponent printed attack, a detached cloned Store and deliberate opponent action. No original Store actions changed. No opponent Prize-selection decision, complete source next turn, official Japanese Extra clock, two-player policy competence, final fixed 60-card nomination or field win-rate certification. The v4 Energy-unit correction to the funded-Stadium candidate planner was separately Node 22 CI-green; it does not by itself choose the strategically better branch.
