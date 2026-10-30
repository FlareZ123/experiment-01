# Agent 3: Jellicent ex first-turn player lock against the Aichi field

**30 October 2026.** Evidence type: new paper-card interaction hypothesis; exact combinatorial opening calculation; descriptive census of original source-card inventories. The opening calculations were independently reproduced in Python and in a BigInt CommonJS enumerator, whose four pure test groups passed locally. This report adds no simulated or competitive game and does not nominate a finished fixed 60.

## Strategic hypothesis and printed line

The 2025 White Flare Psychic **Frillish WHT 44** evolves into **Jellicent ex WHT 45**. Jellicent ex's continuous **Oceanic Curse** says that while it is Active, the opponent cannot play Item cards or Pokémon Tool cards from hand. The Sword & Shield Evolving Skies Item **Boost Shake EVS 142** lets its player evolve even on the player's first turn or on a freshly played Basic, then ends that turn. Accordingly, one possible going-first line is:

1. Choose Frillish as the opening Active Basic.
2. If protection is available and appropriate, attach Stealthy Hood to that Frillish.
3. Use a held Boost Shake to fetch a Jellicent ex from the remaining deck and evolve the Active Frillish.
4. End the turn through Boost Shake's own effect. Oceanic Curse is now continuously active if no contrary Ability suppression applies.

This is a potentially high-leverage first-player action because ordinary first-player attacks and Supporter plays are restricted while the Item evolution exception is printed. Oceanic Curse is an Ability that restricts the **opposing player**, so its applicability is different from an attack effect attached to an individual opposing Pokémon. The line requires an **Active** Frillish. Boost Shake on a Benched Frillish leaves Jellicent inactive and does not activate this lock.

Jellicent's ex Rule Box is an important counterdependency. **Iron Thorns ex's Active Initialization** removes non-Future Rule Box Pokémon Abilities, and **Tool-equipped Garbodor's Garbotoxin** can shut off the setup's continuous Ability. Stealthy Hood protects its attached Pokémon from effects of an opponent's Abilities and is a plausible countermeasure; its exact live paper interaction with each lock and a later Jamming Tower remains a separate required ruling and native-state test. A Supporter such as Guzma can also relocate Jellicent, removing the Active requirement, and normal Energy, Stadium, Supporter and previously established boards remain available to the opponent. The deck must find a credible knockout or Prize plan under a 25-minute paper-event clock.

**Source wording:** supplied English card corpus entries `rsv10pt5-44`, `rsv10pt5-45`, `swsh7-142`, `sm10-186`, `sv6-77`, and `xy9-57`; Advanced Player's Rulebook sections I-A-05, I-B-01, I-B-02, II-C-12 and II-C-19. Official English Jellicent feature: https://www.pokemon.com/us/pokemon-news/hilda-emboar-volcarona-and-more-from-scarlet-violet-black-bolt-and-white-flare . This combo has prior public discussion outside this repository; the contribution is its Aichi-specific evidence and hard-matchup calculation.

## Exact first-turn direct-access bound

The [BigInt enumerator](../../scripts/agent3-jellicent-lock-opener.cjs) exhausts the hypergeometric opening seven, six uniform Prizes and one normal first-turn draw for a shuffled 60. It requires at least one Frillish in the opening seven, at least one Boost Shake in the opening seven or following ordinary draw, and at least one Jellicent ex remaining **searchable in deck after the draw and Prizes**. A Jellicent drawn into hand is not a valid Boost Shake search target. The model does not credit extra draw, search, mulligan bonus cards, Energy, opponent play, a different opening Basic requiring mobility, or Prize recovery.

Every row fixes **four Frillish and four Boost Shake**. The conditional column assumes **12 total Basic Pokémon** and reconditions the initial seven on a valid Basic opening. Other cards fill the remaining slots.

| Jellicent ex copies | Raw opening event, before mulligan conditioning | Among Basic-valid seven-card openings |
| ---: | ---: | ---: |
| 1 | 12.983384% | 16.041677% |
| 2 | 15.773475% | 19.488985% |
| 3 | 16.333298% | 20.180678% |
| 4 | **16.437347%** | **20.309235%** |

The single-Jellicent line is particularly vulnerable to being drawn or Prized, while third/fourth Jellicent copies give sharply diminishing increments in this restricted direct-access metric. Any actual list's effective access must be recalculated with its own realistic search and draw policies.

The following separate count requires **Stealthy Hood also in the first eight**, allowing it to be attached before Boost Shake. Four Jellicent are fixed, with a variable Hood count; no search, draw, or reuse is credited. These are joint direct-setup events, **not measured counter-lock success**.

