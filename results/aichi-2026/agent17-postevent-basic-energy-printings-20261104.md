# Aichi May 2026 paper-original printing chronology defect: 120 post-event Basic Energy art references

**Agent 17 | 4 November 2026 | source chronology and complete deterministic audit of the 29 archived 60s**

## Finding and evidentiary boundary

The [Aichi Open League 2026 published tournament](https://limitlesstcg.com/tournaments/566/decklists) took place **10 May 2026**. The Pokémon Company's [official 30th Celebration announcement](https://press.pokemon.com/en/MEDIA-ALERT-Pokemon-Unveils-New-Pokemon-Trading-Card-Game-30th-Celebra) is dated **1 June 2026** and announced an upcoming **16 September 2026** release. Its [official launch announcement](https://pokemon.gamespress.com/MEDIA-ALERT-Pokemon-Trading-Card-Game-30th-Celebration-Expansion-Launc) confirms the 16 September release. The [MEE print list](https://bulbapedia.bulbagarden.net/wiki/MEE_Basic_Energies_(TCG)) identifies **MEE 009 through MEE 016 as 30th Celebration YOSHIROTTEN art**. The first eight MEE Basic Energy printings, MEE 001 through 008, originated earlier with Mega Evolution.

The repository's ostensibly original exact-printed opponent lists in [full-decklists.json](full-decklists.json) contain **120 copies across 35 name/printing rows in 22 of the 29 published rank decks** assigned to these *September 2026* MEE 009-016 printings. They therefore **cannot be literal physical copies played at the May 2026 tournament**. This is an error in the archived *printing-identity annotation or subsequent reconstruction*, not by itself proof that the card names, card quantities, tournament placement or deck type are incorrect.

For a concrete direct-source crosscheck: the [original rank-1 published May deck entry](https://limitlesstcg.com/tournaments/566/decklists) shows **11 Psychic Energy** and links its card entry to [MEE #5](https://limitlesstcg.com/cards/MEE/5). It does **not** establish the actual art used by Yasunori Kato. The repository's rank-1 reconstruction labels all 11 as **MEE #13**, a different YOSHIROTTEN art introduced four months later. At most the source confirms **11 Basic Psychic Energy cards**; the 11 original physical artwork variants remain unproven.

The engine's [pinned Basic Energy definition](../../vendor/twinleaf/ptcg-server/src/sets/11-mega-evolution/set-mega-evolution-energy/basic-energies.ts) likewise offers MEE #5, with the same ordinary Psychic Energy game rule. Using #5 as a **declared same-mechanics proxy** is valid for this narrow attack test and reproducible engine experiment. The substituted collection number **must not** be presented as an exact physical reproduction of source MEE #13. The repository's original rank-1 metadata for #13 itself is chronologically untenable.

## Full manifest count

| Rank | Physical copies with post-event MEE 009-016 art annotation | Suspicious artifact variants |
| ---: | ---: | --- |
| 1 | 11 | Psychic #13 |
| 2 | 1 | Grass #09 |
| 3 | 2 | Water #11 |
| 8 | 7 | Darkness #15, Lightning #12 |
| 9 | 2 | Darkness #15 |
| 10 | 6 | Grass #09, Fire #10 |
| 11 | 8 | Darkness #15 |
| 12 | 6 | Grass #09, Fire #10 |
| 13 | 7 | Grass #09, Fire #10 |
| 14 | 6 | Grass #09, Fire #10 |
| 15 | 2 | Grass #09 |
| 16 | 7 | Darkness #15 |
| 18 | 4 | Grass #09, Fire #10 |
| 19 | 9 | Lightning #12, Fighting #14, Darkness #15 |
| 20 | 6 | Grass #09, Fire #10 |
| 21 | 7 | Grass #09, Fire #10 |
| 22 | 8 | Darkness #15, Lightning #12 |
| 26 | 2 | Lightning #12 |
| 27 | 6 | Grass #09, Fire #10 |
| 30 | 5 | Psychic #13 |
| 31 | 2 | Psychic #13 |
| 32 | 6 | Grass #09, Fire #10 |
| **Total** | **120** | **35 original name/print rows, 22 source ranks** |

Reproducible manifest-only audit: [agent17-may2026-future-energy-print-audit.cjs](../../simulation/evaluation/agent17-may2026-future-energy-print-audit.cjs). Test: [agent17-may2026-future-energy-print-audit.test.cjs](../../tests/agent17-may2026-future-energy-print-audit.test.cjs). The exact committed audit function was executed against the currently fetched 29-list JSON in a V8 research runtime and returned 120 copies, 35 rows, 22 rank decks. The Node tests were committed but are not yet independently run by GitHub CI.

## Implications for admission and source methodology

**Retain 29 published source deck compositions** with 60 counted cards each. Do not change source card names/counts, infer historical art variants, downgrade an ordinary Basic Energy's gameplay legality, or classify the player as having used a future card. The false historical art attribution was created in the research archive, and Basic Energy card-name rules are unaffected.

**Downgrade exact-physical-print claims for at least these 22 source ranks.** The 29 published lists may still authenticate *card identities and multiplicities*, but the present archive cannot establish exact physical artwork for 120 entries. The broader authenticity of non-Energy printings and the remaining seven ranks requires separate audit. This print-drift affects the factual accuracy of experiment provenance and claimed exact-source replay; it does not itself invalidate a game-semantic match when alternate-art Basic Energy cards are deliberately normalized and the normalization is logged.

A proper field-input provenance schema should distinguish:
1. **Card identity/count** supported by the published tournament entry.
2. **Exact printing** actually evidenced by pre-event player registration, tournament photo or public original image (often not available).
3. **Repository-selected representative** printing with publication and tournament date validity.
4. **Simulator-supported equivalent** with its own explicit printing and semantic-equivalence basis.

A clean, valid **May-era card-number proxy** for MEE #13 Basic Psychic is MEE #5 (released 2025), provided the simulator and user acknowledge the proxy and verify identical Basic Energy mechanics. The archived exact original card-count benchmark remains **29/32** with ranks **23, 25 and 28** missing, and **zero competitively qualified games**. The goal of one true 99.5% fixed-60 deck remains entirely unproven.

**Scope of chronology certainty:** The official 30th Celebration release date and the MEE artwork-family assignment support the date mismatch. This audit has no tournament paper registration photographs, so cannot identify which particular legal Basic Energy artworks each player used. It deliberately does not attempt to reconstruct those unknown photographs.
