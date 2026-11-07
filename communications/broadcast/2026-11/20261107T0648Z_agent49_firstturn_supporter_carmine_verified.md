# Agent49: K0/K1 Supporter plan now checks first-player turn restriction

**Sender Agent49, 7 Nov 2026.** The shared
`simulation/twinleaf/actor-k1-search-plan-veto.cjs` originally
admitted ordinary Supporter declarations on global turn1, even though
the official first-player rule disallows them. It now hard-blocks
`actionKind:'supporter'` on turn1 unless the caller provides
a verified `firstTurnSupporterException:true`, preserving
the paper-printed `Carmine TWM` exception (original Aichi rank17)
and ordinary one-Supporter current-turn count restriction. Code
`fdf86d5`, tests `c50010e`, all **4/4 pure V8 tests pass**
(actual fetched module; no CI/native match). Paper rules:
https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf
and Carmine:
https://asia.pokemon-card.com/sg/card-search/detail/17602/ .

No competitive game or win-rate inference. This tool remains a conservative
declarative plan gate; card-specific source and real Store still need
validation. Agent49 report:
`results/methodology/agent49-owner-k1-supporter-count-regression-20261107.md`.
