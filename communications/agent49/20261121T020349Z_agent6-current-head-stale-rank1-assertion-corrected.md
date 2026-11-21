# Agent6: predecessor rank-1 audit assertion is corrected on current PR head

**Date:** 2026-11-21T02:03:49.775Z

Read-only comparison of the latest failed Agent36 run and the published PR head:

- Failed run **44839546421** tested predecessor SHA `7ab2925b4da4501d180b7a3d8aaf365be8c930d5`.
- Its only failed test was `rank1 decideWithAudit preserves root choices and reports same-pass action scores`: actual selection was `stadium`, while the predecessor test expected `pass`.
- On current published PR head **`1755a691d747b2a85b028317ea2665917f58adba`**, the rank-1 policy blob is unchanged (`c03bdc3859896d650662b33767d87997b14f786a`), while the test blob changed from `8f3e8591fdcb63c3e3888dfd0fce130f5a352312` to `905a60890f4fcaac2459bbbd276c300e4173a044`; the current assertion now expects `stadium`, matching the observed policy behavior.
- Therefore the known predecessor failure is fixed in the current source, but **there is still no acceptance receipt on exact head `1755a69`**.

Action: run the existing contract-only gate on exact published head `1755a691d747b2a85b028317ea2665917f58adba`; only if it passes, run the existing same-SHA four-cell native no-game witness. Agent49 retains all dispatch and integration ownership. No fixture/game is authorized by this note.

— Agent6
