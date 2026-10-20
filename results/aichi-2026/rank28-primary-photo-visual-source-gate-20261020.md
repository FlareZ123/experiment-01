# Rank 28 Regidrago: original player-photo verification and negative 60-card source gate

**Agent 35 | 20 October 2026.** Scope: visual assessment of a first-person original public social post previously authenticated and downloaded by the project's existing source-retrieval workflow. This is **primary-event provenance evidence**, not a complete opponent registration or a card-count reconstruction.

## Exact immutable source

- The player-post lead was [Replica's May 10, 2026 first-person result statement](https://x.com/nnaacc5_uec/status/2053378618420859259), previously cited by [Pokekameshi's Top-32 collection](https://pokekameshi.com/cl2026aichidec-extra/2/): `CL愛知エクストラ 予選28位トナメ1没でした！ レジドラゴ、今までありがとう` (they report 28th in preliminary standings and Regidrago, elimination in the first bracket match). A handle-to-English-legal-name association still needs independent confirmation if rank **28 Jo Kato** is to receive an exact 60.
- The existing [original-photo retrieval script](../../scripts/aichi-missing-rank-social-media.cjs) records its single image source URL: [direct original player photo](https://pbs.twimg.com/media/HH8Q9ZxbkAA7tZp.jpg?name=orig).
- [Manual workflow 39365303076](https://github.com/FlareZ123/experiment-01/actions/runs/39365303076) preserved image bytes, **SHA-256 `d7ed049c4335dcf906ee3ff2d60ca810cb1943672731d237362243af3c8b4d31`**, in artifact `12238463290`.
- To visually verify the archive without blindly trusting the image-search index, existing manually dispatched [workflow 39423764978](https://github.com/FlareZ123/experiment-01/actions/runs/39423764978) produced a bounded JPEG preview using [research-owned display script](../../scripts/aichi_public_photo_preview.py). It verified the original SHA-256 against the authenticated manifest before encoding. Previewed source geometry was **2048×1797**, reduced for inspection to **1800×1579**. The runner succeeded. No OCR or guessed roster parsing was used.

## Visual finding

The photo shows a physical **Open League rank 28 badge**, an official **Top 32 notification/eligibility letter**, event memorabilia and a small selection of Japanese Pokémon and Trainer cards on a green tabletop. Those items support the poster's reported tournament placing and broad deck theme, in context with the first-person tweet. The image **is not an official deck registration screen, a sorted full-deck card grid, a list of 60 cards, or an exhaustive inventory of quantities**. The visible individual trading cards may be memorabilia or favourites and their physical inclusion in the event deck cannot be established by this photo.

**Critical source-integrity decision:** do not convert this single-photo lead into a reconstructed rank-28 60. Do not treat the visible Regidrago VSTAR / other loose cards as guaranteed card inclusions or infer unseen counts. The benchmark opponent `rank:28` remains **unpublished/unverified full 60**, just as before inspection.

## Reusable review mechanism

The [existing manual-only source-media workflow](../../.github/workflows/aichi-missing-source-public-media.yml) now has optional `preview_lead` modes `rank28-replica` and `rank25-kume`. Default `none` keeps its previous behavior and cost; the extra Pillow-based bounded encoding runs only on explicit request. Preview source IDs are checked against the manifest's original photo SHA-256; neither the script nor the workflow edits `full-decklists.json`. The verified metadata can be reproduced with manual dispatch using `preview_lead=rank28-replica`.

This review consumed one explicit image-probe CI run and established a **negative** full-roster finding. Running a second photo acquisition on the same URL is unnecessary. Future recovery should search for the player's own full-list registration/deck code or a properly attributable complete published list, and then reconcile independently against the ranked record.

## Current field decision

**29/32** exact published opponent lists are available. **Ranks 23, 25 and 28 still lack verified full 60s.** The rank-28 photo increases provenance confidence for placing and broad archetype, not roster completeness. No competitively qualified game or fixed-list 99.5% achievement follows.
