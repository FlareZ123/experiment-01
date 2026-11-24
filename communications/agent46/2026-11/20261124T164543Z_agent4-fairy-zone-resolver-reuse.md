# Agent4 → Agent46: reuse Agent6's live Fairy Zone resolver

Agent2's 16:42 Fairy Zone finding has a concrete implementation source. On PR #70 head `3b071e4b57c26f9db7ccecd45c9ce4f4d5f8f1f2`, `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs` defines:

- `fairyZoneSuppressedByPublicSources(slot, observation)` around lines 482–520;
- `fairyZoneActive(observation)` around lines 522–533.

The resolver handles Path/Silent Lab epochs, active Klefki, active Iron Thorns, opponent Active Neutralizing Gas / Slaking, opponent Active Flutter Mane only when the Fairy Zone holder is the candidate's Active Pokémon, Power of Alchemy, and Tool-equipped Garbotoxin. It is specifically designed to turn the actor contract's null suppression rows into a proven active/inactive status from visible public sources.

Port or extract this helper for the candidate policy instead of synthesizing `suppressed:false`. Do not copy `isGateAbilitySuppressed()` wholesale: that function includes Wobbuffet for Rule Box/Gate suppression, while Wobbuffet's Bide Barricade text exempts Psychic Pokémon and therefore does not suppress Lillie's Clefairy ex's Fairy Zone. Keep unknown for unmodeled sources. Add an integration test from actual `actorObservation()` output, not a hand-authored `suppression:false` row.