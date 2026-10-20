# New primary-source lead for missing Aichi rank 28: replica's pictured Regidrago 60

**Agent 3, 20 October 2026. Evidence class: original public image and contemporaneous social-placement attribution. Status: candidate registered-60 source, transcription and civil-identity bridge pending.**

## Provenance

- [Original 12 May 2026 image compilation](https://note.com/nayuta_poke/n/n7e3d0552090b), section `TOP32 レジドラゴ`, fifth displayed Regidrago screenshot.
- [Unchanged original image URL](https://assets.st-note.com/img/1778498104-f3i2b7OUhxcapD08QlB9ywrH.png?width=1200).
- The original image shows a publicly shared message headed **レプリカ / @nnaacc5_uec**, saying **「リストです」** (here is the list), followed by a legible `pnote` card-grid image with per-card quantity labels. The source image is dated after the 10 May 2026 tournament and included among the 12 May public gallery's Top-32 sources.
- [Independent contemporary rank roundup](https://pokekameshi.com/cl2026aichidec-extra/2/) includes the same account **@nnaacc5_uec** under its Regidrago Top-32 section and quotes the self-report **「予選28位トナメ1没」**: qualifier placement 28, elimination loss in the first knockout round.
- [Official 32-place registry preserved in this repository](field.csv) identifies missing rank 28 as **Jo Kato, Regidrago**. The account/placement connection is strong, but the alias-to-civil-name mapping has **not** been independently authenticated with a deck-registration code or full original event registration. Do not equate the account's real identity to the official name without this bridge.

The gallery itself says it accepts community submissions for which at least 55 cards are known; that inclusion criterion alone cannot establish a complete 60. This particular screenshot displays a count badge on every visible card and appears to total 60, but exact Japanese card identities and quantities are under a separate visual transcription audit.

## Reproducibility

[Manual CI 39424823375](https://github.com/FlareZ123/experiment-01/actions/runs/39424823375) at main head `b0f51758aa52773a241f102dd1af0904a3ac54d9` PASSED, containing synthetic HTML grouping tests and live HTTPS retrieval of the gallery. Its [14-day artifact 12265475896](https://github.com/FlareZ123/experiment-01/actions/runs/39424823375/artifacts/12265475896) preserves the eleven fetched PNGs with exact original URLs, byte counts, SHA-256 hashes and a parent source-page SHA-256. The original image is `dragon-05.png`. Source HTML fingerprint: `4d8471ab67d05e748845b5bfbf6a7f4cf5a43bc05ffa2b68c8e97efc308c7646`.

The reproducible scripts are [gallery HTML extraction](../../scripts/aichi_note_gallery_probe.py), [image capture with fail-closed host restrictions](../../scripts/aichi_gallery_image_capture.py) and two corresponding pure unit test modules. The new workflow is **manual-dispatch only**, complying with the repo's no-on-push CI rule. The script deliberately emits **rank-unassigned media** until attribution is justified.

## Current candidate list source and limits

The pictured grid is sufficiently detailed to distinguish quantities and many printing-specific art variants, including 4 Regidrago V, 3 Regidrago VSTAR, 3 Double Dragon Energy, 3 Fire Energy and 4 Grass Energy. Additional Dragon payloads, Trainers and tools are visible. There is a photographed QR, but it is too small for reliable decoding from the available raster and no official registration URL was extracted.

**Required before promotion to the 32-rank exact opponent manifest:** independently transcribe and sum all pictured card rows to exactly 60; validate every ambiguous Japanese artwork/printing; verify the author account actually corresponds to rank-28 official registered roster rather than merely a similar-placement published deck. Obtain original pnote/deck code when possible. Keep both source image and tentative transcription with confidence flags; do not fill unresolved slots from nearby Regidrago lists.

**Decision:** no change to exact verified coverage **29/32**, with ranks 23, 25 and 28 still outside the exact deck-ingest manifest; zero competitive-qualified games and no supported 99.5% win-rate claim. The new source is a high-priority reconstruction target, not yet a validated 60.
