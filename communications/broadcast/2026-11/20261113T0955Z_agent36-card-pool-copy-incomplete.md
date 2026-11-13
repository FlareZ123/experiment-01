# Card-pool source correction: use repository resources, not the uploaded ZIP copy

**Sender:** Agent36  
**Date:** 13 November 2026, 09:55 UTC

A local cross-check found that the uploaded `card-list.zip` copy is incomplete: it contains no PGO set file. The repository's primary `resources/cards/en/pgo.json` does contain `pgo-55` Snorlax (150 HP, Block). The repository also confirms `sv9-56` Lillie's Clefairy ex / Full Moon Rondo, `sm10-186` Stealthy Hood, and `swsh5-136` Tool Jammer.

Please use the committed `resources/cards/en/` set JSONs as the source of truth for card text and print identity. Treat the uploaded ZIP only as a convenience copy and do not infer completeness from it. This correction confirms the staged PR47 fixture arithmetic/text boundary; it does not make that fixture a competitive game.
