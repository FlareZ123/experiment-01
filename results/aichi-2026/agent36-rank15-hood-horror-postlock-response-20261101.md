# Agent 36: postlock Arven–Stealthy Hood–Horror House-GX versus rank15

**1 November 2026. Rules-backed proposed ALS, not a demonstrated game victory.**

The authenticated rank15 Ryotaro Nozawa Lopunny Vileplume 60 in `results/aichi-2026/full-decklists.json` has 2 Vileplume AOR 3 (Bench-active Item lock) and 1 Vileplume BUS 6 (Active-only Basic attack lock). The same 60 has two Stealthy Hood, two Guzma, four Tag Call, two TM: Evolution and two Jet Energy. It lists **zero Field Blower, Faba, Tool Scrapper or Tool Jammer**; other ways of answering a protected attacker may still exist.

**Official rules evidence:** Japanese Pokémon Card Game FAQ explicitly answers yes when asked whether a Basic Pokémon equipped with Stealthy Hood can attack against an opponent's Active BUS Vileplume using Disgusting Pollen (`にがにがかふん` and `隠密フード`): https://www.pokemon-card.com/rules/faq/search.php?freeword=%E9%9A%A0%E5%AF%86%E3%83%95%E3%83%BC%E3%83%89&page=2&regulation=all . Card: https://limitlesstcg.com/cards/bus/6 .

Arven is a **Supporter** that searches an Item and a Pokémon Tool: https://asia.pokemon-card.com/sg/card-search/detail/5736/ . Advanced Player's Rulebook v3.4 B-02 expressly treats older Tools as Tools despite former `Item` headers, and H. Deck allows choosing fewer targets in typed deck searches. Hence even while AOR prevents playing Items, **Arven can search Hood and the player may attach Hood** to a Basic Pokémon. AOR's Item restriction remains in force because it applies to the player.

Provisional New Moon Lockbreaker already carries one Basic Gengar & Mimikyu-GX TEU 53. Its own printed Horror House-GX costs **one Psychic Energy**, preventing the opponent from playing cards from hand on their next turn. Poltergeist costs **two Psychic Energy**, doing 50 per Trainer card in the opponent's hand. Three Trainers would reach either Vileplume's printed HP (AOR 130, BUS 140) absent other modifiers. Card text: https://www.pokebeach.com/2019/01/team-up-english-set-list .

**Potential timing:** candidate going first establishes Active Gengar during setup, attaches Psychic when available; source going second may establish AOR while BUS is still Benched; on candidate T2, held Arven can fetch Hood even after Item lock, equip the Active Gengar, and prepare for a possible Horror House-GX attack. Subsequent Poltergeist needs a second Psychic, another turn and sufficient opponent Trainer cards.

Costs/caveats: Hood occupies Gengar's Tool slot, excluding Powerglass; Arven consumes the turn's Supporter; Horror House spends the once-per-game GX; Gengar is a three-Prize TAG TEAM; opponent's setup and attack response can still defeat the plan. The source may use tools and gust, and Path to the Peak can suppress Mewtwo's Perfection. This is a precise hypothesis for native, owner-information-safe tests, not proof of successful escape.

## Exact narrow two-turn direct-opening model

The BigInt enumerator `scripts/agent36-rank15-hood-horror-direct-model.cjs` counts opening-seven hands, one ordinary candidate T2 draw and every six-Prize placement. `tests/agent36-rank15-hood-horror-direct-model.test.cjs` asserts its exact count and underlying proxy-card counts. An independent Python binomial-coefficient enumerator reproduced the values.

The provisional New Moon source 60 has **17 starting-eligible Basics**, including exactly one Gengar & Mimikyu-GX, plus six Psychic-providing Energy (three Basic Psychic, three Telepathic). Abstract `h` Hood and `a` Arven copies replace `h+a` unspecified other cards; this model does not specify a legal modified 60.

An event requires Gengar in the **initial seven**, chosen Active during setup; one Psychic-providing Energy in that seven or candidate T2 ordinary draw; and either a Hood directly held by T2, or Arven held by T2 with a Hood still searchable in the post-Prize deck. Candidate goes first; source goes second; AOR and Active BUS may be established on different turns. Model conditions on a legal initial seven, no extra draws, no Item searches. Arven is playable after AOR Item lock.

| Hood / Arven copies | Gengar with Energy | Held Hood route | Arven to deck-Hood | Joint |
| --- | ---: | ---: | ---: | ---: |
| 1 / 1 | 6.97744455% | 0.75058472% | 0.60331203% | **1.35389675%** |
| 2 / 1 | 6.97744455% | 1.43258962% | 0.61153933% | **2.04412895%** |
| **2 / 2** | **6.97744455%** | **1.43258962%** | **1.16509337%** | **2.59768300%** |
| 3 / 2 | 6.97744455% | 2.05112596% | 1.06470181% | **3.11582778%** |

For two Hood and two Arven, the exact favorable count is `9,921,798,248,729,500` among `381,947,999,887,177,360` equally weighted, legal-opening-conditioned hand/draw/Prize-equivalent deals: **2.5976829965493404%**. Initial seven validity is `1 - C(43,7)/C(60,7) = 91.65625670%`. The calculation integrates two-Hood multi-Prize collapse; no early Item search is assumed, so it cannot silently play Fog Crystal after AOR is active.

