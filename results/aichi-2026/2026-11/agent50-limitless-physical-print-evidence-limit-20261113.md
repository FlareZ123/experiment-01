# Limitless decklist source cannot certify original physical printings

**Agent50 · 13 November 2026**  
**Disposition:** source limitation established; all 24 identity-screened lists remain physically unverified.

## Finding

The repository's `results/aichi-2026/full-decklists.json` identifies its source as `https://www.limitlesstcg.com/tournaments/566/decklists` and explicitly warns:

> Printing IDs follow Limitless English display where available; verify Japanese legality and original printings separately.

The public Limitless page is a decklist transcription/display page for CL Aichi Open League (10 May 2026). It provides a **Card versions** selector (Regular / Max Rarity / Random), per-card names and prices, and generic card-art images. The image links resolve to catalog card images (for example, a Shadow Rider Calyrex V image URL of the form `CRE_074_R_EN_MD.png`), not photographs of the cards registered or physically played by the entrant.

Consequently, the `printing: {set, number, language:"en"}` fields in the repository JSON are normalized English display identities. They are useful for reconstructing the published 60-card card identities and mapping them into Twinleaf, but they are **not evidence of the physical Japanese printings used at the event**. The page does not provide a physical deck photo, registration scan, or deck-check record.

## Disposition

- Keep `physicalPrintStatus:"unverified"` for the 24 identity-screened ranks. Do not promote any of them to physically verified based on the Limitless card art, the English display printing, or the card-version selector.
- This does not mean the cards are illegal. It means the source does not establish which physical copies were registered or played.
- To change the disposition, require direct evidence with enough resolution to identify the actual card printing: an entrant's physical deck photo showing the relevant card faces, an official registration/deck-check record, or equivalent primary evidence. A generic decklist image or card catalog image is insufficient.
- Continue to use the Limitless page for list identity, card counts, and source rank, while keeping the separate physical-print and Japanese/international legality fields unresolved.
- Apply the same source limitation to all lists transcribed from this page; do not repeat individual card-art checks in the hope that they reveal the physical copy.

## Separate conclusion: legal diagnostic reconstruction

This physical-source limitation does **not** block a separate, hypothetical English-print reconstruction of the 24 normalized card identities. Agent39's identity-normalized Expanded audit reports that every non-Energy identity has an Expanded-legal English print or same-name/functionally-identical alias, the official banned-printing overlay has zero hits, and 60-card construction passes. The 118 Basic Energy copies across six types can be represented with a chosen legal Basic Energy print of the matching type; Basic Energy has no four-copy limit.

The correct two-part disposition is therefore:

1. **Original physical Japanese copies used at Aichi:** unverified.
2. **Hypothetical English-print paper Expanded reconstruction of the 24 published identities:** eligible as a labeled diagnostic reconstruction, subject to current banlist/errata and chosen Basic Energy print.

Agent39's bridge exposes this distinction as `diagnostic_reconstruction_eligible:true` while retaining `paper_admission_eligible:false` and `competitive_admission_eligible:false`. The bridge's 60-string output is still awaiting full 24-deck Twinleaf resolution. The five incompatible unchanged ranks and three unavailable exact lists remain, so the reconstructed 24 are not the required 32-opponent benchmark.

## Source

- Limitless: [CL Aichi Open League — Decklists](https://www.limitlesstcg.com/tournaments/566/decklists), page shows the event, decklist transcription and card-version selector.
- Repository source: `results/aichi-2026/full-decklists.json` (`source` and `scope_note` fields).
- Official Pokémon coverage: [CL2026 Aichi May winner interview](https://www.pokemon-card.com/info/005499.html). It is a champion-interview article with decklists for league winners, including the Open League winner; it does not publish the full Top32 field or physical deck-check images, so it cannot fill ranks 23/25/28 or verify the 24 lists' original prints. Rank 1's official deck code [QnLLQ9-qvPVqa-g9gi6Q](https://www.pokemon-card.com/deck/confirm.html/deckID/QnLLQ9-qvPVqa-g9gi6Q) displays a 60-card digital decklist image and independently corroborates the winner's card identities; it is still a digital deck image, not a photo of physical copies. Do not treat official runner-up code [FVkbFV-S0oL2k-VvFvkF](https://www.pokemon-card.com/deck/confirm.html/deckID/FVkbFV-S0oL2k-VvFvkF) as Limitless source rank 2: it belongs to final runner-up Otaro's Bunnelby/Herdier/Stoutland/Rafflesia deck, whereas `full-decklists.json` source rank 2 is Takahiro Ando's Vileplume Control list. The source-page rank ordering differs from final top-cut placement; preserve the source-specific player identity.

This is a provenance boundary, not a competitive result or legality ruling. It preserves the distinction between a recoverable 60-card identity and an unverified physical deck.
