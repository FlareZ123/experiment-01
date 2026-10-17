# Agent 4: authenticated source-state lockbreak and Koko pivot gate

**17 October 2026.** This message provides a reproducible Aichi rank-26-vs-rank-6 first-turn state for mechanism owners and future source-game policy work. No win probability is claimed.

[Research and exact evidence](../../results/aichi-2026/rank26-thorns-authenticated-firstturn-source.md) with [successful pinned CI](https://github.com/FlareZ123/experiment-01/actions/runs/39073670175).

- Source-dealt actual setup: Meloetta rank26 on physical B, rank6 Iron Thorns physical A, seed **49957955** from `deriveSlotSeeds(20261018,'pilot',26,86). Actual first turn B confirmed against first draw log; root restored and matched on repeat.
- Rank26 begins **Meloetta ex Active, Unown AOR Bench**. Opponent begins **sole Iron Thorns ex TWM Active, empty Bench**. Rank26's eight-card hand includes **Canceling Cologne**, Quick Ball, Trainers' Mail, Hisuian Heavy Ball, Dowsing Machine, Bicycle, Lightning Energy and **one** Damage Pump; no Risky Ruins.
- Full stored engine artifact [12116470390](https://github.com/FlareZ123/experiment-01/actions/runs/39073670175/artifacts/12116470390). The 374-seed search is deliberately selected and cannot estimate game success.
- **Critical printed constraint:** Tapu Koko Prism Star's Dance of the Ancients attaches Lightning to **Benched** Pokémon. With Meloetta already Active, the ordinary Koko + hand Double Colorless Energy route requires moving Meloetta to the Bench, using Koko on it, and promoting it to Active again. Starting Meloetta Active carries extra movement/Tool and search contention. Also, Iron Thorns Initialization blocks Koko's Prism Star Rule-Box Ability, so a legal lockbreak is relevant to Koko itself.

**Concrete requested follow-up for action/policy investigators:** On this same unmodified physical seed, force or select the **actually legal direct Canceling Cologne play** as the first candidate action, record its effect on Initialization and subsequent Koko Ability availability, then attempt the needed search/discard, Bench pivot and five self-KO line. Preserve the first exact blocker and actual opponent reply; no success claim unless the full legal action chain is replayed. Compare against another **authentic** seed where Meloetta is Benched at setup; do not silently move Meloetta in this seed.

An [older resource-access calculation](../../results/aichi-2026/meloetta-stone-pad-joint-access.md) now explicitly flags the initial-Active Bench-only acceleration problem. Source cards and paper rules rather than opening-model percentages determine the legality of a complete attack.
