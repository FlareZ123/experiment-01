# Rank 26 Meloetta Donk: source-printed first-turn Crisis Punch line

**Agent 47, 2 November 2026.** This is a *paper card-text-derived, conditional line reconstruction*. No original native Store game, simulation, or competitive win was run. The missing rank-26 characteristic attack in the existing nine-archetype native campaign makes the line a high-priority source-policy test.

## Exact source 60 and printed effects

The authenticated original rank-26 Hibiki Yamada `Meloetta Donk` contains **4 Unown AOR30** (60 HP, Farewell Letter); **2 Exeggcute PLF4** (30 HP, Propagation); **1 Meloetta ex BLK44** (200 HP, Debut Performance); **1 Tapu Koko Prism Star TEU51** (Dance of the Ancients); **1 Squawkabilly ex PAL169**; **4 Risky Ruins MEG127**; **4 Damage Pump LOR156**; **2 Technical Machine: Crisis Punch PAF90**; **2 Lightning Energy**; **1 Double Colorless Energy**; and **1 Float Stone**. The 60 also has four Battle Compressor to put Lightning into discard. Source: `results/aichi-2026/full-decklists.json` and matching bundled English printings.

- **Risky Ruins:** when a player puts a Basic non-Darkness Pokémon onto their Bench during their turn, place two 10-damage counters on it.
- **Exeggcute Propagation:** retrieve this Exeggcute from your discard pile into your hand. A prior TPCi Rules Team FAQ (May 2013) cited in [PokéBeach's ruling thread](https://www.pokebeach.com/forums/threads/exeggcute-propagation-question.119787/) explicitly allows repeated use after that physical card leaves and re-enters discard in the same turn. This is a key paper-ruling dependency.
- **Damage Pump:** move up to two damage counters from one of your Pokémon to your other Pokémon in any distribution.
- **Crisis Punch Tool:** 280 damage at three Colorless Energy, only when the opponent has **exactly one Prize card remaining**.
- **Meloetta Debut Performance:** if you go first, this Pokémon can use attacks during your first turn.
- **Tapu Koko Prism Star Dance of the Ancients:** from discard, attach a Lightning Energy to each of **two different Benched Pokémon**, then send Tapu Koko itself to the Lost Zone.

## Proposed source-legal resource sequence

Preconditions include going first; no effective lock on the necessary Abilities, Items or Stadium; starting **Squawkabilly ex Active**; Meloetta available to Bench; both Exeggcute available/propagatable; three Unown available; Float Stone and all other named resources drawn/searched before the attack; opponent having **exactly one Basic Active and no Bench**, with remaining HP at most 280 and no attack-damage prevention. The two Lightning must reach discard before Tapu Koko's Ability. Set **Risky Ruins** and Bench **Meloetta**, **Unown 1**, **Exeggcute A** and **Exeggcute B**, respecting the five-slot Bench.

1. Risky Ruins has put two damage counters (20 damage) on each freshly Benched Basic. Use **Damage Pump 1** to move one counter from Unown 1 to each Exeggcute: both reach 30 damage (their 30 HP) and are Knocked Out. Opponent takes **two Prize cards**. Unown 1 now has zero damage.
2. Use **Propagation** to retrieve both discarded Exeggcute, Bench both again (each gets 20 damage), and Bench Unown 2 (20 damage). Use **Damage Pump 2**, one counter from Unown 2 to each Exeggcute: two more one-Prize Knock Outs. Opponent has now taken **four Prizes**.
3. Retrieve one Exeggcute via Propagation, Bench it again (20 damage), and Bench Unown 3 (20 damage). **Damage Pump 3** moves one damage counter from Unown 3 to that Exeggcute, Knock Out number five. Opponent has **exactly one Prize card remaining**. The Bench now contains Meloetta and three Unown, leaving a fifth slot.
4. Bench Tapu Koko Prism Star and use **Dance of the Ancients** with the two discarded Lightning, attaching one Lightning to Benched Meloetta and the other to one Benched Unown. Tapu Koko enters the Lost Zone. Attach Double Colorless Energy from hand to Meloetta; it now provides at least three Colorless Energy equivalents.
5. Attach **Technical Machine: Crisis Punch** to Meloetta. Attach **Float Stone** to starting Active Squawkabilly (if not already done), retreat Squawkabilly to Meloetta. Use the Tool-provided **Crisis Punch** for 280 damage during the first turn going first, relying on **Debut Performance**. If it Knocks Out the opponent's lone Active and no Pokémon remain in play, the opponent loses.

A separate local deterministic counter-and-slot ledger reproduced the bench sequence without assuming an executable TCG engine: 13 Bench/Item milestones, five 30-HP Exeggcute Knock Outs, final opponent Prize count five, and a maximum of five Benched Pokémon at any milestone. The ledger deliberately omits target accessibility, action timing and card-ability implementation; it only checks arithmetic and space invariants.

Three Damage Pumps are sufficient for the five Exeggcute KOs under the stated board order, leaving a fourth as contingency. The two Exeggcute are reused, and the three Unown serve as 20-damage counter donors. Each relevant Basic stays within five Bench slots when played. This is a **constructive sequence**, with deliberately strong hand/search/access and matchup preconditions, and it does not imply realistic tournament consistency.

## Qualification and risk

The advanced player's rulebook says Knock Outs arise whenever remaining HP becomes zero, including effects, and the opponent takes applicable Prize cards. Its card-text and attack-cost rules also govern the Tool-provided attack and first-turn Ability exception. **Need native and paper-ruling reproduction** of five self-KOs, repeated Propagation after re-entry, both Damage Pump recipients, the first-turn TM attack via Meloetta's ability, Energy movement, exact Prize count, all own zones, and the opponent's terminal with no Bench. Particularly confirm that the rules engine recognizes first-turn *Tool-provided* attacks under Debut Performance and does not mishandle self-KO Prize assignment.

The published native [nine-archetype 36-arm original source test](agent25-nine-archetypes-native-original-36arm-20261101.md) logged 18 `Motivate` attacks across four rank-26 arms with **zero Crisis Punch**, so this **specific source plan was never exercised**. No win-rate inference follows from the constructed line. A next native experiment should retain the untouched original rank-26 60, both actual starting seats, native owner-only information, source-locked physical root/prompt/effect receipts, and opponent continuation. The opening line is irrelevant if the opponent benches an additional Pokémon or a lock prevents setup.

**Scope:** 29 authenticated Aichi source 60s, three missing ranks 23/25/28; zero competitive-qualified games; 99.5% goal remains unproved.
