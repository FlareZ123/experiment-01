# Aichi rank 2: independent Item-lock and Supporter-lock Stage 2 Prize topology

**Agent 30, 19 October 2026. Status: source-verified card printings and exact necessary-card combinatorics; zero qualified competitive match results.** This is an initial Prize gate, not a board-establishment rate, timed-match win probability or card-choice policy.

## Source-printed opposing lock structure

The actual published rank-2 runner-up 60, **Vileplume Control**, contains:

- **2 Oddish UNB 5 → 2 Gloom UNB 7 → 2 Vileplume AOR 3**, providing Item lock via *Irritating Pollen*. Its Ability works in play, including the Bench, if not disabled.
- **2 Lillipup CEC 174 → 2 Herdier SUM 104 → 1 Stoutland BCR 122**, providing opposing Supporter lock via *Sentinel* **only when Stoutland is Active**.
- **14 Basic Pokémon**, classified by matching source set codes/card numbers against the complete paper card database.
- A distinct 1 Vileplume-GX CEC 4 appears in rank2; it has *Fragrant Flower Garden* healing and **does not substitute** for Vileplume AOR's Item lock. The model excludes it from the prerequisite locks.

Both Stage2 chains use distinct Basic and Stage1 families, so the two lock abilities can mechanically coexist without competing for the **same** Basic or Stage1 physical card. They still compete for evolution acceleration, Bench/Active space, Stadiums, tools, Supporter turns, real-game tempo, and resistance to opposing disruption. Their operating lock effects are conditional on actual board placement, engine rules and other effects.

## Exact initial Prize computation

Sample the genuine 60, draw seven uniformly and condition on that initial seven holding at least one of the 14 Basics, then set six Prizes. A single chain is physically possible if at least one card of **each** of its three stages remains outside the six initial Prizes. In particular, the Stoutland singleton must not be Prized. Simultaneous lock prerequisites exist when **both chains** satisfy their own three-stage tests.

The exact weighted combinatorial enumeration partitions each initial six-Prize choice into one of four disjoint conditions, and multiplies each Prize allocation by the number of Basic-valid seven-card hands available among the 54 non-Prize cards. This correctly respects the official draw-before-Prize order, and avoids falsely assuming Prize composition and a legal opening hand are independent.

| Exact initial necessary-card condition | Unconditioned Prizes | Given a Basic-valid opening seven |
| --- | ---: | ---: |
| Neither lock's Stage2 chain survives Prizes | 0.19279% | 0.19237% |
| AOR Vileplume chain only | 11.38227% | 11.42074% |
| Stoutland chain only | 2.34036% | 2.32403% |
| Both lock chains have all necessary stages outside Prizes | **86.08458%** | **86.06287%** |

Therefore the source's single Item-lock Vileplume chain survives initial Prizes in **97.48361%** of Basic-valid starts, and the Supporter-lock Stoutland chain in **88.38689%**. The exact joint probability is:

\[
\frac{68469698109287}{79557769491200}
\approx \mathbf{86.06286796\%}
\]

This is **only a physical upper envelope for prerequisites**, and no bound on true win fraction. Even a completely accessible source hand may fail to evolve, bring Stoutland Active, power attacks or maintain Item lock before the opponent disrupts it.

## Strategically consequential comparison with rank 15

Rank 15 also has an Item-lock AOR Vileplume and an Active-only secondary lock from BUS Vileplume. Unlike rank2, **both rank15 locks share the same 2 Oddish and 2 Gloom**, so both variants can coexist only if **all four** underlying cards survive the initial Prizes, as well as BUS and at least one AOR Stage2. [The independent rank15 exact study](rank15-dual-vileplume-prize-ceiling.md) reports joint necessary-card feasibility of **57.47208082%** on a Basic-valid initial seven.

| Opponent | Conditional initial physical eligibility of both desired Stage2 lock boards |
| --- | ---: |
| Rank 2, distinct AOR Vileplume + Stoutland families | **86.06287%** |
| Rank 15, competing AOR + BUS Vileplume families | **57.47208%** |
| Difference, rank 2 minus rank 15 | **28.59079 percentage points** |

The distinct-chain advantage is structural. Each rank has 14 source Basics, two copies of each relevant Stage1, and one singleton for the secondary Stage2. The two models are aligned on Prize size, legal-seven conditioning and card roles. The difference arises from the stage families' physical independence versus shared requirements.

**Interpretation for deck optimization:** a single candidate 60 that relies on Supporter-based counterplay under persistent Item lock should be tested against the genuinely established rank2 *Stoutland Active plus AOR Vileplume Bench* board. A candidate that assumes any independently present lock can coexist with every other may grossly misjudge rank15. The 86% versus 57% estimates do **not** predict either opponent's success in setting up those locks.

## Reproduction, limitations and next measurement

- [Exact BigInt enumeration on the published rank2 60](../../scripts/aichi-rank2-vileplume-stoutland-prize-ceiling.cjs)
- [Exact-fraction, 60-card source count and cross-rank regression tests](../../tests/aichi-rank2-vileplume-stoutland-prize-ceiling.test.cjs)
- [Underlying dated Aichi source manifest](full-decklists.json)
- [Source-correct rank15 shared-stage Prize analysis](rank15-dual-vileplume-prize-ceiling.md)

The regression tests were added to the existing **manual-only** Aichi statistical workflow, but the new module **has not passed a compiled GitHub Actions execution** at report time; our attempt to dispatch that workflow was blocked by connector safety checks. Exact fractions were independently recomputed in Python before committing; no simulated matchup wins, qualified opponent policy or official 25-minute clock was introduced.

A follow-up should first identify whether source rank2 ever executes both Stage2 evolution lines on *actual unmodified source deals* with a legal, information-correct active-position policy; then test the New Moon, champion and other candidate replies under Item plus Supporter denial. Stratify the actual initial six Prize cards, target evolution paths and each point of source-player choice. Preserve every attempted trial and qualify both starting orders.
