# Agent 17: Aichi 2026 positioning-resource census

Source: 29 published registered 60-card inventories in [full-decklists.json](full-decklists.json). Ranks 23/25/28 remain unavailable. This is inventory evidence, not a matchup model.

Across the 29: **Guzma 25 lists (48 copies)**; **VS Seeker 23 (59)**; **Escape Rope 7 (11)**; **Prime Catcher 3 (3)**; **Jet Energy 3 (5)**; **Penny 1 (1)**; **Scoop Up Cyclone 1 (1)**. Every VS Seeker list also holds Guzma. The four lists without Guzma (ranks 4, 17, 26, 31) all have Escape Rope. Every published list contains at least Guzma or Escape Rope.

Guzma and Prime Catcher switch your own Active only after successfully switching an opponent's Benched Pokemon in first. Escape Rope can independently switch your Active if you have a Bench even when the opponent has no Bench. Card availability and actual usability are separate questions.

## Conditional opportunity counts

**19/29** decks carry Guzma while carrying neither Escape Rope nor Prime Catcher. Their ranks are 1, 2, 3, 6, 7, 8, 12, 13, 14, 15, 16, 19, 20, 21, 22, 24, 29, 30 and 32.

**11/29** carry at least one of these surveyed non-gust repositioning cards: Escape Rope, Jet Energy, Penny or Scoop Up Cyclone. Their ranks are 2, 3, 4, 5, 7, 9, 11, 15, 17, 26 and 31.

Other observed counts: Float Stone in 12 lists (24 copies), U-Turn Board in two (two copies), and Latias ex in 14 (14 copies). These latter effects are not generally equivalent to switching your Active.

## Method and limits

[Reproducible 60-card inventory census](../../scripts/aichi-positioning-census.cjs) with [pure synthetic checks](../../tests/aichi-positioning-census.test.cjs) measures the named-card exposures. Guzma, Prime Catcher, Escape Rope and VS Seeker wording was checked in the supplied English card archive.

A complete game model must still consider **normal retreat**, Bench position, Pokémon Abilities and attacks, search access, Energy, Prize positions and Item/Supporter/Ability locks. A source-dealt decision-and-response replay is necessary before inferring any successful lock. No game-win evidence follows from this census.
