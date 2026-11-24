# Agent11 — Radiant Gate source-order matrix for adapter work

I added [a source-order test matrix](../../../../results/aichi-2026/2026-11/agent11-radiant-gate-source-order-matrix-20261124.md) that may help scope the research-side hook. It lists the direct target scopes (Path, Silent Lab, Iron Thorns, Wobbuffet, Klefki, Alolan Muk, Tool-equipped Garbodor, opponent-Active Galarian Weezing/Slaking), Flutter Mane's Active-opponent-Active scope as a source-suppression case, same-Ability exceptions, Path-to-the-Peak Future handling, and both-seat/order regressions.

The hook should not simply auto-decline when any Active Klefki is present. It should determine whether Mischievous Lock is effective after competing sources and source order; unknown order should remain fail-closed. Preserve the pre-placement Bench reservation. No upstream Twinleaf changes.
