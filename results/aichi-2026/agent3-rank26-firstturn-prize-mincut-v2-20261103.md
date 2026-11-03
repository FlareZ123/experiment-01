# Original rank26: seven-card-source resource mincut, conditioned on a valid opening

**Agent 3 | 3 November 2026 | exact 18-card finite-population enumeration.**

This strengthens the earlier [five-cut first-turn resource dead zone](agent3-rank26-source-first-prize-deadzone-20261103.md) using the exact same authenticated original 60, with a source-only pre-attack damage assumption stated explicitly below.

## Stronger bound

For the original Meloetta Donk rank26 60, an opening with a Basic Pokémon in its first seven cards has probability

> **0.9916366781331345%** = `8894980623433 / 896999961737880`

of placing the singleton **Redeemable Ticket** together with at least one of **seven distinct resource blockers** among six face-down Prizes.

A source going first cannot execute its *first-turn Crisis Punch after giving the opponent five Prizes through five Exeggcute self-KOs* in these configurations, even when it can freely search for every unprized source card. This excludes the signature first-turn attack. It is **not a game-loss probability or a bound on overall win rate**.

| Cut conditioned on Ticket being Prized | Conditional opening probability |
| --- | ---: |
| Singleton Double Colorless Energy also Prized | 0.86068338% |
| Both Lightning Energy Prized | 0.05981775% |
| Both TM: Crisis Punch Prized | 0.05981775% |
| Both Hisuian Heavy Balls and Meloetta ex Prized | 0.00305697% |
| Both Hisuian Heavy Balls and Tapu Koko Prism Star Prized | 0.00305697% |
| **At least 3 of the 4 Damage Pumps Prized** | **0.01234808%** |
| **All 4 Risky Ruins Prized** | **0.00011418%** |
| **Seven-cut union, all overlaps removed** | **0.99163668%** |

The corresponding **unconditional six-Prize union** before opening-hand validity conditioning is `122098 / 12515965` = **0.975538042811721%**.

### Why the last two cuts are sound under the stated source model

- The printed original rank26 60 contains **two 30-HP Exeggcute (PLF 4)**, **four Damage Pump (LOR 156)**, **one Dowsing Machine (PLS 128)**, **four Risky Ruins (MEG 127)** and **four Unown (AOR 30)**. No source Basic has less than 30 HP. The source must give the opponent five Prizes *before* declaring Crisis Punch.
- A freshly Benched Exeggcute takes **two damage counters** from Risky Ruins, leaving 10 HP. The source needs at least one more counter to Knock Out each of the five Exeggcute appearances. Its only pre-attack method of moving an extra counter onto such an Egg is Damage Pump. Each Pump moves at most two counters total, from one physical source Pokémon to other Pokémon. Thus **at least three Damage Pump resolutions** are necessary for five one-Prize Egg KOs.
- If Ticket and at least three of the four Pumps are Prized, at most one physical Pump is available. One Dowsing Machine can retrieve that Pump once from the discard pile, for **at most two Pump resolutions**, yielding at most four of the five required Egg KOs. Original source has no additional Trainer recursion to repeat Dowsing Machine.
- If Ticket and all four Risky Ruins are Prized, no initial source self-damage effect is available before that attack. Damage Pump has no damage counters to transfer. Unown's printed Farewell Letter expressly **does not count as a Knock Out**, and Tapu Koko Prism Star moving itself to the Lost Zone likewise does not give opponent Prizes.
- This mincut analysis considers the standard **source-first normal opening** before the opponent has had a turn to attack. It assumes the opponent supplies **no independent preturn damage to source Pokémon**. If a specific opponent's card can place such damage during setup, evaluate that interaction separately before applying the last two cuts. It also assumes switching an already-in-play Active Pokémon onto the Bench does not constitute a fresh Basic Bench placement under Risky Ruins; the applicable native code and [published Risky Ruins rulings](https://bulbapedia.bulbagarden.net/wiki/Risky_Ruins) distinguish Benching a Pokémon from switching one already in play. The first five cuts are independent of these added assumptions.

### Exact enumeration and validation

The [BigInt SFT](../../tests/agent3-rank26-prize-resource-mincut-extended.test.cjs) checks the exact original printed 60, counts and effect texts for **Ticket, Dowsing Machine, Damage Pump, Risky Ruins, Exeggcute and Unown**. It enumerates all marked-card Prize-inclusion masks over **18 distinct physical cards**, with two marked Basics and 16 marked non-Basics. The remaining 42 source cards consist of ten Basics and 32 non-Basics. It fills each mask to exactly six Prize cards and conditions on a valid initial seven by weighting `C(54,7)-C(48-prizedNonBasic,7)`.

The final rational and unconditional value are asserted exactly; the test passed direct deterministic V8 execution against live committed repository source `full-decklists.json` and five printed source-card JSON files. This is a **mathematical calculation**, not a Monte Carlo simulation. The Node test runner/compiled Twinleaf has not yet been invoked for this new SFT.

**Relevance:** source-first one-turn Crisis Punch has an exact **at least 0.99163668% resource-inaccessibility floor** under these assumptions. The complement is **not an attainable attack rate**. Actual opening failures due to draw, Supporter/Bench contention, opposing locks, K0 uncertainty or native decision policies are separate. The benchmark remains 29/32 original source lists and zero competitively qualified games. No final decklist is selected.

Source citations: [original printed roster](full-decklists.json), [base five-cut proof](agent3-rank26-source-first-prize-deadzone-20261103.md), [Rulebook](../../resources/advanced-players-rulebook.md), [reproducible SFT](../../tests/agent3-rank26-prize-resource-mincut-extended.test.cjs).
