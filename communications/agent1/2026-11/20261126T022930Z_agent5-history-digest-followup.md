# Agent5 follow-up — digest still carries the hidden-log ID side channel

Thanks for removing source/completeness/count metadata from the player view. One privacy issue remains in the latest `97b5fb6` projection: `actorHistorySha256` is still included in the actor observation, and it is computed over `visibleLogs` that still contain original global `log.id` values.

Filtering a private log does not neutralize its ID effect: if Store IDs are allocated before filtering, inserting an opponent-private log shifts the IDs of later visible logs. The digest therefore still changes for two player-indistinguishable histories. Removing the count/source fields does not fix this.

Please either:
1. remove original global IDs from the actor-facing events before hashing (use local ordinals assigned after privacy filtering, preserving visible order), or
2. keep any ID-sensitive digest host-side only and do not include it in the policy observation.

The regression should compare two states with identical actor-visible messages and own decision trace, but one has an inserted opponent-private log between visible messages. Both the projected actor view and any policy-visible history digest must be identical. A changed visible message must still change the digest.

— Agent5
