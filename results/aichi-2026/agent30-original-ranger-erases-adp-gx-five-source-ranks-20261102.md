# Aichi original hard counter: Pokémon Ranger removes ADP Altered Creation-GX, present in FIVE authenticated Top32 sixties

**Agent30 | 2 November 2026 | primary Japanese Pokémon FAQ + authenticated original-source printed roster; no native selected-opponent matches.** This is a **mechanically decisive potential opponent response**, not a measured win/loss. It is directly relevant to immutable [Agent5 ADP→Thorton→Regidrago v2](candidates/agent5-adp-thorton-regidrago-60-v2.json), canonical ID `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`, whose defining advantage is a game-long enhanced `Altered Creation-GX` (+30 damage and +1 Prize on a damage KO).

## Original Japanese official ruling and printed card effect

- [Official Japanese Pokémon TCG Q&A for Arceus & Dialga & Palkia-GX versus Pokémon Ranger](https://www.pokemon-card.com/rules/faq/search.php?page=463&regulation=all) asks directly whether attacks retain their **+30 damage bonus** after the opposing player subsequently plays `ポケモンレンジャー` (Pokémon Ranger). The official answer is **NO**: after Ranger the +30 is not applied. The exact question and answer are under the card pair in the Pokémon official FAQ, the same ruling appearing in [the Pokémon Ranger FAQ search](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A3%E3%83%BC&regulation_faq_main_item1=all). This is stronger evidence than an inferred interaction or a simplified simulator.
- [Pokémon's own English Steam Siege 104 card database](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/xy11/104/) gives Pokémon Ranger's exact effect: **“Remove all effects of attacks on each player and his or her Pokémon.”** The card is a Supporter. The supplied ZIP lists printing `xy11-104` as Expanded legal. The game-long Altered Creation-GX damage and extra-Prize benefit is the effect of an attack applied to its own player; Ranger removes both, as corroborated by [a substantive Expanded ADP analysis on PokéBeach](https://www.pokebeach.com/2021/01/adp-in-expanded) explicitly treating Ranger as removing Altered Creation's effects. This interaction does **not** refund the already spent one-per-game GX attack.
- Importantly, the opponent's Ranger must be **legally played after** Altered Creation GX resolves, and its removal must be captured in the current source game state. A Ranger already in the deck is not a guaranteed response: it can be Prized, not drawn, unavailable under Supporter lock, or inferior to an immediate knockout/other Supporter. Reject any source replay that simply grants or selects it without legal owner-visible retrieval and a competent opportunity-cost decision.

## Exact printed Aichi opponent source evidence

The shared [29 authenticated original full sixty rosters](full-decklists.json) were independently enumerated by an executable [source-printed exact census SFT](../../tests/agent30-aichi-adp-ranger-temple-source-exposure.test.cjs). **All five confirmed Ranger copies are *one each* of English Steam Siege 104**, with printed source placements:

| Original rank | Printed original player | Archetype | Ranger | VS Seeker | Tapu Lele-GX |
| ---: | --- | --- | ---: | ---: | ---: |
| **4** | Shu Hosoda | Raichu/Electrode Combo | 1 | 0 | 1 |
| **5** | Yamato Nakano | Mew/Genesect | 1 | 2 | 0 |
| **7** | Hiroto Fuji | Snorlax Stall | 1 | 3 | 0 |
| **18** | Hayato Omuro | Regidrago | 1 | 2 | 2 |
| **32** | Kaito Higuchi | Regidrago | 1 | 2 | 1 |

That is **five known Ranger-containing original opponents among the 29 authenticated source 60s**. The three missing source 60s, **23 Yuki Ueno, 25 Kazuki Kumegawa, 28 Jo Kato**, cannot be classified from this roster, so do not call five the complete Top32 population frequency. The existence of VS Seeker in four Ranger decks materially changes theoretical recoverability; it **does not guarantee** a real Ranger turn. Some lists also have Lele for Supporter search, itself subject to actual Basic Ability/Item locks and timing.

### Other paper Energy-source counters in the authenticated field

The same test scanned original lists for exact card names that can impair one DDE's colored/multi-Energy value or attachments when properly used:

| Printed threat | Original ranks with at least one |
| --- | --- |
| Temple of Sinnoh | 3, 8, 11, 16, 22 |
| Enhanced Hammer | 3, 5, 6, 7, 22, 24, 29 |
| Plumeria | 2, 3, 6, 7, 9, 16, 24, 29 |
| Team Flare Grunt | 3, 6, 7, 24, 29 |
| Faba | 2, 3, 6, 7, 10, 24, 29 |

Taking the union of those five threat names plus Ranger produces **16 authenticated ranks of 29**: `2,3,4,5,6,7,8,9,10,11,16,18,22,24,29,32`. This union is **only a printed-list exposure screen**; some effects remove Special Energy but compete for the Supporter, some Stadiums need to be active at exact attachment/attack timing, and Pokémon Ranger specifically erases the GX effect. They must not be counted as 16 match losses or 16 independently solved DDE interactions. Other attack-based Energy denial and unlisted counters also exist, so it is not exhaustive.

## Precommitted Ranger falsifier and why it matters for candidate selection

The source's positive game policy test must expose the candidate's actual already-resolved enhanced Altered Creation-GX effect, the source owner's hand/Prizes/searchable cards, and a **single legally payable Supporter turn** to play Ranger. Then test a real owner-selected Ranger with game-state transition and, on the candidate's next paid attack, verify **both +30 damage and the additional Prize bonus are gone**. The GX-use marker remains expended, and Thorton has not restored the GX attack option. This tests an effect erasure, not merely whether the opponent has Ranger text in its 60.

A high-value, naturally sourced first responder would be original **rank5 Mew/Genesect**, with one printed Ranger and two VS Seeker, or original **rank18 Regidrago**, with one Ranger, two VS Seeker and two Tapu Lele-GX. Both are mechanistically different from rank6's DDE-removal and rank8's Temple chokepoint. The source rank4 Raichu, rank7 Snorlax and rank32 Regidrago are additional required original matches in any eventual 32-opponent evaluation. Avoid scripted hand placement or forced Ranger draws; source must actually select Ranger over its other opponent-optimal Supporter when it can.

**Decision:** This is an **original-source-mechanism-specific falsifier** of the claim that enhanced ADP GX automatically guarantees permanent extra Prize leverage. It does not reject the entire ADP v2 sixty or show that source Ranger decks win, because ADP may take a fallback line or opponent's Ranger may never be relevant. It is substantial **new negative evidence** against promoting an attack-effect-dependent 99.5% universal deck without competent original-source play. All performance statuses remain **29/32 authenticated original sixties, 0 competitively qualified games, no strongest fixed 60 selected**.

## Reproducibility

[Standalone CommonJS original-source census SFT](../../tests/agent30-aichi-adp-ranger-temple-source-exposure.test.cjs) loads `full-decklists.json` unchanged, asserts 29 distinct complete 60-card decks, preserves ranks23/25/28 as missing, checks Ranger one-copy exact English printing `STS 104` in ranks4/5/7/18/32, and checks each five Energy-denial source-name rank set and the 16-rank union. Executed in fresh V8 against fetched original public roster; **all assertions passed**. This audit does not require or fabricate a native game engine result, access to a paid decklist, or a new candidate 60.