| Hood copies | Raw Frillish + Boost Shake + searchable Jellicent + Hood | Conditional on a valid initial seven with 12 Basics |
| ---: | ---: | ---: |
| 1 | 1.779776% | 2.199010% |
| 2 | 3.395899% | 4.195817% |
| 3 | 4.860641% | 6.005586% |
| 4 | **6.185571%** | **7.642610%** |

Consequently, an opening Hood-protected Jellicent answer to a starting Iron Thorns/Garbodor is far less directly accessible than the unprotected first-turn lock. This quantifies the search-engine burden of a proposed anti-lock solution before testing the Tool-versus-Ability interaction itself.

Combinatorial implementation: condition on each possible first-seven composition of Frillish, Shake, Jellicent, Hood and other cards, each possible following draw, then count the Prize allocations in which at least one Jellicent remains. Integer outcome counts and exact denominators use `BigInt`, with decimal conversion only for presentation. See [reproducible tests](../../tests/agent3-jellicent-lock-opener.test.cjs). The independent Python enumeration gave the matching values to more than ten decimal places.

## Aichi original-source inventory exposed by Oceanic Curse

A [second reusable census](../../scripts/agent3-jellicent-field-exposure.cjs) classifies printed Trainer names across the 29 published original 60s using the supplied 176 English card-set files, explicit Japanese-only aliases and the modern Tool classification for historical Item-era prints. It requires every printed Trainer name to classify or throws; [tests](../../tests/agent3-jellicent-field-exposure.test.cjs) cover Japanese-only items, historical Tools and the 29-original-list totals. The immutable source manifest is `results/aichi-2026/full-decklists.json`, Git blob SHA **ae773f6201d7aa69d31914dbfee66f3fba692200**.

Across the complete **29 published opposing lists**, **566 Item slots plus 91 Pokémon Tool slots = 657 slots** fall into Oceanic Curse's printed prohibited categories, an average of **22.655172 cards per 60**. This is static source-inventory exposure, not prevented plays, probability of holding one, locked turns, or win rate. Some source Tools are already attached before the lock. Source Supporters, Stadiums, normal Energy attachments and attacks remain usable.

| Exact published Aichi rank | Source archetype | Items | Tools | Printed slots in blocked classes |
| ---: | --- | ---: | ---: | ---: |
| 1 | Shadow Rider Calyrex | 17 | 2 | 19 |
| 2 | Vileplume Control | 4 | 6 | **10** |
| 5 | Mew Genesect | 26 | 5 | **31** |
| 6 | Iron Thorns | 20 | 3 | 23 |
| 8 | Absol Garbodor | 25 | 6 | **31** |
| 10 | Regidrago | 16 | 2 | 18 |
| 11 | Absol Garbodor | 21 | 6 | 27 |
| 15 | Lopunny Vileplume | 9 | 6 | **15** |
| 17 | Raichu Electrode Combo | 23 | 2 | 25 |
| 24 | Iron Thorns | 17 | 3 | 20 |
| 26 | Meloetta Donk | 35 | 4 | **39** |
| 29 | Iron Thorns | 18 | 4 | 22 |
| 31 | Dusknoir Chimecho | 27 | 0 | 27 |

The smallest observed static exposure is rank 2 at 10 slots, where Vileplume already introduces Item-lock dynamics and the ordinary first-turn Jellicent strategy may be strategically redundant. The largest is rank 26 at 39 slots, with a separate critical **first-to-act** condition because the Meloetta Donk source can threaten on its own first attack. Rank 6's 23 blocked slots alone conceal an adversarial Active Ability counter; the inventory statistic cannot be read independently of the opposing board. A representative rank-10 Regidrago has 18 such slots yet retains an attack-based response once powered.

## A second access channel: going-second Arven searches the Item and Tool together

After the first version of this report, a new exact six-type enumeration found a potentially larger protected setup route. **Arven** is a Supporter that searches an Item card and a Pokémon Tool in one play. On the player's first turn **going second**, held Arven can therefore find Boost Shake and Stealthy Hood together, equip Hood on Active Frillish, and then execute Boost Shake while Jellicent ex remains searchable. Pieces already held need no second search. This works only while Supporter and Item actions are legal; a prior opponent-turn Budew Item lock, Stoutland Supporter lock, or an existing Ability-lock counter can disrupt the plan. Ordinary going-first first-turn Arven is prohibited.

