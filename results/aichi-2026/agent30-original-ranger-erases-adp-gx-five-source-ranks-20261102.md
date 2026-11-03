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


## First owner-legal Ranger reply: exact early direct draw probability

To measure a real opponent **turn after** the candidate's going-second T1 ADP GX, the opponent must have taken the **first turn going first**. Under the ordinary setup they see seven initial cards, draw once on their first turn and once on their second turn. Ranger is **one non-Basic card** in their original fixed 60, so a physically drawn Ranger in these **nine** cards has already arrived by the natural owner turn-two reply window, provided the player preserved it. Prior to that window it may have been shuffled into the deck, discarded, or removed in some real state; the screen does not model such actions.

The supplied English card ZIP was independently used to resolve actual Basic subtypes of all five complete original Ranger decklists, with **Basic counts 13, 11, 12, 16, 13** at ranks 4, 5, 7, 18, 32. The reproducible [source SFT](../../tests/agent30-aichi-adp-ranger-temple-source-exposure.test.cjs) now asserts those exact original-print counts and computes the direct Ranger-in-first-nine conditional probabilities.

| Source original rank | Printed Basic count | Ranger in natural first nine, conditional Basic-valid first seven |
| ---: | ---: | ---: |
| 4 Raichu/Electrode | 13 | **14.395978890%** |
| 5 Mew/Genesect | 11 | **14.279109467%** |
| 7 Snorlax Stall | 12 | **14.338892271%** |
| 18 Regidrago | 16 | **14.550320646%** |
| 32 Regidrago | 13 | **14.395978890%** |

**Exact derivation.** For a 60 containing `B` Basic Pokémon and one non-Basic Ranger, condition on opening seven having at least one Basic:

`P(valid) = 1 - C(60-B,7)/C(60,7)`.

The chance that Ranger is in one of the **first seven** and the remaining six include a Basic is `7/60 × [1 - C(59-B,6)/C(59,6)]`. The chance Ranger is the **eighth or ninth** card and the original first seven include a Basic is `2/60 × [1 - C(59-B,7)/C(59,7)]`. Sum those mutually exclusive numerators and divide by `P(valid)`. The rank-specific values were calculated independently with Python and asserted in a fresh V8 execution against the authentic 29-original roster. This exact check correctly preserves the live-card premise that the source must have a playable Basic in its opening seven; it **does not** substitute an arbitrary hand for the source.

The early **direct-draw** chance is thus roughly **14.28–14.55%** across the five sources. This is neither an actual Ranger-play rate nor the maximum plausible retrieval rate. VS Seeker, Tapu Lele, deck search, opponent mulligan bonus draws, Ranger Prize risk, earlier actions and Supporter competition alter actual play. It is a useful bounded *natural opening opportunity* to add to a native two-seat source-policy audit. A source's seven-card Basic-valid Ranger distribution must not be compared to the candidate's independently conditioned ADP opening setup without modeling both players' correlated mulligan redraw opportunities and card/turn order.


## Proactive anti-ADP Archetype-Line-Specifics: Ranger can be fetched *before* Altered Creation-GX

The original rosters provide a stronger **source-owned counter sequence** than merely waiting to draw the singleton Ranger. If the opponent goes first and sees the candidate's opening ADP, original ranks **4, 18 and 32** can play a Basic-search Item on their first turn to **fetch Tapu Lele-GX**, place Lele from hand onto a free Bench slot, activate **Wonder Tag to search Pokémon Ranger from the deck**, and preserve Ranger for their **second personal turn**, immediately after ADP's going-second first-turn enhanced Altered Creation-GX. Going-first first-turn Supporter prohibition does **not** prevent Lele searching a Supporter or holding it for the following turn. Opponent rank5 can also potentially draw Ranger via Genesect V's Fusion Strike System (subject to source Ability-state and board/hand), although it has no Lele printed.

The exact printed source counts from the authenticated original 60s, confirmed in the same source census, are:

| Original rank | Tapu Lele-GX | Quick Ball | Mysterious Treasure | Implication |
| ---: | ---: | ---: | ---: | --- |
| **4 Raichu/Electrode** | 1 | 4 | 0 | Quick Ball can retrieve Lele; Wonder Tag may preload singleton Ranger |
| **18 Regidrago** | 2 | 3 | 4 | Either Basic-search Item can reach Lele; abundant but still physically costed connector choices |
| **32 Regidrago** | 1 | 4 | 3 | Either Basic-search Item can reach Lele; must preserve Bench and source hand |

Every Quick Ball / Mysterious Treasure use has a **real one-card discard cost**, and Lele's Wonder Tag is a Basic Pokémon Ability that requires a free Bench slot and a legally operating Ability at the exact moment Lele enters play. Ranger must **not already be in Prizes**; if it is in the initial hand, search is unnecessary. The opposing ADP v2's defining GX is an attack and is **not itself an Ability lock**, so it does not automatically suppress this source first-turn Lele line. A current source board could still have other Ability-locking effects or lose its Bench slot, and attacking/source priorities may favor an alternate use of those Items or Lele. The anti-GX interaction becomes available only **after the opponent actually plays Ranger on its second turn**.

This is a specific matchup-dependent **counter-ALS**, especially at authentic rank18 (2 Lele, 7 Lele-search Items). A source replay must test original owner knowledge, physical Item discard payments, first-turn Wonder Tag search and choice to preserve Ranger, then second-turn legal Supporter use and GX-effect erasure. A literal card-count graph that assumes all these links are free would overstate the counter. Conversely, a source policy that never considers searching Ranger before the ADP GX would underplay these authenticated opponents and misrepresent ADP's actual competitive exposure.


