# Rank-28 Replica photo: R4C2 identifies Professor Juniper, not Guzma & Hala

**Agent 3, 20 October 2026. Bounded direct-image/artwork crosscheck. No source-manifest promotion.**

## Original primary artifact

The exact `dragon-05.png` (1051 × 1067) from [the manual original-gallery archive](https://github.com/FlareZ123/experiment-01/actions/runs/39424823375/artifacts/12265475896), verified locally at SHA-256 `3b23a6fb4daf9b1f537462d50611d6d2765bf0dc228338c3ddd0e41b97452cc9`, shows a 5-row pnote grid under `レプリカ / @nnaacc5_uec`. The original [public source photo](https://assets.st-note.com/img/1778498104-f3i2b7OUhxcapD08QlB9ywrH.png?width=1200) remains the image of record.

Two independent ledger transcriptions disagree on photo **row 4, column 2, badge ×2**:

| Existing record | Reported card |
| --- | --- |
| [Agent 1's visual badge ledger](rank28-replica-pnote-visual-badge-ledger-20261020.md) | **2 Professor Juniper** |
| [Agent 48's provisional cell CSV](agent48-rank28-photo-provisional-cells.csv), [report](agent48-rank28-photo-60-provisional.md), and [mechanical print map](agent48-rank28-photo-mechanical-print-map.json) | **2 Guzma & Hala** |

## Discriminating art and text

The R4C2 artwork depicts Professor Juniper (アララギ博士) with a **terracotta-colored roof to the left, waving brown-haired woman in front, green trees to the right**. Those composition elements agree with the [Japanese Pokémon TCG official BW1-Bb 053/053 Professor Juniper image](https://www.pokemon-card.com/card-search/details.php/card/27153). The exact Japanese promo or reprint collector ID in the screenshot cannot be resolved from its raster; the BW1 image is an artwork comparison, **not an authenticated physical-print assignment**.

The [official ordinary Guzma & Hala SM12 087/095 image](https://www.pokemon-card.com/card-search/details.php/card/37151/regu/BW) instead shows **two men, Guzma with sunglasses and Hala in a yellow jacket**, plus a distinctive yellow `TAG TEAM` frame. Its [alternate SM12 105/095 artwork](https://www.pokemon-card.com/card-search/details.php/card/37387/regu/XY) also depicts those two men and has the yellow `TAG TEAM` frame. Neither depiction matches R4C2.

**Finding:** the original Agent 1 card-name read, **2 Professor Juniper**, is substantially better supported. Agent 48's **2 Guzma & Hala** is a material transcription error. Quantity `2` is agreed and does not change the original full-photo `60` count (20 Pokémon / 30 Trainers / 10 Energy). The corrected name changes the Supporter function from Stadium/Special Energy/Tool search to discard-hand/draw-seven, so it affects opening-policy and discard modeling.

## Additional checks and limits

- The other visually reviewed contested cells match their provisional identifications: R4C3 Lillie's Determination, R4C4 Raihan, R4C8 Marnie, R5C3 Parallel City. The rest of the 38 positions have **not** received exhaustive independent print-by-print scrutiny in this crosscheck.
- OpenCV QRCodeDetector was tried locally against the archived full image and QR crop at 1× through 8× with grayscale, Otsu and adaptive thresholding. **No QR string was decoded**. This negative is limited by severe raster downsampling and does not establish the code's unreadability from higher-resolution originals.
- The [contemporaneous rank-28 self-report](https://pokekameshi.com/cl2026aichidec-extra/2/) and independent Swiss/field rank controls make source alignment promising; the public image does **not** authenticate the screen-name-to-Jo-Kato civil identity or prove an event-submitted print-exact sixty.
- **Benchmark evidence remains 29/32 verified opponent lists; rank 28 stays provisional; zero competitive-qualified games; no 99.5% win claim.** Do not use the erroneous R4C2 mechanical map or provisional CSV as an exact rank-28 source input.

## Repair

Correct R4C2 in the provisional CSV, prose and representative print map with an explicitly labeled Japanese-artwork-consistent Professor Juniper printing; independently review other visually ambiguous cells and identity linkage before any manifest promotion. Coordinate with the active Agent 48 source owner to avoid competing edits.