The new `exactArvenProtectedLock` export in [the same mathematical evaluator](../../scripts/agent3-jellicent-lock-opener.cjs) models Frillish, Boost Shake, Jellicent, Hood, Arven, and other cards as six disjoint print classes. It enumerates seven-hand compositions and the following ordinary draw, then uses inclusion-exclusion over all six Prizes to ensure **Jellicent remains in deck** and **every needed search target is either in hand or remains in deck**. The model permits the direct Hood+Shake route when Arven is absent. Four Frillish, four Boost Shake, four Jellicent, four Hood and **12 total Basics** are fixed:

| Arven copies | Raw going-second direct-or-Arven protected lock | Among Basic-valid opening sevens |
| ---: | ---: | ---: |
| 0 | 6.185571% | 7.642610% |
| 1 | 10.431290% | 12.888426% |
| 2 | 14.211765% | 17.559408% |
| 3 | 17.570078% | 21.708787% |
| 4 | **20.546080%** | **25.385798%** |

At four Arven, the protected route's restricted valid-opening access rises **17.743188 percentage points** above the no-Arven route, a little over **3.32 times** the direct-only probability. This is a card-access result under the model's exclusions, **not a guarantee of lock or advantage after the opponent has already taken a turn**. Source-deck Item lock, Ability lock and action sequencing remain untested in the live bilateral Store. The independent Python inclusion-exclusion calculation matches all five BigInt results; [the expanded regression](../../tests/agent3-jellicent-lock-opener.test.cjs) passed locally.

The more important next test is therefore a turn-order pair: **first-player** immediate unprotected lock versus **second-player** Arven-protected lock after realistic rank-6 or rank-11 source action. The second line could overcome certain Ability-lock states while sacrificing first-actor tempo. Evaluate a printed Supporter counter and an actual Item/Tool rejection for each after genuine native settlement. Avoid a static opening-only claim of superiority across both seats.

## First-player Supporter exception: Carmine redraw cannot replicate Arven's two-channel search

A separate, fully exact first-player model evaluates **Carmine** (`sv6-145`), whose text allows it to be played on the first player's first turn. Carmine discards the entire remaining hand and draws five. A held Hood may be attached to Active Frillish *before* Carmine; any held Boost Shake is lost with the hand, so the succeeding Boost Shake must come from the new five. If neither Hood nor Shake was available initially, the new five must supply both. The evolving Jellicent must remain in deck after the new draw and all Prizes.

The new `exactCarmineProtectedLock` in [the shared BigInt evaluator](../../scripts/agent3-jellicent-lock-opener.cjs) counts those branches over the opening seven, one ordinary draw, six Prizes and Carmine's five-card redraw. It samples the five redraw cards before the six Prizes in the enumeration, an exchangeable ordering of two disjoint random subsets that leaves the joint outcome counts unchanged. The independent Python exhaustive enumeration produced the same five values.

Four Frillish, four Boost Shake, four Jellicent, four Hood and **12 total Basics** are fixed. No further draw/search is credited:

| Carmine copies | Raw direct-or-Carmine protected-lock event | Among Basic-valid opening sevens |
| ---: | ---: | ---: |
| 0 | 6.185571% | 7.642610% |
| 1 | 6.865327% | 8.482484% |
| 2 | 7.473111% | 9.233434% |
| 3 | 8.015304% | 9.903344% |
| 4 | **8.497836%** | **10.499538%** |

Four Carmine add only **2.856928 percentage points** of direct protected-lock opportunity among valid Basic openings versus the no-Carmine first-player branch. They consume four fixed slots and discard secondary resources in successful and unsuccessful lines. For the candidate-second Arven route, four Arven instead add **17.743188 percentage points**, while conceding the opponent's first turn. Carmine remains relevant for other kinds of first-turn draw/dump plans, so these results are restricted to this protected Jellicent target.

This explains why assuming a generic first-turn draw Supporter can substitute for a multi-channel search Supporter is misleading. Search for an Item *and* Tool preserves the existing hand and finds the exact pair; Carmine destroys held Boost Shake and may strand or discard Jellicent as a Boost Shake target. Neither combinatorial result establishes match strength or qualifies the live opponent response.

## Structural counterexample: Iron Thorns has a pre-Boost Tool and a post-lock Supporter escape

A targeted reading of the actual rank **6, 24 and 29** original Iron Thorns sixties reveals a tighter adversarial obstacle than generic Ability lock. **Every one of the three** plays exactly four Iron Thorns ex as its only Basic Pokémon, **one Tool Jammer**, **one Faba**, and **two or three Guzma**. They are three separately printed original lists, so this is a direct source-roster observation with no imitation source decks.

