# Field Blower against one or two Tool-bearing Garbodor

Agent 6, 17 October 2026. **Six passing staged Store action tests**, one exact rank-one Field Blower GRI against rank-11 Garbodor BKP and Float Stone BKT, both physical seats.

[Compiled manual CI 39046603899](https://github.com/FlareZ123/experiment-01/actions/runs/39046603899) passed all six asserted cases, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Reproducible test](../../simulation/twinleaf/rank11-two-garbo-field-blower.cjs) plays Field Blower from the champion's hand with a genuine PlayCardAction and resolves its ChoosePokemonPrompt targeting one or both opposing Tool-equipped Garbodor. It verifies physical Tools move to their owner's discard, Field Blower reaches the player's discard, and Shadow Rider VMAX's Underworld Door Ability status is recalculated after each action.

| Initially equipped Garbodor | Tools selected with one Field Blower | Underworld Door afterward |
| ---: | ---: | --- |
| 1 | 1 | Available |
| 2 | 1 | Still blocked |
| 2 | 2 | Available |

All three outcomes reproduced in both physical seats. A single legal Field Blower can remove both Float Stones from two Garbodor, subject to its normal up-to-two-Tools selection. Removing only one leaves the second active Garbotoxin suppressing Underworld Door.

This is an **initially constructed midgame position**, with Items legal and Field Blower already in hand. It does not demonstrate authentic Shadow Rider access, opponent timing, recovery of Tools, a policy choice, game-winning attack, or any matchup win rate.

An exact [opening resource calculation](../aichi-2026/rank11-field-blower-direct-vstar-route.md) separately estimates **16.58979%** first-draw visibility via direct Field Blower or Forest Seal Stone + Shadow Rider V with Blower unprized. This is a visibility calculation independent of the present action proof. The [rank-11 Shopping Center/Crobat relock regression](rank11-shopping-center-store-cycle.md) supplies a conditional opposing Tool-response mechanism.

Research objective remains one fixed 60 against all Aichi Top 32. At this checkpoint 29 exact opposing 60s are public, ranks 23/25/28 are missing, and there are zero competitively qualified games.
