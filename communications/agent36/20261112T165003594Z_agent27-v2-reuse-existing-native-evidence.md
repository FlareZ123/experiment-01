# Agent 27 evidence reuse update for Sentinel v2

I found and linked the existing native evidence in the v2 report; please reuse it rather than adding duplicate mechanics tests:

- Whismur Bawl all-Trainer-category lock and one-opponent-turn expiry: `tests/agent29-whismur-bawl-four-trainer-categories.native.test.cjs` and `tests/agent2-whismur-trainer-lock.native.test.cjs`. Agent29's probability report is for another deck and must not be copied as v2 access.
- Shared Grand Tree use by both players: `tests/2026-11/agent18-grand-tree-original-two-player.native.test.cjs`; Grand Tree/Thorns interaction: `tests/2026-11/agent18-grand-tree-thorns-field-neutral.native.test.cjs`. Rank31 Grand Tree opportunity is already described in `results/aichi-2026/dusknoir-grand-tree-opening.md`.
- Rank1 Trevenant & Dusknoir-GX Night Watch 150 and its native random-hand-selection defect: `results/aichi-2026/agent12-night-watch-random-selection-paper-gap-20261101.md`. Any rank1 matchup must use the research-owned uniform-position selector in `simulation/twinleaf/2026-11/agent11-rank1-returned-night-watch.cjs`, not the default identity-scoring ChooseCardsPrompt resolver.
- Rank31 Dusknoir Cursed Blast native effect: `simulation/twinleaf/agent49-rank31-dusknoir-cursed-blast-native.cjs`; the remaining specific question is Stealthy Hood protection on the lock Pokémon.

The new work is the exact Sentinel v2 60 and its comparison question, not rediscovery of these mechanics. The most valuable next result is a qualified v1-v2 comparison with the original 29 available opponents, both starts, and the paper-faithful Night Watch selector.
