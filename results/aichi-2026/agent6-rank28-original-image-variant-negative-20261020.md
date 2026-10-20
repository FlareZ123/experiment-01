# Rank-28 primary image: original-resolution and QR recovery negative control

**Agent 6, 20 October 2026.** This is a reproducible, bounded public-source fidelity test. It does **not** establish an official 60-card registration, participant identity, verified Japanese card printings, or game wins.

## Question and primary source

Agent 3 archived the original Regidrago Top-32 gallery image associated with Replica / `@nnaacc5_uec` in [the 12 May 2026 note.com gallery](https://note.com/nayuta_poke/n/n7e3d0552090b). Agent 21 independently transcribed **38 badged entries totaling 60** in [the candidate source transcription](rank28-replica-visual-transcription-audit-20261020.md), but the association of Replica's public alias with official rank-28 registrant **Jo Kato** remains unverified. The image appears to contain a small QR code whose original data might potentially identify a first-party deck entry. Could removing the CDN image-width parameter or requesting 2400 pixels restore a higher-resolution source and permit QR decoding?

## Method

Added [reproducible public-image probe](../../scripts/aichi_rank28_image_variants.py) and [isolated offline tests](../../tests/test_aichi_rank28_image_variants.py). The bounded request set uses one exact, whitelisted `assets.st-note.com/img/...` PNG with three options:

- `?width=1200` as the archival baseline;
- `?width=2400`;
- no query parameter.

For every successful request, confirm origin/path, PNG signature and IHDR, bytes, dimensions and SHA-256. Compare to independently recorded original 1200-image hash `3b23a6fb4daf9b1f537462d50611d6d2765bf0dc228338c3ddd0e41b97452cc9`. Attempt OpenCV's `QRCodeDetector.detectAndDecode` on the full image at native and 2x nearest-neighbor enlargement. Archive unique actual PNG binaries and a machine-readable manifest. No user-uploaded image, reconstructed code or generated artwork was substituted.

Existing [manual-only gallery workflow](../../.github/workflows/aichi-gallery-provenance.yml) was extended with an explicit optional `rank28_original_variants` dispatch input, leaving default behavior unchanged and avoiding any on-push trigger.

## Compiled execution and independently checked archive

- [Manual GitHub Actions run 39464870439](https://github.com/FlareZ123/experiment-01/actions/runs/39464870439), **success**, execution head `1fad1be6dce5710600f05af7f45e4e8657b2fa4f`. The workflow includes offline variant tests and the existing gallery tests.
- [Original-resolution evidence ZIP, artifact 12284247150](https://github.com/FlareZ123/experiment-01/actions/runs/39464870439/artifacts/12284247150), ZIP SHA-256 `70c85c32bb3ea70171fa3ee72ba378afaac47f4921963c6658edf286fdd021a1` independently computed from the downloaded archive, matching the Actions artifact digest.
- Its `manifest.json` has `status:source-1200-match` and the three successful records:

| URL option | Actual pixels | Bytes | SHA-256 | Decoded QR payloads |
| --- | --- | ---: | --- | ---: |
| `width=1200` | 1051 × 1067 | 533,272 | `3b23a6fb4daf9b1f537462d50611d6d2765bf0dc228338c3ddd0e41b97452cc9` | 0 |
| `width=2400` | 1051 × 1067 | 533,272 | **identical** | 0 |
| Unparameterized original | 1051 × 1067 | 533,272 | **identical** | 0 |

The artifact stores one PNG because the three HTTP responses are byte-identical. There is no higher-resolution version obtainable from these two tested variants or the unparameterized original. **No QR payload was decoded by this particular detector and two scale settings.** This does not prove that a QR code is absent or that alternate photographic or decoding sources cannot recover it.

## Implications and next route

This closes the narrow CDN width-parameter escalation route. A different original export, identifiable pnote/deck code, verifiable author-to-official-entrant linkage, or independent Japanese printing-level registration evidence remains necessary. Preserve Agent 21's photographed candidate as a **provisional adversarial 60**, not as a verified official rank-28 source entry.

**Benchmark status unchanged:** 29/32 exact published 60s (official ranks 23, 25 and 28 still unresolved), zero competitively qualified games, no supported 99.5% single-deck win-rate claim. No gameplay, engine adapter, candidate deck or tournament result was changed.
