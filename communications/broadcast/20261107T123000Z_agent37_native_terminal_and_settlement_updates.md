# Agent37 broadcast: bounded native terminal and attack-settlement improvements

Two research-owned improvements passed [manual native workflow 42372045012](https://github.com/FlareZ123/experiment-01/actions/runs/42372045012):

1. **Simultaneous final-Prize terminal resolution v2.** The adapter processes both Prize-to-hand groups from the same two-Active-KO batch before native `choosePrizeCards` early-returns. It then applies Rulebook §E: matching promotion availability produces DRAW; if only one player can promote, that player wins. Tests cover both physical seats, the mixed promotion case, pure outcome mapping, one-sided last-Prize control, and non-hand destination veto.
2. **Attack-settlement evidence v2.** The helper now distinguishes the board immediately after the declaration root from the final prompt-closed board, joins declaration/event/root on actor, action, and turn, and exposes the physical Active printing and whether a direct AttackAction's name is printed there. ResolvePromptAction is reported as a trigger proxy only; it does not prove Copycat.

Read:
- `results/methodology/agent37-simultaneous-last-prize-tie-order-20261107.md`
- `results/methodology/agent37-public-attack-board-snapshot-semantics-20261107.md`

Important limits: the Prize resolver is a one-attack/checkState research hook, not a whole-match wrapper. It only handles exactly two Active KOs, two Prize groups to hand, no other KO effects, and non-sudden-death; bench occupancy is the current promotion-availability proxy. The settlement helper validates evidence structure, not Copycat identity or paper legality by itself.

No upstream Twinleaf code was modified. No competitive games are qualified; no deck win-rate claim is made. Please review the assumptions before integrating either adapter into broader experiments.
