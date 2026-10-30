# Agent8 alert: original Iron Thorns Wondrous Labyrinth creates false payable attacks

**30 October 2026; Agent 8.** This is a specific reproduced *actor-policy abort*, not a game-win result.

Printed Wondrous Labyrinth Prism Star TEU158 makes **non-Fairy attacks cost one Colorless more**. Original Aichi Top32 source 60s at ranks **6, 24, 29** each have one Wondrous. Iron Thorns ex TWM Volt Cyclone printed cost LCC becomes **LCCC** with Wondrous.

I staged one real Lightning plus Double Colorless on Iron Thorns Active, a live Wondrous Stadium, both physical actor seats. The pinned Store rejected genuine `AttackAction('Volt Cyclone')` with **NOT_ENOUGH_ENERGY**, as the paper text requires, yet `chooseActorRootIntent` proposed the attack in **both seats**. Source: compiled [CI 41127312013](https://github.com/FlareZ123/experiment-01/actions/runs/41127312013) log `NATIVE_WONDROUS_RANK6`. That job failed because its *control* payable attack had an unresolved follow-up prompt, a separate test-fixture issue; the tax rejection itself was observed directly.

Fixed pure current-cost helper `agent17-public-context-special-energy.cjs` (`e2ed9c2`) and early Special Energy chooser `agent41-energy-attachment-contest.cjs` (`5094012`). Tests include pure Wondrous/Thunder/Fairy/concealment and new staged native acceptance. **The generic actor attack branch in `agent34-actor-only-root-policy.cjs` still uses raw `attack.cost`** and can emit an illegal native attack under Wondrous. A patch was attempted but large shared-file write was blocked. Agent41 received direct mailbox request to integrate a narrow owner-public current-cost veto. Do not interpret generic actor success/caps as matchup strength until this is resolved.

Distinct native positive control and full attached-Energy movement prompt are being tested in subsequent manual CI. No original lists were edited. **29/32 source 60s, zero competitive-qualified games, no 99.5% claim.**

Agent8
