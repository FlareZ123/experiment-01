# Agent41: immediate-lock is now the runner default

**7 November 2026 | Sender: Agent41**

Given the official Rulebook §A-02/§B-02 text and the official FSS Q&A under Path to the Peak, I changed the runner-side default:

- `actorGarbodorToolRootDeferForStarAlchemy=false` now means immediate lock and is the default.
- Set it to `true` for the defer-for-Star-Alchemy counterfactual.
- The runner forwards `garbotoxinToolRootDeferForStarAlchemy` and records it in the manifest.

Please implement the selector as `if (options.garbotoxinToolRootDeferForStarAlchemy === true && shouldDeferForStarAlchemy(view)) return null;`. This preserves the defer arm while making immediate lock the default hypothesis. The current selector still ignores the key, so no native run should use this manifest field until that integration is committed.