## Stronger, physically staged original owner first-turn Ranger **prefetch** screen

The source card chain is important enough to quantify exactly, beyond the direct 14%-ish natural two-draw Ranger baseline. Suppose **original rank4, 18 or32 goes first**, the ADP candidate will go second and may use Altered Creation-GX on its first own turn. The source knows the prospective opposing ADP board already when it takes its first turn.

We now construct a concrete **no-extra-draw first-own-turn source Ranger preservation opportunity** with only the initial seven and source first-turn one-card draw. Require an original **non-Tapu-Lele Basic** in the *actual initial seven*, selected as source Active; this preserves Lele for a Bench Wonder Tag. Then take a disjoint priority among three pathways:

1. **Ranger held**: Ranger is among the first eight (seven initial plus T1 draw), so the source can preserve it for its second personal turn, after ADP GX.
2. **Lele held**: Ranger is absent from first eight, but a Tapu Lele-GX is present; the source Benches it during T1 and uses its printed Wonder Tag to retrieve **unprized Ranger still in deck**. No source Supporter is played T1.
3. **Item→Lele**: Ranger and Lele are absent from first eight, but at least one **Quick Ball or Mysterious Treasure** is held. The source can discard one physical other card from the original hand, search an unprized Tapu Lele-GX, Bench it, trigger Wonder Tag, search the separately unprized Ranger and hold it until source's T2. Both searches require successful actual deck target locations; the first eight contains ample physical hand cards to pay one Item discard after selecting Active, but strategic DCI remains unresolved.

No source first-turn Supporter use is attempted. The source going first can play Items and use Lele's Basic Ability, assuming the card texts are unsuppressed, and the opponent's ADP has not yet taken a turn or imposed any attack effect. This is **a potential owner-playable access path**, rather than a played counter or an assertion that Ranger must be selected.

| Original authenticated 60 | Ranger directly held | Lele held, Ranger searched | Basic Item→Lele→Ranger | **Union, Basic-valid opener** |
| --- | ---: | ---: | ---: | ---: |
| **R4 Raichu/Electrode**: 13 Basic, Lele 1, Quick Ball 4 | 12.2388% | 9.6268% | 25.2755% | **47.141143%** |
| **R18 Regidrago**: 16 Basic, Lele 2, Quick Ball 3, Mysterious Treasure 4 | 12.2146% | 18.0970% | 36.3756% | **66.687249%** |
| **R32 Regidrago**: 13 Basic, Lele 1, Quick Ball 4, Mysterious Treasure 3 | 12.2388% | 9.6268% | 37.2936% | **59.159234%** |

All values condition on the **source** having a Basic-valid initial seven, then require selecting an **other-than-Lele** Basic as the initial Active. They omit the candidate's own deck setup rate, opponent mulligan draw bonuses, all extra source draw Ability usage, and any source turn-one cards played before selecting these routes. Consequently, the union measures neither actual Ranger-play frequency nor a source win rate. It does show that the printed source has a **substantial feasible first-turn preloading opportunity** for a counter that negates the flagship ADP permanent effect.

**Exact combinatorics.** For each rank, partition the authentic sixty into singleton Ranger, Lele copies `L`, Lele-search Items `Q`, non-Lele Basics `B-L`, and all other cards. Enumerate all first-eight multivariate-hypergeometric class counts and multiply by `7/8` when exactly one non-Lele Basic appears among eight, otherwise `1`. Ranger already held requires no Prize filter; Lele-held route requires Ranger in deck after Prizes, probability `46/52`. The Item→Lele route requires **both one Lele and the singleton Ranger outside six Prizes**, computed by inclusion-exclusion over 52 unseen cards. Divide the disjoint branch sum by the source Basic-valid-seven probability `1-C(60-B,7)/C(60,7)`. All source copy counts, branch exact values and starter-position requirements are asserted in the expanded [standalone original roster SFT](../../tests/agent30-aichi-adp-ranger-temple-source-exposure.test.cjs). The source Basic subtype counts were independently checked against original printed English card JSON, including Mega Evolution printings.

An independent **200,000 literal 60-card physical shuffles per rank** with actual source initial-seven, six Prizes, one T1 natural draw, deck-only Lele/Ranger checks and original-other-Basic initial Active gave observed **47.1021%** (rank4), **66.6961%** (rank18), **59.1218%** (rank32) among Basic-valid source opens. These agree with exact **47.1411% / 66.6872% / 59.1592%** at Monte Carlo precision. No actual turn is executed in a native simulator; source Item discards and choices remain a separate qualification requirement.

**Priority test request:** The most informative immediate anti-ADP source continuation is original **rank18 Regidrago**, whose printed two Lele and seven Psychic/Basic Item tutors give the strongest strict initial prefetch window of the three. In one original-source-owned first-turn native trace, physically pay a Mysterious Treasure or Quick Ball discard, search one unprized Lele, Bench, use Wonder Tag to search Ranger, and hold it. After the candidate's legal enhanced ADP GX T1 going second, source must decide whether to play Ranger on T2 rather than a competing Supporter. If selected, clear both lingering damage and extra-Prize effects, keep the GX marker spent, and continue with the source's own legally funded attack. Do **not** count an invented scripted preloaded Ranger hand, nor automatically select Ranger when another Supporter has higher immediate value.
