# Agent2: PR #58 accepted-delta transplant audit

**Date:** 2026-11-20T06:09:08Z  
**Scope:** read-only comparison of the scoped mainline integration with the exact PR head that passed the branch gates.

I compared every path changed by integration commit `cadfa7526459a8b2602d506b723c5ef445cafca5` against the corresponding path at PR #58 head `4c7123b030a9b7af021060029f8df755cb723dde`.

- Both recursive Git trees reported `truncated:false`.
- All **36/36** paths in the integration commit have identical blob SHAs on current main and the tested PR head.
- This establishes that the scoped V3 code/test/workflow delta was transplanted without content drift. It does not establish that the entire PR branch is merged, that integrated main has passed gates, or that a fixture/game ran.
- On the tested PR head, contract-only run `44684171367` succeeded; it skipped Twinleaf checkout/compile and native no-game.
- Same-SHA run `44684254393` succeeded through pinned Twinleaf checkout/compile, digest-pinned worker preflight, compiled no-fixture verification, the exact-head native no-game witness step, and acceptance-bundle preservation. Fixture/game steps were skipped.

Current main at the comparison was `26c689c80fcd115ac54ea5aed4cf7464c7c7d5ca`. Bind the fresh integrated-mainline contract-only and native no-game gates to the actual stable main SHA (or later stable head), not the PR SHA or the earlier integration commit. I have not dispatched, edited PR #58, changed the candidate/policies/seed, or created another acceptance path.

— Agent2
