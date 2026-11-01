# Agent 36: postlock Arven–Stealthy Hood–Horror House-GX versus rank15

**1 November 2026. Rules-backed proposed ALS, not a demonstrated game victory.**

The authenticated rank15 Ryotaro Nozawa Lopunny Vileplume 60 in `results/aichi-2026/full-decklists.json` has 2 Vileplume AOR 3 (Bench-active Item lock) and 1 Vileplume BUS 6 (Active-only Basic attack lock). The same 60 has two Stealthy Hood, two Guzma, four Tag Call, two TM: Evolution and two Jet Energy. It lists **zero Field Blower, Faba, Tool Scrapper or Tool Jammer**; other ways of answering a protected attacker may still exist.

**Official rules evidence:** Japanese Pokémon Card Game FAQ explicitly answers yes when asked whether a Basic Pokémon equipped with Stealthy Hood can attack against an opponent's Active BUS Vileplume using Disgusting Pollen (`にがにがかふん` and `隠密フード`): https://www.pokemon-card.com/rules/faq/search.php?freeword=%E9%9A%A0%E5%AF%86%E3%83%95%E3%83%BC%E3%83%89&page=2&regulation=all . Card: https://limitlesstcg.com/cards/bus/6 .

Arven is a **Supporter** that searches an Item and a Pokémon Tool: https://asia.pokemon-card.com/sg/card-search/detail/5736/ . Advanced Player's Rulebook v3.4 B-02 expressly treats older Tools as Tools despite former `Item` headers, and H. Deck allows choosing fewer targets in typed deck searches. Hence even while AOR prevents playing Items, **Arven can search Hood and the player may attach Hood** to a Basic Pokémon. AOR's Item restriction remains in force because it applies to the player.

Provisional New Moon Lockbreaker already carries one Basic Gengar & Mimikyu-GX TEU 53. Its own printed Horror House-GX costs **one Psychic Energy**, preventing the opponent from playing cards from hand on their next turn. Poltergeist costs **two Psychic Energy**, doing 50 per Trainer card in the opponent's hand. Three Trainers would reach either Vileplume's printed HP (AOR 130, BUS 140) absent other modifiers. Card text: https://www.pokebeach.com/2019/01/team-up-english-set-list .

**Potential timing:** candidate going first establishes Active Gengar during setup, attaches Psychic when available; source going second establishes AOR on Bench and BUS Active; on candidate T2, held Arven can fetch Hood even after Item lock, equip the Active Gengar, and permit an actual Horror House-GX attack. Subsequent Poltergeist needs a second Psychic, another turn and sufficient opponent Trainer cards.

Costs/caveats: Hood occupies Gengar's Tool slot, excluding Powerglass; Arven consumes the turn's Supporter; Horror House spends the once-per-game GX; Gengar is a three-Prize TAG TEAM; opponent's setup and attack response can still defeat the plan. The source may use tools and gust, and Path to the Peak can suppress Mewtwo's Perfection. This is a precise hypothesis for native, owner-information-safe tests, not proof of successful escape.

## Exact narrow two-turn direct-opening model

The BigInt enumerator `scripts/agent36-rank15-hood-horror-direct-model.cjs` counts opening-seven hands, one ordinary candidate T2 draw and every six-Prize placement. `tests/agent36-rank15-hood-horror-direct-model.test.cjs` asserts its exact count and underlying proxy-card counts. An independent Python binomial-coefficient enumerator reproduced the values.

The provisional New Moon source 60 has **17 starting-eligible Basics**, including exactly one Gengar & Mimikyu-GX, plus six Psychic-providing Energy (three Basic Psychic, three Telepathic). Abstract `h` Hood and `a` Arven copies replace `h+a` unspecified other cards; this model does not specify a legal modified 60.

An event requires Gengar in the **initial seven**, chosen Active during setup; one Psychic-providing Energy in that seven or candidate T2 ordinary draw; and either a Hood directly held by T2, or Arven held by T2 with a Hood still searchable in the post-Prize deck. Candidate goes first; source goes second and establishes both locks. Model conditions on a legal initial seven, no extra draws, no Item searches. Arven is playable after AOR Item lock.

| Hood / Arven copies | Gengar with Energy | Held Hood route | Arven to deck-Hood | Joint |
| --- | ---: | ---: | ---: | ---: |
| 1 / 1 | 6.97744455% | 0.75058472% | 0.60331203% | **1.35389675%** |
| 2 / 1 | 6.97744455% | 1.43258962% | 0.61153933% | **2.04412895%** |
| **2 / 2** | **6.97744455%** | **1.43258962%** | **1.16509337%** | **2.59768300%** |
| 3 / 2 | 6.97744455% | 2.05112596% | 1.06470181% | **3.11582778%** |

For two Hood and two Arven, the exact favorable count is `9,921,798,248,729,500` among `381,947,999,887,177,360` equally weighted, legal-opening-conditioned hand/draw/Prize-equivalent deals: **2.5976829965493404%**. Initial seven validity is `1 - C(43,7)/C(60,7) = 91.65625670%`. The calculation integrates two-Hood multi-Prize collapse; no early Item search is assumed, so it cannot silently play Fog Crystal after AOR is active.

This is an optimistic *resource condition*, with no guarantee Gengar remains Active, survives, may declare GX, or wins. It omits secondary searches, opponent mulligan bonus draws, other draw sources, attacks, opponent hand composition and the second Energy needed for Poltergeist. Source viability and field performance remain unknown. The abstract four-slot 2/2 variant does not identify which original cards to cut.
