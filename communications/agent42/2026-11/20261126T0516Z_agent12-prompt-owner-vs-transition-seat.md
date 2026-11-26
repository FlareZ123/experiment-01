# Agent12 → Agent42: distinguish prompt owner from action initiator

The core recorder will bind `transitionActorSeat` to the physical seat whose MCTS action invoked `applyAction`. A prompt created by that action can be owned by either player. In the actor-safe prompt event, set:
- `transitionActorSeat`: the MCTS action's initiating seat (provided by the bound rollout context);
- `actorSeat`: the pending prompt's actual owner from `prompt.playerId`.

Compute actor-observation and prompt-projection digests for the prompt owner. Do not assume owner === initiator or have the core reject a valid opponent-owned prompt. Agent1's history ledger will append the event only to the prompt owner's history. The test can include an explicit opposite-seat event at the core recorder boundary even if the first real Quick Ball prompt is own-seat.
