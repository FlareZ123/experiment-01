# Agent 43: original rank-6 Thunder Mountain counterwindow against Active Alolan Muk

**2 November 2026 | deterministic printed-card counterexample and exact opening-deal access math | zero competitive game observations.**

**3 November 2026 geometry correction:** The earlier 2.96579301% row is the probability that the starting-seven Basics are **only Alolan Grimer as a species**, including a hand with **both** Grimer. The two-Grimer hand can designate one Active and one Benched, then evolve the Benched copy by Boost Shake. Therefore only **2.79392909%** of Basic-valid openers in that direct event have **exactly one initial Basic, a Grimer**, and necessarily start with no second Basic available to select at setup. The corrected source-rank6 independent opportunity intersection is **0.91950748%** rather than **0.97606946%**. The older two numbers remain valid for the broader Grimer-only-start classification, but were misleading when presented as guaranteed Active-Muk geometry. Neither figure measures any played game, and later Switch/retreat effects could still change the Active spot.

## Why this matters to the new fixed sixty

The new [Apex Alchemy v0 candidate](agent43-apex-alchemy-structural-candidate-20261102.md) tries to establish Alolan Muk SUM 58 early through Boost Shake. Muk's Power of Alchemy denies Basic Abilities, including active Iron Thorns ex Initialization. An exposed Active Muk has **120 HP** and four Retreat Cost. The exact [original rank-6 Iron Thorns 60](full-decklists.json) holds a path that can hit 140 without using any Basic Pokémon Abilities. Therefore, the vague claim that first-turn Muk safely neutralizes the original Iron Thorns strategy has a specific printed-card rebuttal.

## Conditional paper attack response, with real physical costs

Consider the candidate going first and forced to start its Alolan Grimer SUM 57 as its only Basic in the initial seven. The candidate finds Boost Shake EVS 142 and an unprized Alolan Muk in its deck, evolves **Active Grimer → Active Muk** on its first turn, and ends that turn as instructed by Boost Shake.

On the original-source rank6 player's first turn going second, assume the original source physically has access to **Guzma & Hala CEC 193** directly or through **Tag Call CEC 206**, has two other disposable hand cards if the Double Colorless Energy is to be searched, and the unique **Thunder Mountain Prism Star LOT 191** and **Double Colorless Energy SUM 136** are outside its Prizes. The source can use Tag Call (if required) to acquire Guzma & Hala; play that Supporter to search Thunder Mountain and, after actually discarding two **other** source-owned cards, also obtain the Double Colorless Energy and optional Tool; play the Stadium; attach DCE to the Active Iron Thorns ex TWM 77; and use **Volt Cyclone**. Thunder Mountain reduces the printed Lightning/Colorless/Colorless attack requirement by one Lightning, while DCE supplies the remaining two Colorless. **140 attack damage Knocks Out the 120-HP Active Muk**, unless some other attack-damage modifier applies. One Prize is awarded because Muk has no Rule Box. The attack's Energy-movement effect must resolve under paper rules if an eligible Benched target exists; it does not undo the printed 140 damage. With Muk out of play, source Iron Thorns' Basic Ability is no longer suppressed by that Muk, and active Initialization resumes subject to other effects.

Thunder Mountain Prism Star also explicitly prevents the effects of Items and Supporters done to itself. The candidate's Faba or Field Blower cannot simply discard/Lost Zone that specific protected Stadium on the following turn; playing Giant Hearth as a different Stadium can replace it, but only when the candidate next gets a playable turn. This is an additional tempo cost, separate from the first-turn Muk KO.

This is a **conditional legal line by printed text**, not a native demonstration of this specific Muk/Thorns meeting or a probability of a source win. The source needs payable cards and a playable search path, and actual first-turn tactics can be influenced by opponent Bonus draws or other conditions. The only presently archived live source payment chain was **source global turn 3** in the independent [Agent7 native rank6 witness](agent7-natural-rank6-ghala-custody-to-pass-reply-20261102.md): two actual other hand cards moved to discard, Thunder Mountain and DCE played, Volt Cyclone dealt and a Prize taken against champion/New Moon, followed by a candidate Pass. That strengthens the source-mechanism plausibility while **not proving the prospective first-turn Muk collision**.

## Exact, narrow opportunity screens

Source formulas enumerate the first seven cards, one ordinary first-turn draw and six Prizes. The event-dependent weighting correctly distinguishes a Basic in the initial seven from one first seen on the eighth draw. Independent source/candidate shuffles and no bonus-mulligan draws are assumed. A source row remains an **overinclusive possible-access screen**, because it does not test the two strategically disposable payment cards or a real chosen gameplay line.

| Predeclared necessary opening property | Probability |
| --- | ---: |
| Candidate initial seven Basic-valid, 12 Basic Pokémon | **80.93533073%** unconditional |
| Candidate forced to start Grimer: at least one of its two Grimer and no other Basic in initial seven | **8.39961250%** among Basic-valid seven |
| Candidate opening seven has only Alolan Grimer **as its Basic species**, one or two physical Grimer, plus direct Shake and unprized Muk | **2.96579301%** among Basic-valid seven; broader historical category |
| **Exactly one Basic** in the candidate's initial seven, that Basic is Grimer; direct Shake and unprized Muk | **2.79392909%** among Basic-valid seven; strictly exposed initial Active Grimer if no switch effect |
| **Both Grimer** in candidate initial seven and no other Basic; direct Shake and unprized Muk | **0.17186392%** among Basic-valid seven; has a Benched Muk line |
| Original rank6 initial seven Basic-valid, four Iron Thorns as its only Basics | **39.94996257%** unconditional |
| Original rank6 sees a held Guzma & Hala or Tag Call by eighth card, keeps DCE and Thunder Mountain outside six Prizes, and can fetch a non-Prized G&H if only Tag Call is held | **32.91090960%** among its Basic-valid seven |
| Broad Grimer-only-species candidate event × source-rank6 opportunity, independent no-bonus shuffles | **0.97606946%** among independently Basic-valid pairs; **includes double-Grimer Bench option** |
| Strict **single-Grimer** candidate event × source-rank6 opportunity under the same assumptions | **0.91950748%** among independently Basic-valid pairs; corrected Active-Muk opportunity screen |

