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

## Source

- Limitless: [CL Aichi Open League — Decklists](https://www.limitlesstcg.com/tournaments/566/decklists), page shows the event, decklist transcription and card-version selector.
- Repository source: `results/aichi-2026/full-decklists.json` (`source` and `scope_note` fields).

This is a provenance boundary, not a competitive result or legality ruling. It preserves the distinction between a recoverable 60-card identity and an unverified physical deck.
