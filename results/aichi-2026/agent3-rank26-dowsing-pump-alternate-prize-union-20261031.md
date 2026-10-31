# Rank26 Meloetta Donk: two additional Dowsing Machine rescue lines

**Agent 3 | 31 October 2026 | source-printed deterministic card-effect model and exact integer Prize enumeration.** This is an extension of the [existing 21-step conditional paper witness](agent3-rank26-meloetta-first-turn-five-self-ko-paper-witness-20261030.md) and its [5.3313% exact hard card-location gate](agent3-rank26-exact-donk-witness-resource-ceiling-20261030.md). It is **not** a randomly dealt first-turn execution, native Store game, policy result, full-field win-rate claim, or an upper bound on alternative rank26 game plans.

## Why the previously ignored ACE SPEC matters

The authenticated original final rank26 Hibiki Yamada 60 in [full-decklists.json](full-decklists.json) has exactly **4 Damage Pump LOR156**, **2 Exeggcute PLF4**, and **1 Dowsing Machine PLS128**. Dowsing Machine's printed text allows a Trainer card to be retrieved from discard after discarding **two other hand cards**. The provided English card pool also confirms Damage Pump must transfer up to two counters **from one** of your Pokémon. Risky Ruins MEG127 puts two 10-damage counters on a non-Darkness Basic newly Benched during a turn, and the single Exeggcute PLF4 may use Propagation after a fresh discard incarnation. All other resource assumptions follow the original 21-step witness.

Two genuinely different conditional plans become available, with identical later Tapu Koko distinct-target Lightning attachment, DCE manual attachment, Crisis Punch Tool, Escape Rope and first-player Meloetta ex exception:

1. **Two Exeggcute, two original Pumps plus Dowsing**: the first Pump transfers one counter from Meloetta to each egg, KO two. Both eggs Propagate and are Benched again; the second Pump transfers one counter from Tapu to each, KO two more. Dowsing Machine retrieves a spent Pump by discarding two other hand cards. That recovered Pump moves one counter from Unown to one rebenched egg, KO the fifth. The candidate has exactly one Prize left. **Three Pump uses from two physical copies**.
2. **One Exeggcute, four original Pumps plus Dowsing**: repeatedly KO, Propagate and rebench one egg. Two Pumps move one counter each from Melo, two from Tapu, and Dowsing retrieves the first Pump for the final one-counter transfer from Unown. **Five Pump uses from four physical copies**. The other printed Exeggcute may be Prized.

Each staged sequence respects the **one-donor per Pump** restriction, never takes a sixth opposing Prize, spends one Dowsing, consumes a two-card hand payment, stays within five Bench slots, and leaves one opposing Prize before a conditional 280 Crisis Punch against a sole unprotected 80HP Frillish. The source's Tapu Koko is sent to Lost Zone before the finishing attack. The two hand payments are explicitly **assumed accessible**, illustrated by distinct Trainers' Mail A and B. This assumption is strategically costly and may be false in an authentic dealt hand. The paper state model is deliberately simplified; none of these steps is a new native Store action transcript.

## Exact disjoint six-Prize calculation

Hold the singleton source Bunnelby outside Prizes by requiring it in the original seven. Random six-Prize subsets then come from the other 59 copies, denominator **C(59,6)=45,057,474**. Use the existing exact-integer grouped-card DP in [agent3-rank26-donk-prize-witness-upper.cjs](../../scripts/agent3-rank26-donk-prize-witness-upper.cjs), requiring all other original 21-step physical groups to survive their minimums. Partition favorable six-Prize subsets into genuinely **disjoint** cases:

| Necessary physical-card location case | Favorable six-Prize subsets |
| --- | ---: |
| At least 3 Pumps unprized and both Exeggcute unprized, original witness | 16,664,352 |
| Exactly 2 Pumps unprized, both Exeggcute, Dowsing unprized | 973,416 |
| Exactly 1 Exeggcute unprized, all 4 Pumps, Dowsing unprized | 2,714,768 |
| **Union** | **20,352,536** |

With 12 original Basic Pokémon, the chance that the Basic-valid original seven contains source singleton Bunnelby is **14.4148007571%**. Combining the exact conditional event with uniform remaining six Prizes:

| Opening-plus-Prize physical opportunity | Probability |
| --- | ---: |
| Previously described 3-Pump / 2-Egg witness | **5.3312645495%** |
| Union of original witness and both Dowsing variants | **6.5111894941%** |
| Increase in covered necessary-location events | **1.1799249446 percentage points** |

This union is a **permissive necessary physical-card-location event for precisely these three lines**. It says nothing about reaching all cards by a real first-turn search/draw chain; paying Dowsing's two-card cost; placing the Stadium before Benching; the opponent's Active; live Ability/Item lock; native card support; physical match conservation; policy competence; or the game win rate. It also cannot upper-bound other different source strategies. Starting a different Active or another donor/acceleration route may bypass these particular requirements. The new single-egg route is more fragile to Dowsing availability, while the two-egg/two-Pump route may be attractive only in a rare Prize configuration.

## Reproduction, qualification and next discriminating test

- [Source calculation and conditional card-effect timelines](../../scripts/agent3-rank26-dowsing-pump-branches.cjs).
- [Four pure Node regression tests](../../tests/agent3-rank26-dowsing-pump-branches.test.cjs). Executed locally under Node 22.16.0 with **4/4 passed**, using the authentic rank26 group counts and existing exact DP logic; a full native compiled CI test of this new file remains unperformed.
- The existing staged [source-60-conserved Propagation/Pump fixture](../../simulation/twinleaf/rank26-propagation-source-fixture.cjs) already supports a 2+2+1 source setup via real Store actions and three independent Pumps. A meaningful **next** step is to replace the third original Pump with one actually Store-accepted Dowsing retrieval, then prove source's real two-card hand payment and subsequent third Pump. Separately test a four-plus-one same-egg reset and preserve the first rejected action or conservation failure.
- A harder and more valuable falsification is to replay a truly shuffled original rank26 source-first deal, preserving six Prizes and every rejected search/discard action, and determine whether the full sequence is reachable under a competent owner-information-only policy within the real Aichi game clock. Most card-location successes will fail the hand-access gate, potentially making this rescue irrelevant competitively.

**Fixed-deck decision unchanged:** 29 of 32 authenticated original opposing final-placement 60s; ranks 23, 25 and 28 missing; **zero competitively qualified games**, no validated final fixed deck, and no demonstrated 99.5% win rate.
