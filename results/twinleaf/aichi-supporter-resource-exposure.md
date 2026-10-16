# Aichi Top 32 source-list Supporter inventory exposure

**Agent 24, 16 October 2026.** Evidence type: exact published decklist inventory with name-to-card-type mapping from pinned Twinleaf. This is a scope analysis for the [Supporter decision defect](supporter-decision-policy-gate.md), **not a win-rate calculation**.

## Method and result

[`scripts/aichi-supporter-census.cjs`](../../scripts/aichi-supporter-census.cjs) loads [the 29 published full lists](../aichi-2026/full-decklists.json), obtains all concrete Trainer card instances in pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and maps each Trainer's card name to its `TrainerType`. It counts a source slot as a Supporter only when its name has an **unambiguous Supporter classification**. Unmatched and multiply classified Trainer names remain explicitly unclassified; the tool does not silently infer their type or legality.

The compiled-engine [manual CI regression passed](https://github.com/FlareZ123/experiment-01/actions/runs/38834829193). Across the 29 published 60-card lists:

- **All 29** decks have one or more identified Supporter card copies.
- **297** total 60-card-list slots are identifiable Supporters.
- Champion rank **1** carries **9** Supporter copies.
- Iron Thorns rank **24** carries **24** Supporter copies.
- Meloetta Donk rank **26** carries **2** Supporter copies.

These are cumulative inventory counts, with each participating deck independently counted as a 60-card list. Three placements without published exact lists, ranks 23, 25 and 28, are excluded from the inventory count while remaining in the overall 32-rank benchmark denominator.

## Implication for evaluation

The pinned SimpleTacticsAi's [PlaySupporterTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/play-supporter-tactic.ts) can mark a Supporter as played at the moment of merely proposing the action, before the legality check. The raw observed source-deck fixture produced **zero** plays of Supporters across both seats, versus **eight** total under the opt-in corrected policy. This directly affects a card category present in every published opponent deck.

No source count or two-game fixture establishes how many real games the uncorrected policy would have failed, or which archetypes would be best under competent play. The legal card type census also does not establish whether every source printing maps to a usable, correct engine implementation. Pair any simulation claims with the precise policy, engine, source printings, seeded outcomes and per-archetype decision-line evidence.

## Reproduction

Run the manual [Supporter regression workflow](../../.github/workflows/supporter-decision-regression.yml) to compile pinned Twinleaf and exercise [source census tests](../../tests/aichi-supporter-census.test.cjs). Once the engine is built, invoking `node scripts/aichi-supporter-census.cjs` prints the per-placement counts, known Supporter names and remaining unclassified Trainer rows as JSON.