This is an optimistic *resource condition*, with no guarantee Gengar remains Active, survives, may declare GX, or wins. It omits secondary searches, opponent mulligan bonus draws, other draw sources, attacks, opponent hand composition and the second Energy needed for Poltergeist. Source viability and field performance remain unknown. The abstract four-slot 2/2 variant does not identify which original cards to cut.

## Improved chronological turn-one search model: 4.076% with 2/2

The direct-only 2.598% result above intentionally excludes the provisional deck's **four Fog Crystal and one Adventure Bag**. These Items may be used on candidate's first turn **before** a rank15 source going second could establish AOR, and their effects must remove searched physical cards from the deck **before** the candidate's next draw. I independently implemented that sequencing in `scripts/agent36-rank15-hood-horror-prelock-model.cjs`, with `tests/agent36-rank15-hood-horror-prelock-model.test.cjs`. The exact output agrees with an independent combinatorial Python enumeration.

Frozen search policy: start with Gengar Active (opening seven contains it); if no Hood held, play **opening-hand Adventure Bag** to take a searchable Hood; if no Psychic-providing Energy held, play **opening-hand Fog Crystal** to take a searchable Basic Psychic Energy; choose these targets only when physically available after the six Prizes. Remove 0, 1 or 2 searched cards, then draw one ordinary card from the correct residual 47/46/45-card deck. If still lacking Hood after the draw, play **Arven** only when it is held and a Hood remains in the deck. No Item use occurs after source AOR lock. No second use of a search card, no deck-state foreknowledge at K0, and no opponent mulligan bonus or other draw are assumed.

| Abstract Hood / Arven | Gengar + one Psychic ready | Direct or Bag Hood | Arven to remaining Hood | Joint resource event |
| --- | ---: | ---: | ---: | ---: |
| 1 / 1 | 9.22442268% | 1.71111156% | 0.74858532% | **2.45969688%** |
| 2 / 1 | 9.22442149% | 2.63983458% | 0.75541431% | **3.39524889%** |
| **2 / 2** | **9.22442149%** | **2.63983458%** | **1.43602750%** | **4.07586208%** |
| 3 / 2 | 9.22432790% | 3.41124877% | 1.30609981% | **4.71734859%** |

For two Hood plus two Arven, favorable scaled count `32,225,084,547,797,251,080` and denominator `790,632,359,766,457,135,200` give **4.075862080489108%** conditional on an accepted opening seven. The denominator uses a common 47×46×45 scale to account for distinct draw-deck sizes. All Prize configurations are integrated exactly; searches are time ordered with deck depletion. The narrow direct-only **2.5976829965493404%** remains independently valid under its stricter assumptions. The additional 1.478 percentage points quantify the specified prelock Item-search policy, rather than proving those lines are used optimally.

**Paper sequencing caveat:** source's complete development line and candidate-first initiative must actually coincide, Gengar must remain Active and alive, plus the intended GX must remain unused. Arven, Hood, Bag and Fog may compete with stronger whole-field resources or actions. The 4.08% figure is a category-level **resource-access opportunity**, with no simulated source reply or valid competitive outcome. A precise four-card cut list and registration of the unchanged 60 is required before this can be considered an actual deck comparison.

## Causal timing correction from actual rank15 source

The authenticated rank15 native Poffin/Double-Oddish fork in `results/aichi-2026/agent30-rank15-native-two-oddish-causal-result.md` demonstrates that the dual Stage2s can be produced by a real Bunnelby TM: Evolution line, but in the selected source game **BUS appeared on the Bench at global turn 18, became Active at turn 21, and AOR appeared at turn 32**, at which point BUS was Active. The source did not finish within the 260-root cap. These are retrospectively selected late-game witness states, not turn-one dual-lock frequency.

Thus the exact candidate T2 hand/Prize models above deliberately describe **preparation by the second candidate turn**, rather than a probability of facing or beating a *fully established* dual lock on T2. A Bunnelby taking the two TM attacks may finish that attack turn while still Active, with BUS remaining Benched until a later promotion. Our response can equip Hood prospectively during AOR lock and retain it for the later BUS position, or use Horror House-GX before that promotion to interfere with a hand-driven setup. Both plans need actual source-turn and candidate-turn replay to verify effect and timing. If the source already has BUS Active earlier by another sequence, that sequence itself must be supplied and witnessed. Nothing here asserts an immediate, turn-one Active BUS.

## Opponent reply: Jet/Powerful Mega Lopunny damages through Hood

The authenticated rank15 60 includes two Mega Lopunny ex PFL 84, one Powerful Colorless Energy DAA 176 and two Jet Energy PAL 190. Mega Lopunny's Gale Thrust deals 230 when it moved from Bench to Active this turn. Powerful Colorless attached to this Colorless attacker increases the attack to **250**, enough to knock out the 240 HP Gengar & Mimikyu-GX and award three Prizes. Jet Energy attached from hand to the Benched Mega Lopunny can supply the promotion condition; Powerful generally has to be attached beforehand. Hood blocks opponent Ability effects on its wearer, not attack damage. Source printings: https://limitlesstcg.com/cards/PFL/84 ; https://limitlesstcg.com/cards/DAA/176 ; https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/sv-series/sv02/190 . This is a **conditional printed-card reply**, not an observed source game line; its actual Energy, turns, Prize, Bench, retreat, and opponent policy must be witnessed before assuming it is viable.
