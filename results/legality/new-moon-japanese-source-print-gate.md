# New Moon Perfection: official Japanese printing / dated-ban source gate

**Agent 36; 17 October 2026.** Scope: the Aichi Open League **10 May 2026**, paper Expanded (Black & White onward). This is a source-integrity and specifically identified prohibited-print screen, **not** a complete paper deck registration or all-errata legality certificate. No source-dealt competitive games have qualified.

## New primary evidence and exact source identity

The [original photographed 60](../als/new-moon-perfection-source-60.json) and the recovered [official Japanese deck-code print manifest](../als/new-moon-official-japanese-print-60.json) match across **all 33 source rows and quantities**: 60 cards, **19 Pokémon / 35 Trainer / six Energy**. The published deck code is `GxxDYx-a4rD4W-a8xYxc`; the [official deck viewer](https://www.pokemon-card.com/deck/confirm.html/deckID/GxxDYx-a4rD4W-a8xYxc) now yields individual Japanese card IDs. Its HTML was archived at [manual CI 39020209669](https://github.com/FlareZ123/experiment-01/actions/runs/39020209669). It is a separate **52nd-place Aichi participant's list**, outside the Top 32 opponent field.

Two **printing-sensitive** source rows are decisive when applying [the dated official prohibited-card list](https://www.pokemon-card.com/rules/regulation/index.html) and the repository [ban identity snapshot](japan-expanded-aichi-2026.json):

| Source row | Exact official Japanese entry | Officially named banned variants | Narrow result |
| --- | --- | --- | --- |
| 3 Unown | `XY`, ID `33598` | `SM8` Unown with DAMAGE or HAND | The source's specified print differs |
| 2 Duskull | `S4`, ID `38541` | `SM11a` Duskull with Spiritborne Evolution | The source's specified print differs |

The canonical [English functional-equivalent map](../als/new-moon-perfection-english-map.json) currently identifies that source Duskull as Vivid Voltage `swsh4-69` with Future Sight, rather than the earlier optional Shrouded Fable equivalent. This matters for exact-print reproducibility; it does not change the source's two Duskull slots. The separate named-ban screen finds **zero direct specifically prohibited printing collisions** among the 33 original Japanese rows. Any unverified related reprint restriction, erratum, event-day release date or registration rule remains a separate unresolved check.

## Reproducible tests and limitations

- [Original Japanese 33-ID screen](../../scripts/aichi-new-moon-japanese-source-print-gate.cjs) reads the source photo JSON, official Japanese print JSON, English effect map and dated ban identity snapshot; rejects count, order, ID and named prohibited-series collisions. [Standalone pure regression](../../tests/new-moon-japanese-source-print-gate.test.cjs).
- [Independent English-equivalent print audit](../../scripts/aichi-new-moon-english-print-audit.cjs) also checks source name/count, English Expanded database flag, English set release no later than 10 May 2026, ACE SPEC count and known Ability-specific variants. These checks are included in [the existing manual source-coverage test](../../tests/new-moon-print-map.test.cjs), with **passing compiled CI 39021573370** and [follow-up 39021653996](https://github.com/FlareZ123/experiment-01/actions/runs/39021653996).
- Source-sensitive Japanese late sets have contemporaneous pre-event release evidence: [M2a MEGA Dream ex on 28 November 2025](https://www.pokemon-card.com/ex/m2a/), [MC Start Deck 100 Battle Collection on 19 December 2025](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=21&dateUpperM=10&dateUpperY=2026&productType=construction), and [M3 Ninja Spinner on 13 March 2026](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=8&dateUpperM=5&dateUpperY=2026&productType=expansion). The remaining individual Japanese print dates are not independently enumerated here.

**Disposition:** This improves the physical source 60's audit trail. It does not certify the altered [New Moon Lockbreaker v1](../als/new-moon-lockbreak-60-candidate.md), which is a separate proposed deck, nor simulate competent play against the 32-rank field. Continue source-dealt decision and opponent-response validation before any deck promotion.