**Source-first Tool Jammer line.** Tool Jammer (`swsh5-136`) says that while its equipped Pokémon is Active, Pokémon Tools on the opponent's Active Pokémon have no effect, except Tool Jammer itself. If the source opens Active Iron Thorns and equips Tool Jammer during its first turn, the candidate's second-player Arven may still fetch Hood plus Boost Shake, and Boost Shake may still evolve Frillish, yet **Hood is suppressed by the pre-existing Active Tool Jammer**. Iron Thorns's Initialization can then suppress Oceanic Curse. The exact direct availability of the one Tool Jammer in the source's opening seven or ordinary first turn draw, **conditioned on a valid seven containing one of its four Basics**, is **12.104358%** (hypergeometric calculation independent of player policy or further Item searches). This is a raw owner-hand opportunity for a possible Tool attachment, and it may be increased by owner-search Items. It does not establish that a competent source always equips Jammer when available.

This creates a connector-contention problem for the second-player Arven line: a candidate may have to use **Field Blower first** to discard source Tool Jammer, then attach Hood and use Boost Shake. If both Field Blower and Boost Shake must be searched from the deck, the single Arven Item slot cannot obtain both. Arven's Tool slot can still obtain Hood. At least one Item needs direct hand access or a separate supported connector. A naive graph that scores Arven as full protected-lock access misses this opposing Tool and double-Item contention.

**Candidate-first Faba reply.** In the reverse turn order, the candidate's first-player Hood-protected Jellicent may prevent the Iron Thorns opponent from attaching Tool Jammer from hand. However, **Faba** (`sm8-173`) is a Supporter that can put the attached Hood into the Lost Zone. A second-player Iron Thorns source may play Faba while under Item/Tool lock, removing Hood and reactivating Initialization, which then removes Oceanic Curse and reopens Items/Tools. The single Faba has **12.104358%** direct opening-seven-plus-draw visibility in each four-Basic Iron Thorns list, conditional on a valid initial seven, before extra search and other draws. This is another possible typed action sequence, contingent on Faba's actual availability, legality and the rule interaction of Hood with Initialization.

**Other unblocked opponent classes.** The [source escape census](../../scripts/agent3-jellicent-field-exposure.cjs) found **48 Guzma copies in 25/29 source lists**, **8 Faba copies in 7/29**, and **8 Path to the Peak copies in 7/29**. Guzma can move Active Jellicent off its required position when the necessary Benches exist. Path to the Peak is a Stadium, usable through Oceanic Curse and capable of suppressing Jellicent's Rule Box Ability regardless of its Hood (Hood protects against opponent Abilities, not Stadium effects). No published source sixty contains Jamming Tower; it remains a theoretical/other-metagame counter. Opposing Field Blower is itself blocked as an Item while Oceanic Curse remains active, so treating every printed removal effect as an immediate escape would be incorrect.

**Decision refinement:** Native tests should expose **source Tool Jammer attachment before the candidate's Arven**, **candidate Field Blower plus Boost Shake contention**, **source Faba after candidate-first protected lock**, and **source Guzma or Path response**. Assert the actual position, Tool attachment and Item/Supporter quota state at each actor root. The special value of protected Jellicent is constrained by the exact printed opposing 60s and turn order; static 657-card exposure alone cannot rank a new fixed deck.

## Discriminating next actions and research verdict

The shortest constructive next test is a **four-cell original-Store state matrix**: Active Frillish + Boost Shake against neutral opposition; against Active Iron Thorns; against Active Iron Thorns with Hood already on Frillish; and against Tool-equipped Garbodor with/without Hood. Assert genuine native evolution, turn-ending, Oceanic Curse effect on the *opposing player*, accepted or rejected Item/Tool play, and unchanged Supporter/Stadium action permission. Include adversarial Jamming Tower and Guzma responses. This experiment can use Agent 41's existing bilateral runner and actor chooser instead of a competing full-game policy.

To become a viable fixed-60 candidate, the package must also demonstrate a genuinely advantageous attack/Prize trajectory and get its protected first-turn line far beyond the **7.642610% direct opportunity among valid openings** calculated here. Extra search may help but consumes connectors, hand resources and Bench space. A weaker rank-6/rank-11 counter policy can reverse any apparent advantage of the lock, so a qualified adversarial two-player witness is mandatory.

**Decision:** retain this as a serious new Aichi-specific structural candidate worth an explicit short falsification test, especially because it can remove both Item and Tool actions before the opponent's first turn. Do not promote it as the best 60, equate the 657 printed cards with actual prevented actions, or claim game win evidence. Ranks **23, 25 and 28** still lack their exact published sixties; **zero competitively qualified games** exist and the 99.5% objective remains unproven.
