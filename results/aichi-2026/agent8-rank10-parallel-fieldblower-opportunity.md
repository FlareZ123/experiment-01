# Agent 8: authentic rank-10 Field Blower opportunity

**17 October 2026 UTC.** Independent source-archive audit, no competitive qualification.

Source: [manual CI 38992559596](https://github.com/FlareZ123/experiment-01/actions/runs/38992559596), artifact [12085698259](https://github.com/FlareZ123/experiment-01/actions/runs/38992559596/artifacts/12085698259), `rank10-source-branch-live-dispatch.json`. Control SHA-256 `9f24184f85cd478e36776f883b9d950b260849c405ec5073d23cdd811f07544b`. Source seed 4246551499; champion Shadow Rider physical B vs source rank-10 Regidrago, candidate actually starts first. This is the unchanged 350-dispatch source control, not a staged game.

## Trace-grounded finding

On turn 28 Regidrago plays `Parallel City` (root step 201), with `WHICH_DIRECTION_TO_PLACE_STADIUM` and candidate-owned `CHOOSE_POKEMON_TO_DISCARD` prompts at root steps 202–203. The turn-27 checkpoint had four occupied champion Bench Pokémon; later pass snapshots consistently show three.

At the champion's **12 pass decisions on turns 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61 and 63**, each `decisionHandBefore` contains `Field Blower GRI`; `publicBoardBeforePass` simultaneously shows Parallel City in play, champion Bench exactly three and opposing Active Squawkabilly ex. At turn 53 the candidate also has one Shadow Rider Calyrex V in hand, and on turns 55 through 63 two copies are in hand. Those Basics cannot simply be Benched if Parallel City's three-slot cap is still applied.

The Field Blower GRI text in the supplied card pool can discard a Stadium in play. The observed source opponent's last attack was Apex Dragon on turn 28. These facts expose a concrete potential **Field Blower -> Stadium removal -> extra Bench slot** line that the generic bot never attempted through twelve observed passes. The archived projection omits some player-level lock state, so this is **not yet proof of an engine-accepted legal Item action**, improved decision quality or a win.

The source control ends at turn 65, with winner Regidrago slot 0; the champion has zero cards in deck and two Prizes left immediately before the terminal transition. This is consistent with deck-out.

## Exact closure test

Within the existing rank-10 source replay infrastructure, fork this same physical B seed at the turn-41 or turn-55 pass: record full predecision Store and lock flags; try the genuine Field Blower Item onto Parallel City and capture acceptance and prompt resolutions. If removal works, test Benching the held V, the next turn's evolution, Energy requirements and opponent response. Re-run the unchanged control and compare whole source State for noninterference. Keep the stronger Store-graph and policy qualification gates fail closed.

**Status:** sourceReplayMechanicsVerified=false; qualifiedForCompetitiveInference=false; zero independently qualified competitive games. The twelve turns are repeated observations inside *one correlated game*.

## Compiled actual-source turn55 follow-up

[Manual CI 38996365617](https://github.com/FlareZ123/experiment-01/actions/runs/38996365617) executed the policy with the pinned Twinleaf compiler on revision `9e2510e4d`. [Source artifact 12087471068](https://github.com/FlareZ123/experiment-01/actions/runs/38996365617/artifacts/12087471068), JSON SHA-256 `5230d0bfe3850f715bda7b4b4be83a22943116998a8ef0581c5c2e9db7cc6ca7`.

The baseline and repeated control reproduced **all 350 root dispatches** and the same terminal Regidrago win (348 game actions, turn65, Prizes 1/2). The altered arm preserved the exact same action prefix through root step314. At **step315**, actual candidate turn55, it substituted `PlayCardAction(Field Blower)` for the bot's original `PassTurnAction`. The real Store accepted the Item, `SelectOptionPrompt` 199 discarded Parallel City, and optional `ChoosePokemonPrompt` 200 preserved existing Tools. The next candidate action Benched `Shadow Rider Calyrex V CRE` in the newly opened fourth slot. The generic bot then Benched `Lillie's Clefairy ex` in the fifth slot.

The initial alternate hit the **350 game-action diagnostic cap** at turn64, with `finished:false`, `winner:-1`. The expanded 500-action follow-up on the same source revision `c5877710e0b4123d426028d651b016c46080a1df` **completed successfully** in [manual CI 38996747322](https://github.com/FlareZ123/experiment-01/actions/runs/38996747322), [artifact 12088150758](https://github.com/FlareZ123/experiment-01/actions/runs/38996747322/artifacts/12088150758). The unchanged control and the intervention **both ended at turn 65 with Regidrago engine winner slot 0 and Prizes remaining [1,2]**. Game actions were **348 control versus 353 Field Blower branch**. This falsifies any claim that the turn-55 removal/Bench intervention alone changed this frozen game outcome; it still establishes one additional legal engine-accepted development sequence that the generic bot omitted.

This proves a narrow engine-accepted same-source sequence missed by the baseline bot. Full Store/policy qualification and competitive performance remain unverified, both flags false, zero qualified games.

## Current-head replay status (17 October)

[Manual CI 39028133753](https://github.com/FlareZ123/experiment-01/actions/runs/39028133753) passed full recorded action-input and own-data-graph checkpoints for the original rank10 control (350/350) and Copycat alternate (235/235). The independent raw pinned-mode policy continuity audit still observed seven Card-history mutations during bot selection. The separate experimental post-super mode observed zero on its distinct trajectory, with five unresolved boundary gaps. No competitive outcomes are qualified.
