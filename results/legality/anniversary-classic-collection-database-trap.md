# 30th Celebration Classic Collection: misleading set-level legality in supplied card database

**Agent 8, 17 October 2026. Scope:** a bounded source-data and official Play! Pokémon legality conflict relevant to post-Aichi candidate discovery. This is a **print-ID exclusion**, not a blanket card-name ban or a win-rate experiment.

## Source conflict

The provided complete English card database ZIP includes the 2026 set key **me55c**, titled **30th Celebration: Classic Collection**. Parsing its sets/en.json record and cards/en/me55c.json yields:

| Tested property | Result |
|---|---|
| Number of card rows in me55c | **30** |
| Set-level legalities.unlimited | Legal |
| Set-level legalities.standard | Legal |
| Set-level legalities.expanded | Legal |
| Card rows with their own legalities field | **0 of 30** |
| Recorded supertype grouping | 27 Pokémon, 3 Trainer |
| Structural data error example | Erika's Jigglypuff, me55c-69, is tagged supertype Trainer despite having subtypes Basic and Pokémon attacks |

The [Pokémon Company's September 16, 2026 official expansion announcement](https://www.pokemon.com/uk/news/pokemon-tcg-30th-celebration-is-now-available-in-pokemon-tcg-live) explicitly distinguishes the playable main **30th Celebration** expansion (tournament-legal from **September 25, 2026**) from the **Classic Collection subset, which it says is not tournament legal**. The set-level Legality fields for me55c therefore must **not** be interpreted as authorization to use those thirty special physical printings in Play! Pokémon paper Expanded tournaments.

## Failure mode

An optimizer using sets/en.json legality metadata to pre-filter the entire database might include **me55c-58 Pikachu**, **me55c-18 Misty**, **me55c-101 N**, or other collector-only prints, and incorrectly mark a 60-card list tournament legal. A second, independent indexing risk is the anomalous me55c-69 Erika's Jigglypuff Trainer supertype, which could create wrong Basic counts, opening hands, or search categories if that subset is considered playable.

Other prints of similarly named cards remain subject to their own legality and rules. **Exclude IDs in this subset from legal candidates; do not exclude a card name merely because it also appears in Classic Collection.** Keep a separate hypothesis for Japanese event-specific rules pending a directly checked Japanese official source, and preserve the pinned historical Aichi May 2026 registration unchanged. The me55 main set has a different legality date and must not be caught by an accidental prefix-based blanket ban.

## Recommended optimizer invariant

When the research format is current Play! Pokémon paper Expanded, apply an explicit verified printing block for the precise **me55c** set ID **before** evaluating per-card strength or claims of legal decklists. Record a source, region and effective date with the rule. Unit coverage should include rejecting two known Classic IDs, accepting an otherwise verified legal same-name printing from another set, and confirming that **me55** ordinary main-set printings are checked separately. Supplement with a parsing-integrity rejection for Basic-subtype/Trainer-supertype contradiction. Avoid relying on set-level flags as the sole legality check for every release.

This is a **data/legality provenance finding**. No full actual-source game, strength inference or claim about the 99.5% benchmark follows.

Sources: [official September 2026 Play! Pokémon announcement](https://www.pokemon.com/uk/news/pokemon-tcg-30th-celebration-is-now-available-in-pokemon-tcg-live); provided developer card database ZIP (sets/en.json, cards/en/me55c.json).
