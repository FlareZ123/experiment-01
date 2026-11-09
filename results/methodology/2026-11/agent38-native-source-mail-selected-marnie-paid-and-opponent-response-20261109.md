# Agent 38: original rank-5 native Trainers' Mail → paid Marnie → real opponent reply

**9 November 2026. Genuine native Store two-arm mechanism witness on one previously exposed Mew source opening. No new independent physical source samples or competitive-paper qualification.**

## Concrete missing gameplay interaction, solved

Previous authentic original-rank5 Mew/Genesect source research found an actual source-owned `Trainers' Mail ROS` top-four choice selecting `Marnie SSH`, but the source bot later never played its one selected Supporter. Access was thus disconnected from an actual action. Implemented a **default-off owner-only continuation**:

- `simulation/twinleaf/agent38-owner-mail-selected-marnie.cjs` chooses precisely a physically known owned `Marnie SSH` hand index obtained through the native Mail prompt, only on an otherwise incumbent owner `PassTurnAction` and legal Supporter turn. It checks one-Supporter-per-turn and owner-public Supporter locks. It never inspects unseen opponent cards, Prize faces, or entire owner deck.
- `simulation/twinleaf/agent9-native-owner-mail-after-pass.cjs` tracks the **same Card object** from a real Store-accepted Mail top-four `ChooseCardsPrompt` through physical hand entry, proposes the actual `PlayCardAction`, and requires native `card.canPlay`. A reversible post-Store observer follows prompt continuation until the Supporter physically reaches the **discard pile**, then records the next accepted opponent nonprompt gameplay root. It does not invent a Supporter effect, pull a card from the deck, or alter the upstream engine.
- `simulation/evaluation/agent41-bilateral-v2-development.cjs` wires optional `actorOwnerMailSelectedMarnieOnPass`; default false keeps every existing baseline unchanged. Pure unit test `tests/2026-11/agent38-owner-mail-selected-marnie.test.cjs` covers actual owner-held card indices, legal turn, Supporter contention and public lock. The paper rule is one Supporter per turn, and the pinned native implementation may temporarily keep a played Supporter in its play zone pending generated prompts, so **post-dispatch immediate discard checks are invalid**.

## Complete native outcome

Frozen before gameplay, [registration](../../aichi-2026/registrations/agent38-mail-marnie-follow-retrospective-20261109.json) specified the already-known authentic physical source opening `5:13:A:champion-reference`, seed `1291419999`, original rank5 source in physical seat1 versus rank1 champion unchanged 60. Control: genuine source-only Mail after Pass. Treatment: identical, additionally allowing that Mail-selected owned Marnie after source Pass. All other Mew actor Quick Ball, Ultra Ball, DCE, evolution and Genesect abilities held fixed.

[Final corrected native CI **42603788939**](https://github.com/FlareZ123/experiment-01/actions/runs/42603788939) completed **SUCCESS**, including direct tests and two actual Store games on source SHA `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05` and pinned Store `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Full original state/action evidence archived as [artifact 13666852060](https://github.com/FlareZ123/experiment-01/actions/runs/42603788939/artifacts/13666852060), ZIP SHA-256 `a33745f4aac9a7fe3b6edaa280778a422b63fd5dfd4c4d02d9507fd69f0163ad`.

| Condition | Mail-only control | Mail + physically played Marnie |
| --- | --- | --- |
| Full original initial physical source/candidate deal | identical | identical |
| Native Mail accepted | 1 | 2 |
| Actual Marnie selected into original source hand | not audited as this branch is off | **1** |
| Source Marnie proposed as `PlayCardAction` | 0 | **1** |
| Native Store accepted paid Marnie | 0 | **1** |
| Same physical Supporter later observed in discard | 0 | **1** |
| Real opponent gameplay root after resolution | not applicable | **`PlayCardAction`, global turn 3** |
| Source attacks | 4 | 4 |
| Source remaining Prizes | 0 | 0 |
| Native engine result | source wins | source wins |
| Paper-competitively qualified games | 0 | 0 |

The first instrumented run [42602490646](https://github.com/FlareZ123/experiment-01/actions/runs/42602490646) physically accepted Marnie but reported zero **immediate** discard receipts, because it inspected the discard zone **before the actual native effect's prompted continuation**. Its negative payment classification was a telemetry timing bug. The second run tracked later successful Store actions and certifies the exact card's discard plus a real opponent gameplay response. The source wins in both arms, so no winner gain is claimed.

## What this changes

This closes one concrete gap between theoretical source access and an actual adversarial move. Mew can now exercise a printed one-turn Supporter disruption/draw action with real native prompt and opponent response. The source and candidate 60s remain unchanged, and the experimental branch is genuinely default-off.

The mechanism witness is retrospective and **reuses the original source seed**. It cannot be counted as a fresh independent source test, a game-win comparison under expert policy, proof of full printed Marnie fidelity, or evidence of 99.5%. To test real-world significance rather than another known-seed example, a separate **prospectively frozen 32-opening/64-native-game** Mew source versus fixed Hood experiment has been registered at `results/aichi-2026/registrations/agent38-fresh-owner-marnie-payoff-hood-20261109.json`; all 32 fresh seed+seat groups, failures, and physically settled Marnie receipts must be retained even when Marnie does not arise naturally.

**Benchmark status:** 29/32 original opponent cards resolved, ranks23/25/28 missing, zero competitive paper games, no final fixed 60. 
