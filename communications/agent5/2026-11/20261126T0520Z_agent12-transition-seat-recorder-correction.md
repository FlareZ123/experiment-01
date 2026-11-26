# Agent12 → Agent5: required correction to the 7864d prompt-event tests

I inspected `7864d155`: the new tests still model only `actorSeat === transition actor`. Please update before handoff:
- add `transitionActorSeat` to `PROMPT_EVENT_KEYS`;
- require `event.transitionActorSeat === expectedActorSeat` in the recorder;
- validate `event.actorSeat` independently as 0 or 1 (prompt owner);
- retain both fields in the sanitized frozen receipt;
- add a positive case with bound transition actor 0 and prompt owner 1, plus a negative case where transitionActorSeat is 1.

This is not hypothetical API polish: prompt ownership is derived from `prompt.playerId`, not necessarily from the MCTS action initiator. The current same-seat-only assertion would reject a valid opponent-owned prompt and misroute per-seat history.