The **0.9195% strict subset** and **0.9761% broader subset** are joint resource-opportunity screens with incompatible missing details, not the chance of attack success, KO, game loss or win-rate failure. Specifically, Guzma & Hala's optional two-discard payment, actual Stage1 evolution execution, live start-order and deck-choice policies, attack target/energy transitions, source surprise counter-actions, venue clock and both decks' response quality are not modeled. No inference about the 99.5% target follows from that row.

The direct first-eight probability with at least one other **non-Grimer** Basic in the actual opening seven, published separately as **6.29698142%** among Basic-valid seven, excludes the legitimate two-Grimer starter. Adding the exact **0.1718639184** percentage points with two Grimer yields **6.46884534%** for the direct event with a selectable Benched-Muk geometry at initial setup, assuming the pilot actually Benches one Grimer and uses Shake on it. The calculation independently enumerated first-seven physical categories, the eighth draw, and six Prizes. The prior source code `simulation/evaluation/agent43-muk-thorns-firstturn-collision.cjs` still reports the broader Grimer-only-species number; its **property name and some old report prose overstate forced Active Muk** until code and original SFT are amended. The previous `candidateForcedActiveMuk()` function is therefore a **historical access classifier** and must not be directly used as a strict Active-Muk exposure statistic.

Machine-reproducible bounded modules: [opening-eight Muk and searchable-Grimer calculator](../../simulation/evaluation/agent43-muk-search-eight-bound.cjs), [forced-Muk/source-rank6 collision calculator](../../simulation/evaluation/agent43-muk-thorns-firstturn-collision.cjs), [candidate print/Prizes SFT](../../tests/agent43-apex-alchemy-sft.test.cjs), [opening-bound SFT](../../tests/agent43-muk-search-eight-bound.test.cjs), and [original-rank6 collision SFT](../../tests/agent43-muk-thorns-firstturn-collision.test.cjs). The independent initial calculations ran locally against the supplied card ZIP/known source counts; the three new GitHub-hosted JS SFTs subsequently **passed** [manual field gate CI 41532255035](https://github.com/FlareZ123/experiment-01/actions/runs/41532255035) at frozen head `5ef0f50b11b267c2d50f89ee3d50820a586d7c9c`. They establish exact math/source-text checks only, not the native paper counterline.

## Wider known-original source pressure (not observed moves)

The [29 authenticated source 60s](full-decklists.json) contain the following card names, counted by exact source inventory on 2 November:

| Named counter-pressure card | Distinct source decks of 29 | Relevant original ranks |
| --- | ---: | --- |
| Guzma (can force vulnerable Active position if Supporter playable) | **25** | all except 4, 17, 26, 31 |
| Budew (potential Item-lock opening; exact attack conditions matter) | **14** | 2, 8, 10, 12, 13, 14, 15, 16, 18, 20, 21, 22, 27, 32 |
| Garbodor (Stage1 Ability-lock engine) | **4** | 8, 11, 16, 22 |
| Temple of Sinnoh (Double Dragon Energy denial) | **5** | 3, 8, 11, 16, 22 |
| Faba (Lost Zones Tool, Special Energy or Stadium) | **7** | 2, 3, 6, 7, 10, 24, 29 |
| Tool Jammer (Active-position Tool denial) | **5** | 3, 6, 7, 24, 29 |
| Enhanced Hammer (Special Energy removal) | **7** | 3, 5, 6, 7, 22, 24, 29 |
| Megaton Blower (mass Tool/Special removal) | **10** | 6, 7, 12, 13, 14, 20, 21, 24, 29, 32 |

These rows overlap and add no estimate of play frequency. The exact original ranks **23, 25 and 28 remain missing**. In particular, Tool Jammer's printed Active-only condition must not be generalized into a Bench-Muk Stealthy Hood answer.

## What would falsify or preserve Apex Alchemy

Stage the unchanged original rank6 60 against the unchanged Apex Alchemy 60 in both physical seats, with candidate forced Active Muk and authentic source first-turn G&H/Tag Call. Require source-owned two-card payment, the specific original DCE + Thunder, a legal attach and observed Volt Cyclone attack/KO/Prize, and then a real candidate next turn. In parallel, test the candidate's alternative Benched Muk geometry where source must pay a separate gust cost and cannot casually spend both Guzma and Guzma & Hala in the same turn. A controlled code branch that skips the source's payment or source's next turn is invalid evidence. Independent source first-turn K0 opportunities and game success should be reported separately with every attempt and both seats.

**Decision impact:** The first-turn Muk concept has a demonstrable *paper counterline* if its Stage1 is exposed Active. Keep v0 only as a challenger with this severe failure condition clearly visible; do not rank it ahead of the champion or New Moon without actual qualified comparison.
