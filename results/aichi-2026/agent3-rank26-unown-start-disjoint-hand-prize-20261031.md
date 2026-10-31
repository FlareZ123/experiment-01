# Rank26 Meloetta: Unown starter expands the conditional first-turn resource-location envelope

**Agent 3 | 31 October 2026 | exact joint initial-seven + Prize-six combinatorics, anchored to source original rank26 60.**

## New legal opening geometry, independently of Dowsing

The prior [21-step five-self-KO paper witness](agent3-rank26-meloetta-first-turn-five-self-ko-paper-witness-20261030.md) and [Dowsing variants](agent3-rank26-dowsing-pump-alternate-prize-union-20261031.md) explicitly require the rank26 source singleton **Bunnelby** in the starting Active Spot. That is a severe opening restriction. The authentic 60 also has **four Unown AOR 30**, Basic Psychic Pokémon with 60 HP and the optional, Bench-only Farewell Letter Ability. One Unown can legally begin **Active** and remain there without using Farewell Letter. A **different physical Unown** can be held for a post-Risky Ruins Bench placement and then serve as the two-damage-counter donor in the same Pump sequence.

The source's physical board and effects for this additional conditional paper line are:

1. Choose Unown copy A as the original Active. Reserve Unown copy B as a hand-accessible future Bench donor. This source route does **not** require the singleton Bunnelby to be drawn or unprized.
2. Play Risky Ruins, then Bench Meloetta ex, Tapu Koko Prism Star, the eligible Exeggcute copies, and later Unown B from hand. Each eligible Basic newly Benched after the Stadium receives two damage counters, including donor Unown B. With two Eggs the Bench never needs more than five places.
3. The original **three Damage Pump** progression is unchanged: Meloetta transfers one counter to each Egg (two self-KOs), Tapu does the same after the two Eggs Propagate and rebench (two more), and Unown B transfers one counter to a returned Egg (fifth self-KO). The opponent now has exactly one Prize. The two Dowsing variants preserve the same source donor plan while using their separately documented alternate Egg/Pump counts.
4. Battle Compressor has put two Lightning in the discard. Tapu Koko Dance of the Ancients attaches one to the **Benched Meloetta** and one to the **distinct Benched Unown B**, sending Tapu to the Lost Zone. The source manually attaches its one DCE to Meloetta and equips TM: Crisis Punch.
5. Escape Rope promotes Meloetta from the Bench and moves initial Active Unown A onto the Bench. Even if the Stadium applies its 20-damage effect to this moved Unown, 20 remains below its printed 60 HP; no additional self-KO is needed or assumed. Meloetta's live Debut Performance permits its going-first turn-one 280 Crisis Punch against a sole unprotected 80 HP Frillish, conditionally removing the last opposing Pokémon.

The two copies of Unown are **different physical cards**; one is the starter and another must survive Prizes as the donor/second Dance recipient. This is a **paper rules/known-card conditional route argument** and has not been executed with a source-conserved actual Unown Active Store sequence. We do not infer that a realistic bot will hold the second Unown before the Stadium, acquire every card, or find an affordable route through its hand.

## Exact disjoint joint-opening and Prize enumeration

A 60-card deck produces an initial 7-card hand and, subsequently, 6 Prize cards out of the remaining 53. There are C(60,7) * C(53,6) physical ordered-zone combinations when only within-zone ordering is disregarded. Condition on a Basic-valid original seven, with 12 printed Basic Pokémon: [C(60,7) - C(48,7)] * C(53,6) = **7,175,999,693,903,040** equally weighted (hand, Prize) configurations.

Use the original [grouped source card requirements](../../scripts/agent3-rank26-donk-prize-witness-upper.cjs) and the [Dowsing additional cases](../../scripts/agent3-rank26-dowsing-pump-branches.cjs). A second exact **BigInt dynamic program** counts each group's actual hand H and Prize P values with weight C(n,H) * C(n-H,P), and sums all legal groups with total H=7 and P=6. It partitions starting choices without overlap:

- **Bunnelby class:** original seven contains singleton Bunnelby. At least one of the four Unown must remain unprized to serve as donor.
- **Unown class:** original seven contains **no** Bunnelby, contains at least one Unown, and at least two of the four Unown must be unprized overall. One Unown starts, another is Benched as donor.

In both classes the remaining original physical minimums must survive Prizes. The mutually exclusive three Pump/Egg events are at least 3 unprized Pumps and both Eggs; exactly 2 Pumps and both Eggs plus unprized Dowsing; or exactly 1 Egg and all 4 Pumps plus unprized Dowsing. This is a **conditional resource-location screen**, not a Dowsing hand-payment or real first-turn action solver.

| Source start and Prize-survival branch | Exact (hand-seven, Prize-six) favorable count | Conditional on a Basic-valid seven |
| --- | ---: | ---: |
| Bunnelby, 3 Pump + 2 Egg | 382,571,527,752,960 | 5.331265% |
| Bunnelby, exactly 2 Pump + 2 Egg + Dowsing | 22,347,178,351,680 | 0.311416% |
| Bunnelby, exactly 1 Egg + 4 Pump + Dowsing | 62,324,232,064,640 | 0.868509% |
| Unown, 3 Pump + 2 Egg | 1,179,047,969,709,344 | 16.430435% |
| Unown, exactly 2 Pump + 2 Egg + Dowsing | 68,226,606,022,848 | 0.950761% |
| Unown, exactly 1 Egg + 4 Pump + Dowsing | 191,482,047,728,384 | 2.668368% |

Thus the two disjoint **Bunnelby / Unown start** classes contribute **6.51118949% and 20.04956361%**, giving a combined **26.56075311% necessary-location opportunity** for these specific strict lines. Without either Dowsing variant, the combined original three-Pump/two-Egg physical opportunity is **21.76169961%**. The Dowsing branches add **4.79905350 percentage points** to this expanded starter screen.

This large increase over the previous narrow singleton-Bunnelby result is a **coverage correction**: a basic starting Unown was unnecessarily excluded by that first conditional model. It is not evidence that a source donk is near 26.56% likely. Acquisition, DCI of the Dowsing discard payments, opening Bench decisions, Risky Ruins timing, Tapu's two-target setup, mandatory opponent Prize choices, abilities and locks, and game clock can make almost all qualifying physical arrangements unplayable.

## Reproduction and adversarial check

- [Exact BigInt two-zone DP](../../scripts/agent3-rank26-alternative-basic-starter.cjs) and [four deterministic Node tests](../../tests/agent3-rank26-alternative-basic-starter.test.cjs), **4/4 passing locally under Node 22.16.0**.
- The Bunnelby-only partition exactly reproduces the previous independent 59-card Prize DP probability **0.0651118949414483**. This is an important nontrivial cross-check of the hand-seven/Prize-six weighting.
- A separate seeded Monte Carlo with **400,000 freshly shuffled independent physical deals** gave **26.5076%** when normalized by the exact **80.9353%** Basic-valid opening fraction, agreeing with 26.5608% within sampling variation. This simulation sampled only hand and Prize identities, no play.
- Native source-60 direct Unown starter, real Risky Ruins timing, owner-hand acquisition, opponent bench, and five self-KO/attack settlement remain **untested**. A meaningful next test must hold a second Unown for Risky Ruins and use exact native Unown start versus the Bunnelby control under the same real source seed. Existing staged Pump tests do not suffice.

Source roster still has 29/32 authenticated exact opposing lists, with ranks 23/25/28 missing; **zero competitively qualified games** and no demonstrated 99.5%-successful fixed 60-card deck. All percentages here are card-location necessity screens for unusually specific conditional source-winning lines.
