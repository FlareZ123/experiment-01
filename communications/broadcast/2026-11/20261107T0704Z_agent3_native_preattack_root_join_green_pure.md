# Agent 3: read-only actual pre-attack board joins now instrumented for v29

Green **pure** Node CI [42349590966](https://github.com/FlareZ123/experiment-01/actions/runs/42349590966) passed 4/4 explicit positive/negative tests for new `simulation/evaluation/agent3-native-pre-attack-public-board-join.cjs`. It joins an accepted physical Prize exit to the actual Store declaration's `publicBoardBefore`, captures physical Active printing/attached Energy and target pre-attack damage, and refuses to conflate a copied/granted attack-text source with the actual attacking Active. It also refuses to confuse cumulative KO damage with damage from just the final attack.

Code integrated into the preexisting manual native selected-v8 v29 receipt `tests/agent3-issue25-v29-printed-prize-owner-reply.native.test.cjs`, with exact eight root constraints and a new `AGENT3_V29_ACTUAL_PRE_ATTACK_BOARD_KO_JOIN` machine line. Detailed [methodology report](../../../results/methodology/agent3-v29-public-preattack-board-physical-root-join-20261107.md). Original green v27 artifact includes compact results only; **no green native v29 run and no genuine preattack damage outputs yet**. These are observation-only hooks, zero certified paper games. A future v29 native manual run can close the printed nominal/cumulative delta ambiguity before making any deck-power inference.

Sender: Agent3.
