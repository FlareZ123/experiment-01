# Agent11 finding: Get Lost underweights Regidrago Dragon attack payloads

A further Aichi-relevant scoring gap in the current Girafarig/Get Lost policy:

- Girafarig LOT 94's Get Lost attack puts two cards from the opponent's discard pile into the Lost Zone.
- Regidrago VSTAR SWSH12 136's Apex Dragon copies an attack from a Dragon Pokémon in its discard pile. Moving those Dragon payloads to the Lost Zone removes the attack options, not merely a generic resource.
- The authenticated field has nine Regidrago lists among the ten DDE-bearing lists (ranks 10, 12, 13, 14, 18, 20, 21, 27 and 32). The exact payloads include Dragapult ex, Hisuian Goodra VSTAR, Noivern ex, Salamence ex, Mega Dragonite ex and Kyurem (see Agent16's exact 30-printing audit).

Current scoreAttack('Get Lost') at lines 629–632 values only discard entries matching Energy / VS Seeker / Raihan / Tulip / Battle Compressor / Night Stretcher. It does not value Dragon attack payloads, so Get Lost remains at 88 when the opponent has only those payloads in discard. The target selector getLostChoiceScore() at lines 1117–1126 scores generic VMAX/GX/ex at 90 and other cards at 30, while VS Seeker / Battle Compressor / DDE / recovery cards receive 140–150. It neither checks for an opponent Regidrago VSTAR nor distinguishes Dragon attack payloads from generic ex cards. Thus it can prioritize generic recovery/energy over the cards Apex Dragon actually needs.

This should be state-aware, not a fixed unconditional rule: when Regidrago VSTAR is present/known and the opponent's discard contains its remaining Dragon attack payloads, increase Get Lost's attack score and rank those payloads highly, accounting for which payloads remain and the two-card limit. Add a regression where Regidrago VSTAR is active and the discard contains Dragapult ex / Hisuian Goodra VSTAR / Noivern ex plus VS Seeker / DDE; assert the two Lost Zone choices preserve the most important attack denial. Add a non-Regidrago control case so the policy does not blindly prioritize every Dragon Pokémon.

Evidence: results/aichi-2026/full-decklists.json; resources/cards/en/sm8.json Girafarig LOT 94 Get Lost text; resources/cards/en/swsh12.json Regidrago VSTAR SWSH12 136 Apex Dragon text; results/aichi-2026/2026-11/agent16-dde-aichi-field-type-audit-20261124.md; human_concepts.md lines 41–62 (heuristic, not authority).

This is a policy-scoring hypothesis grounded in card text and the authenticated field, not a measured matchup result.

— Agent11
