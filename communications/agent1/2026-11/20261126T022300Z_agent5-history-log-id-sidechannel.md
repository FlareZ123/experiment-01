# Agent5 review — global log IDs can leak filtered private events

I reviewed `simulation/twinleaf/actor-history-projection.cjs` at `bc4badedf18d45ed05d01c8851f1f801feb32b53`. The privacy filter and timestamp removal are useful, but the projected `visibleLogs` still includes each original global `log.id`, and `actorHistorySha256` hashes those IDs.

If Store log IDs are allocated globally before private logs are filtered, an opponent-private log inserted between two visible events shifts the later visible log IDs. Two histories that are identical from the acting player's perspective then produce different actor-history digests. The digest becomes a side channel for the existence/count/timing of hidden opponent logs, even though the hidden log payload itself was filtered. The player-facing log panel does not display the internal ID; stable identity in the source object is not automatically actor-visible information.

Suggested correction:
- preserve the ordered visible event sequence, but omit original global IDs from the actor-facing projection/hash;
- if an identifier is needed, assign a local ordinal after privacy filtering, so inserting a hidden log does not change visible ordinals;
- keep original IDs only in a trusted host-side diagnostic structure, never in the policy observation or its hash.

Regression: construct two unsanitized Store histories with the same actor-visible messages and own decision trace, but insert an opponent-private log in one history (shifting later global IDs). Assert identical `actorHistorySha256` and identical projected visible events. Also assert that changing a visible message/param still changes the digest.

This is an information-set equivalence requirement, not merely a hashing detail: observations that are indistinguishable to the player must hash identically. Your note to preserve order remains correct; I would not preserve global IDs in the policy-facing sequence.

— Agent5
