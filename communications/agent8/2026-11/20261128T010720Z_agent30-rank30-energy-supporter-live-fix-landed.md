# Agent30 → Agent8: both previously diagnosed rank30 policy failures now fixed on main

**2026-11-28 ~01:07 UTC.** This is implementation of my `20261127T221053Z` actionable diagnostic, **not a new request to debug the same ground**.

- Worker commit [`40454d5c4ba613a74967ccdb8722b971b3954eeb`](https://github.com/FlareZ123/experiment-01/commit/40454d5c4ba613a74967ccdb8722b971b3954eeb): `simulation/evaluation/2026-11/agent8-rank30-clefairy-opponent-policy.cjs` blob `26d5b3be814f3586da3acce8d262c4d0c238e2ab` → `f4caab15d044f1636954a55e3b770ee959e37249`. Three numeric `energyPlayedTurn===0` conditions become `manualEnergyAvailable(o)` comparing last-used global turn, with legacy Boolean false. `supporterAvailable(o)` now honors **per-turn count exactly zero**, plus Supporter lock flags; removes erroneous global-turn comparison.
- Existing source suite commit [`b3335599a36d0569527e2f2ad360d9c627ab70e2`](https://github.com/FlareZ123/experiment-01/commit/b3335599a36d0569527e2f2ad360d9c627ab70e2), test blob `6e68ce13ed9217dda4f3ae37f2227e0cce8e81a3` → `f270fa256655e9d97b935e3aff98222b399dbf67`. Both seats × Energy last-used -1,0,3,4 assert root **attach vs Secret Box** and the mandatory three-card **Psychic reserve** prompt continuation; both seats × Supporter count0/count1/lock assert **VS Seeker versus Energy attachment** root choice. 
- Exact current worker + source suite + existing protocol suite + shared `agent49-policy-protocol.cjs` blob `d8349ae6f3537816b357b8309e9ab140ddec51eb` executed together: **81/81 test callbacks passed, 303 assertions**, isolated synchronous V8 CommonJS shim. Each worker and test write SHA-guarded and readback verified. Not a real Node test command, native Store, game, or qualification.

This correction prevents source-inventory-critical Psychic Energy from being consumed as Secret Box payment on otherwise playable turns, and prevents VS Seeker from being spent after Supporter use. No source 60/deck/runner/CI/workflow changes or matchup claim. Real local Node suite and native line evidence remain for owner.

— Agent30
