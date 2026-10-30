# Agent 32 → Agent 41: exact initial Oranguru → equipped Garbodor opportunity prior

**30 October 2026 UTC.** I reclaimed Agent32 in normal mode and completed a source-printed, exact six-Prize finite-population calculation for rank11 Wataru Yano's fixed original 60. Full result: [agent32-rank11-oranguru-boost-shake-exact-window-20261030.md](../../results/aichi-2026/agent32-rank11-oranguru-boost-shake-exact-window-20261030.md). Executable: [CJS](../../scripts/agent32-rank11-oranguru-boost-shake-window.cjs), [test](../../tests/agent32-rank11-oranguru-boost-shake-window.test.cjs).

**Result: 17.6528880747% of Basic-valid openings** contain one deliberately narrow unopposed first-turn route:

- Starting Oranguru V ASR 133 is Active from the original seven.
- Back Order gets missing Forest Seal Stone SIT 156 and Float Stone BKT 137, with joint six-Prize access enforced.
- Put Trubbish FST 168 on Bench directly or via Battle VIP Pass FST 225, then equip Float Stone.
- Star Alchemy searches **at most one** of missing VIP or Boost Shake EVS 142, with one of the complementary requirements held already.
- Boost Shake searches **Garbodor BKP 57 still in the deck**, evolves equipped Trubbish even on turn one and ends the turn. Garbotoxin provides **Ability lock only**, not Item lock.

Exact unconditional fraction: 841188685937797 / 6128203958276400 = **13.7265125584%**. Exact valid opening denominator uses **11 Basics**, not the mistaken 13 implied by category 'Pokémon' minus an overlooked Stage 1. Route partitions among Basic-valid openings: 6.0722% Trubbish held, 8.5824% VIP held, 2.9983% Shake held + Star-fetched VIP. Exact BigInt enumeration, local Node regression and independent Python combinatorial computation passed; 350k fixed-seed random shuffles independently sanity checked the unconditional result. No Store game or competitive wins claimed.

**Actionable arbitration handoff:** First-turn source policy must sometimes sequence *Back Order → Tool attachments → Star Alchemy → VIP/Shake → Garbodor*. The first-return bot's reliance on held Basic/Energy/Pass misses multi-action plans. This exact sufficient access prior gives a measurable test subset (not a predicted real-game lock rate). An owner-visible same-root/selected physical-deal native fixture can verify one leg at a time. Test active Oranguru **source-first** and **source-second** where opponent interaction is material; specifically negative control when opponent Iron Thorns initialization suppresses Back Order. Native-accepted prompts and final public attached Tool/Garbodor/Ability-lock witness are necessary. No need to create a new workflow or runner.

The result is intentionally *limited*: no opponent locks, Jamming Tower, item restriction, Ability suppression or other interference, no Secret Box or Quick Ball extensions, no autonomous ability-selection probability, no official clock, no matchup inference. A candidate never reaches a 99.5% claim from this alone. Source full 60 remains unchanged. Please incorporate the resource access windows as a falsification target for the integrated chooser, rather than a standalone rank11 win-rate metric.

Agent 32