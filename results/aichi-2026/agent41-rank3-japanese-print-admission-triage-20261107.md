# Agent41: rank-3 Japanese print identity and Extra-admission triage

**Date:** 7 November 2026  
**Scope:** Rank-3 Snorlax Stall source printings, plus the five Player's Ceremony copies across the authenticated field.  
**Disposition:** Candidate Japanese print identities and ban-list status are now mapped. Actual tournament physical-copy provenance remains unverified.

## Correct the copy count first

The authenticated source manifest at `results/aichi-2026/full-decklists.json` has **one** Player's Ceremony in rank 3 Haruto Miki's list, not five. The five copies are distributed across four lists:

| Rank | Player | Player's Ceremony source entry |
|---:|---|---:|
| 3 | Haruto Miki | 1 × `SP 127` |
| 6 | Kazuma Kashi | 1 × `SP 127` |
| 24 | Ryoya Fujii | 2 × `SP 127` |
| 29 | Kohei Hamamichi | 1 × `SP 127` |
| **Total** | | **5 copies** |

Rank 3 also has one `Team Rocket's Handiwork FCO 112` and one `Bunnelby PRC 121`.

The source manifest records these printings with `language: "en"`; these are translated decklist/proxy identifiers, not proof of the physical card language used at the event. The rank-3 row in `results/aichi-2026/original-printed60-admission-v1.json` has `sourceLegalChain: "unqualified"`.

## Japanese card-catalog mapping

| Source-list entry | Japanese catalog candidate | What is established | What remains unproved |
|---|---|---|---|
| Player's Ceremony `SP 127` | `プレイヤーズセレモニー 127/S-P` | The official Pokémon card catalog identifies 127/S-P as Player's Ceremony, a Japanese Sword & Shield promo Stadium. The source set/number maps to this Japanese catalog identity. | The source file's language field is English and there is no physical deck photograph or event-side card inventory proving that the actual copy used was Japanese 127/S-P. The native Twinleaf census still has no exact native card ID for this printing. |
| Team Rocket's Handiwork `FCO 112` | `ロケット団の工作`, XY10-B `087/078` (secret/full-art candidate); XY10-B `077/078` is also an official same-name, same-effect print | The official Japanese catalog confirms the Japanese card name, XY10-B printings, and effect. The FCO 112 source entry is consistent with the full-art 087/078 counterpart. | The translated source entry does not authenticate which Japanese physical copy was used. The 087/078 mapping is a candidate, not a source-photo match. |
| Bunnelby `PRC 121` | `ホルビー`, XY5-Bg `059/070` | The official Japanese catalog confirms the 60-HP `Ω連打` Bunnelby with the Burrow and Rototiller effects. Its illustrator is Hitoshi Ariga, matching the PRC 121 source printing. | The catalog also has an XY `107/171` reprint with the same `Ω連打`/attack line. Without a physical source image or event inventory, the actual Japanese printing used cannot be selected conclusively. |

Official catalog references:
- Player's Ceremony 127/S-P: https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY
- Team Rocket's Handiwork XY10-B 087/078: https://www.pokemon-card.com/card-search/details.php/card/35849
- Team Rocket's Handiwork XY10-B 077/078: https://www.pokemon-card.com/card-search/details.php/card/31811/regu/XY
- Bunnelby XY5-Bg 059/070: https://www.pokemon-card.com/card-search/details.php/card/30721
- Bunnelby XY 107/171 reprint: https://www.pokemon-card.com/card-search/details.php/card/33787

## Japanese Extra admission

The official Japanese regulation page, updated 19 February 2026, defines Extra as BW through the latest series and lists the cards that cannot be included. The list does **not** include Player's Ceremony, Team Rocket's Handiwork, or Bunnelby. The candidate Japanese printings above are from the permitted Sword & Shield or XY series.

- Official Extra regulation and banned-card list: https://www.pokemon-card.com/rules/regulation/index.html
- Official Aichi event announcement: https://www.pokemon-card.com/info/005445.html

The Aichi Open League was Extra Regulation, 60 cards / six Prizes, and the event announcement explicitly required Japanese-language cards. Therefore the three card names are **admitted by series and current ban-list status**, subject to the event's Japanese-language requirement and exact physical-copy authentication.

This distinction matters:
- `Player's Ceremony SP 127` has a strong source-code-to-Japanese-catalog mapping to 127/S-P, and that card is not banned.
- `Team Rocket's Handiwork FCO 112` and `Bunnelby PRC 121` have plausible Japanese counterpart printings, and their names are not banned.
- None of those findings proves which physical Japanese cards were actually registered or played in the Aichi event.

## Relationship to the 29-list native print census

`results/aichi-2026/agent41-japanese-promo-resolution-validation-20261107.md` reports 40 original-print rows without exact native Twinleaf IDs: 35 Basic Energy rows, four Player's Ceremony rows, and one Electrike PRC 60 row. It also reports five Player's Ceremony copies across ranks 3, 6, 24, and 29, represented by the research-only implementation.

The four Player's Ceremony rows in that census are a **native catalog-ID gap**. They should not be conflated with the separate physical-print question: the source list identifies `SP 127`, which maps to Japanese 127/S-P, but the source does not independently authenticate the actual physical Japanese copy. The deck-resolution census is not a paper-legality certificate.

## Handoff to rank-3 source research

The narrow source rows are:
- `results/aichi-2026/full-decklists.json`: `decks[rank=3].cards` entries for Player's Ceremony, Team Rocket's Handiwork, and Bunnelby.
- `results/aichi-2026/original-printed60-admission-v1.json`: `rows[rank=3]`, source hash `83b572db9a53be1e239440933fccd89a502ec31e18d539b5c540fc2e08132263`, `sourceLegalChain: "unqualified"`.
- `results/aichi-2026/agent41-japanese-promo-resolution-validation-20261107.md`: four Player's Ceremony source-print rows without native IDs, five total copies across the field.
- `results/methodology/agent1-rank3-owner-zone-reachability-20261107.md`: explicit warning that the rank-3 converted list uses English proxy printings and is not an Aichi Japanese Extra legality proof.

**Recommended next evidence:** obtain the original rank-3 deck image or event-side list export with Japanese card numbers/language, then bind each of these three source rows to the physical card. Until then, preserve the source code mapping as a candidate and leave the rank-3 paper source-legal chain unqualified.
