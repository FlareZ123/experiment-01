# New Moon Lockbreaker: Japanese print identity and event-date availability crosscheck

**Agent20 | 12 November 2026.** Scope: the proposed Japanese-print 60 in `results/als/new-moon-lockbreak-japanese-print-60.json`, for the 10 May 2026 Aichi event.

## Determination

The proposed 60 has an exact print-ID/count fingerprint of `13bbed10dc9610e8457a653262717dc35f865324726da6434e3c1710d8db9047` and 34 names / 60 copies. Its 2025–26 print families and both proposed additions have official Japanese product/card references dated before the event. The latest identified print is Telepathic Psychic Energy (M3), released **23 January 2026**, 107 days before the event. I found no post-event printing in the proposed manifest.

This resolves the narrow **physical-print existence and event-date release** question for the constructed manifest. It does **not** certify complete Japanese Extra legality, all applicable errata/event rulings, physical possession/custody, or simulator text fidelity. The modified 60 has **no official Japanese deck code**: `GxxDYx-a4rD4W-a8xYxc` belongs only to the unmodified source 52nd-place 60. Any intake/bundle must preserve that distinction and must not attribute the source code to Lockbreaker.

## Latest candidate print families checked

| Candidate set code | Candidate cards / copies | Official product identity | Official release date |
|---|---|---|---:|
| SVEM | Fog Crystal ×4 | Starter Set Terastal Mewtwo ex; official product page lists Fog Crystal | 22 Sep 2023 |
| MA | Squawkabilly ex ×1 | Premium Trainer Box MEGA; official card page identifies MA 010/043 | 1 Aug 2025 |
| ENE | Basic Psychic Energy ×3 | Starter Set MEGA Mega Diancie ex; official card page links the card to this product | 5 Sep 2025 |
| M2a | Latias ex ×1 | MEGA Dream ex; official card page identifies M2a 075/193 | 28 Nov 2025 |
| MC | Lillie's Clefairy ex ×1; Powerglass ×2; Lillie's Determination ×2 | Start Deck 100 Battle Collection; official card pages identify MC 287/742, 683/742 and 729/742 | 19 Dec 2025 |
| M3 | Telepathic Psychic Energy ×3 | Munikis Zero; official card page identifies M3 079/080 | 23 Jan 2026 |

Official card/product references:

- SVEM / Fog Crystal: https://www.pokemon-card.com/products/sv/sve.html
- MA / Squawkabilly ex: https://www.pokemon-card.com/card-search/details.php/card/47869 and https://www.pokemon-card.com/ex/m1/index.html
- ENE / Basic Psychic Energy: https://www.pokemon-card.com/card-search/details.php/card/48307 and https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=9&dateUpperM=4&dateUpperY=2026&productType=construction
- M2a / Latias ex: https://www.pokemon-card.com/card-search/details.php/card/48597 and https://www.pokemon-card.com/ex/m2a/index.html
- MC / Lillie's Clefairy ex: https://www.pokemon-card.com/card-search/details.php/card/49003
- MC / Powerglass: https://www.pokemon-card.com/card-search/details.php/card/49399
- MC / Lillie's Determination: https://www.pokemon-card.com/card-search/details.php/card/49445
- MC product: https://www.pokemon-card.com/ex/mc/index.html
- M3 / Telepathic Psychic Energy: https://www.pokemon-card.com/card-search/details.php/card/49712 and https://www.pokemon-card.com/ex/m3/index.html

The official product pages give the dates above: SVEM 22 Sep 2023; MA 1 Aug 2025; ENE product 5 Sep 2025; M2a 28 Nov 2025; MC 19 Dec 2025; M3 23 Jan 2026. The remaining source-retained set codes in the manifest are older XY/SM/SWSH/SV-era printings. The two additions were already separately documented as official Japanese prints: Field Blower SM4p 093/114 (20 Oct 2017) and Canceling Cologne S9a 063/067 (25 Feb 2022).

## Scope and handoff

- The original official deck code is source provenance only; it cannot be used as the proposed modified deck's registration code.
- Preserve the candidate's exact Japanese manifest and its existing validator/fingerprint. The corrected 4410 intake should point to the proposed Japanese manifest while retaining the original registration's stale pointer for traceability.
- The repository's dated Japanese ban-screen already reports zero explicit banned-print collisions for this manifest, but deliberately leaves `fullPaperLegalityCertified: false`.
- Therefore the 4410 run may produce capture/pipeline evidence once the V2 builder and hook/policy gates are green; this report alone does not promote it to a paper-qualified competitive game.

## Reproduction pointers

- Candidate manifest: `results/als/new-moon-lockbreak-japanese-print-60.json`
- Original official source manifest: `results/als/new-moon-official-japanese-print-60.json`
- Exact identity / count and English inventory parity: `scripts/new-moon-lockbreak-japanese-provenance.cjs`
- Dated banned-print screen: `scripts/new-moon-lockbreak-japanese-ban-screen.cjs`
- Existing audit: `results/als/new-moon-lockbreak-japanese-print-audit.md`

This was a focused source-date crosscheck, not a new gameplay experiment or a complete card-by-card legality/errata certification.
