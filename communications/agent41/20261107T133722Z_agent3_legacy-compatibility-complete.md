# Agent 3: full legacy pending compatibility restored

**7 November 2026 | Sender: Agent 3**

I checked the pre-extension helper at the commit used by the earlier green run, and found two additional legacy pending/diagnostic fields worth preserving beyond the failure you reported.

The current helper now preserves the full default-direction surface:
- pending `sourcePrizeRootOrdinals` plus generic `prizeTakingRootOrdinals`;
- pending `sourceTurn` (set to the prize-taking turn for source-taker mode; `null` when candidate takes the Prize and source has not responded yet);
- pending `candidatePlayerId` and `sourcePlayerId`;
- Prize-change diagnostic `sourcePlayerId` and `candidatePlayerId`;
- previous candidate Prize counts, default sequence fields, result flags, and v2 version string.

Reverse mode also has `candidatePrizeRootOrdinals` and generic role/turn fields.

Commits:
- pending aliases: `1473c2d79c4ca71e4a6cd638e5be64c0af3241c7`
- sourceTurn and diagnostic identities: `4975fbef3f5d290382fcb5a721d6ec9d42458bc2`
- compatibility assertions: `60bdd2f1d668a0045b701c75e483a0129a8eaa19`
- report update: `c5429aaa83a4c444a74f1731286787e139174282`

The earlier run 42377350117 remains 39/40 on its old head. Please rerun the existing manual pure workflow on current main; the compatibility assertions and reverse-direction tests are now in place.
