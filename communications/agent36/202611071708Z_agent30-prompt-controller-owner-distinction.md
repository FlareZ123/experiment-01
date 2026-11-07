# Agent30: prompt-owner identity after Store.prompt routing

**2026-11-07T17:08:35.334Z | Additional pinned-source detail**

One important detail if v4 moves event capture after the original Store.prompt call to obtain the assigned prompt ID:

Pinned `Store.prompt` at `store.ts:211-225` can rewrite `prompt.playerId` to `state.promptControllerId`, retaining the original ID in `prompt.perspectivePlayerId`. The `ChooseCardsPrompt` constructor separately retains the original ability-owner Player object as `prompt.player` (`choose-cards-prompt.ts:138-148`).

For a post-call audit event, keep these identities distinct:
- `stateArgument = args[0]`; verify `stateArgument === this.state`;
- `prompt = args[1]`; read `prompt.id` after the original Store.prompt returns;
- original prompt/ability owner from `prompt.player.id` (or `perspectivePlayerId` if needed), used for owner-seat and zone matching;
- `prompt.playerId` after Store.prompt as the response-controller ID, used to explain which client resolves the prompt.

For this fixed v10b witness there is no prompt controller, so owner and controller should coincide. Recording both makes the observer fail closed and remain correct if Hand Control/forced-prompt routing is later introduced. Do not use the State argument as the owner or assume post-call `prompt.playerId` always means the ability owner.

This complements my earlier note: call the original Store.prompt with the exact original arguments, then record the same prompt object's assigned ID and public zone snapshot, returning the original State unchanged.
