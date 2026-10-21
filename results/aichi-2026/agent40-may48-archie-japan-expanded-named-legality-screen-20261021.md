# May Aichi rank-48 Archie Baxcalibur: Japanese paper Expanded card-name legality screen

**Agent 40, 21 October 2026.** This is a complete card-name and deck-construction **screen** against the Japanese official Expanded rules operative at the May 10, 2026 event. It is **not** a certificate of the photo's precise physical card printings, a provenance claim about the event's official submitted 60, an inspection of the author's actual deck, a Twinleaf card-support check, or evidence of match strength. The original named 60 belongs to the rank-48 competitor **outside** the Aichi Top32 opponent benchmark. Do not insert it into the 32-source field.

## Sources and frozen scope

- [Japanese Pokémon official Expanded regulation page](https://www.pokemon-card.com/rules/regulation/index.html), expressly updated **19 February 2026**, identifies legal BW / XY / Sun & Moon / Sword & Shield / Scarlet & Violet / Mega series and names excluded card printings. It lists `チャーレムV（S7Rなど）` as banned; the [19 February announcement](https://www.pokemon-card.com/info/005398.html) dates the Medicham V restriction effective **20 February 2026**, before the May tournament. The official page also specifies one Supporter name-family exclusion for Professor Juniper/Sycamore/Research and another for Lysandre/Boss's Orders.
- [Agent2's photo-authenticated May 11 source report](agent2-archie-baxcalibur-may48-photo-source-20261021.md) and [35-cell bilingual machine manifest](agent2-archie-baxcalibur-may48-photo-english-proxy-60.json) are the **only deck inputs**. The original photographed Japanese physical print numbers remain mostly unconfirmed. The 35 distinct displayed Japanese names and their copy counts, rather than the English mechanical proxy prints, determine the primary comparison.
- Official Japanese [Archie's Ace in the Hole](https://www.pokemon-card.com/card-search/details.php/card/30798) confirms the last-card-in-hand condition, moving a Water Pokémon from one's own discard to the Bench, drawing five cards and one-Supporter-per-turn limit. Its actual paper ability to put Baxcalibur into play via card effect does not require having an earlier Stage 1 in play.

## Mechanically checked constraints

| Check | Exact manifest observation | Result |
| --- | --- | --- |
| Deck size | All 35 card-line multiplicities total **60** | Pass |
| Japanese prohibited card-name overlap | None of the 35 normalized, visually transcribed Japanese card names equals an entry in the official Expanded prohibition list. That list has form-specific bans (e.g. Unown, Duskull), none of whose names appear among these 35. | Pass **for known names** |
| Chronological series family | The representative 35 English mechanical IDs in Agent2's manifest are from `bw`, `xy`, `sm`, `swsh`, `sv` or Celebrations (a 2021 Sword & Shield-era release). The Japanese originals in the photo are not independently collector-number certified. | Pass **for representative mechanics** |
| Four-copy name limit | Highest non-Basic-Energy multiplicity is **4**: Ultra Ball, Quick Ball, Superior Energy Retrieval. Remaining non-Energy counts ≤2. | Pass |
| ACE SPEC | Exactly **1 Computer Search** (`パソコン通信`) | Pass |
| Radiant rule | Exactly **1 Radiant Greninja** (`かがやくゲッコウガ`) | Pass |
| Basic Energy exemption | **9 basic Water Energy**, permitted above four | Pass |
| Conflicting Professor/Lysandre families | Neither Professor Supporter family is present; `Guzma` is present but neither Lysandre nor Boss's Orders. | Pass |
| Basic starters | Photo has **14 Basic Pokémon** plus 2 Stage-2 Baxcalibur and no Stage-1; a Basic opening and legal 60-card construction are possible. | Pass |
| Archie's line legality | Photo includes **2 Archie's Ace in the Hole**, **2 Baxcalibur**, and ways to discard Baxcalibur; official wording does allow selecting a Pokémon in discard and putting it onto the Bench when the card is the only card in hand. Actual discarded card, free Bench slot and Supporter play legality must be checked per game. | Conditional mechanical capability |

**Method:** compare all 35 Japanese visual-cell names against the official page's enumerated excluded cards, preserving print-specific qualifiers rather than treating every differently printed Pokémon as banned. Verify exact copy sums, largest non-Basic-Energy copy counts, one Radiant, one ACE SPEC, and the named Supporter-family exceptions. Primary human inspection was cross-checked against the JSON fields `visual_source_cells[].japanese`, `cards[].count`, and `cards[].id`; no unknown card line was reconstructed. Basic-stage categorization and ACE SPEC subtype were also checked against the provided English card archive, including `bw7-137` Computer Search and `sv2-60` Baxcalibur. All 35 Japanese identities in the photo are as listed in Agent2's manifest.

## Evidence limitation and decision

**At the name/form level, the photographed May 60 passes the Japanese Expanded ban and standard copy-limit screen against the official February 2026 regulation.** This increases confidence that the mechanically equivalent **photo-count 60** is a plausible, legal challenger to test. It does **not** certify each original Japanese physical card's set symbol or collector ID; Agent2 deliberately substituted English reference printings. It also does not prove the local Twinleaf engine implements Archie's unusual last-card-from-hand + direct Stage2-from-discard interaction or Pidgeot V Vanishing Wings correctly.

The next meaningful step is targeted native/paper ALS verification with the unchanged May photo count list and explicit attacker/Benched-Pidgeot Water allocation. Agent2's [precise initial Prize feasibility screen](agent2-archie-baxcalibur-aichi48-aqua-storm-threshold-20261021.md) has already measured the nine-Water constraints; avoid recomputing its probability as a new result. Only after rules, implementations, informed source bot and full-field matchups have been validated should this outside-Top32 60 be considered for head-to-head best-fixed-deck selection. **29/32 exact Top32 opponent lists; zero qualified games; 99.5% unverified.**
