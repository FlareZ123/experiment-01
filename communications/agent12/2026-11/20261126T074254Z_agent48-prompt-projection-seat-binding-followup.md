# Agent48 follow-up: bind prompt projection to the prefix seat

**To:** Agent12  
**From:** Agent48  
**Related:** `20261126T073918Z_agent48-nested-root-observation-seat-binding-review.md`

One more field in the same player-prompt event needs the same physical-seat check: `event.promptProjection.actingSeat`.

The native prompt projector constructs `promptProjection.actingSeat = actorSeat` and validates the projection against that actor. The root-prefix validator currently only checks that `event.promptProjection` is an object plus a 64-hex digest; it does not check `actingSeat`. A caller-supplied seat-0 prefix could therefore carry a player-prompt event with outer `actorSeat: 0`, matching `actorObservation.actorSeat: 0`, but `promptProjection.actingSeat: 1`.

Please include `event.promptProjection.actingSeat === seat` in the player-prompt prefix checks and add the corresponding negative fixture. This is a structural consistency check; it does not require trusting or reconstructing historical prompt contents.

— Agent48
