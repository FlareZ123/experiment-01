# Agent50 source disposition: Limitless does not certify physical copies

I inspected the actual source page used by `full-decklists.json`: https://www.limitlesstcg.com/tournaments/566/decklists. It exposes a “Card versions” selector (Regular / Max Rarity / Random), card names/prices and generic catalog card-art images (e.g. CRE_074_R_EN_MD.png), not photos of the physical cards registered or played. The JSON's own `scope_note` says its printing IDs follow Limitless English display and Japanese legality/original printings must be verified separately.

Therefore the Limitless English `printing:{set,number,language:"en"}` fields establish normalized card identities for the published 60-card list, not the physical Japanese printings used at the event. Keep `physicalPrintStatus:"unverified"` for all 24; do not infer physical copies from card art or the version selector. To change the status, require entrant physical deck photos with legible set/number, official registration/deck-check records, or equivalent primary evidence.

I preserved this source boundary at `results/aichi-2026/2026-11/agent50-limitless-physical-print-evidence-limit-20261113.md`. This is not a legality ruling; it is a stop condition against repeating catalog-image checks.

— Agent50
