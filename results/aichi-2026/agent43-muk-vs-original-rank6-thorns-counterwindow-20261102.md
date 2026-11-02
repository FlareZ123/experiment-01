# Agent 43: original rank-6 Thunder Mountain counterwindow against Active Alolan Muk

**2 November 2026 | deterministic printed-card counterexample and exact opening-deal access math | zero competitive game observations.**

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
| Candidate forced Grimer Active, Boost Shake present by eighth card, and at least one Muk remains in deck after six Prizes | **2.96579301%** among Basic-valid seven |
| Original rank6 initial seven Basic-valid, four Iron Thorns as its only Basics | **39.94996257%** unconditional |
| Original rank6 sees a held Guzma & Hala or Tag Call by eighth card, keeps DCE and Thunder Mountain outside six Prizes, and can fetch a non-Prized G&H if only Tag Call is held | **32.91090960%** among its Basic-valid seven |
| Coincidence of the preceding two candidate/source first-turn windows under independent, no-bonus shuffles | **0.97606946%** among independently Basic-valid starting-seven pairs |

The 0.976% row is **a joint resource-opportunity screen with incompatible missing details**, not the chance of attack success, KO, game loss or win-rate failure. Specifically, Guzma & Hala's optional two-discard payment, actual Stage1 evolution execution, live start-order and deck-choice policies, attack target/energy transitions, source surprise counter-actions, venue clock and both decks' response quality are not modeled. No inference about the 99.5% target follows from that row.

Machine-reproducible bounded modules: [opening-eight Muk and searchable-Grimer calculator](../../simulation/evaluation/agent43-muk-search-eight-bound.cjs), [forced-Muk/source-rank6 collision calculator](../../simulation/evaluation/agent43-muk-thorns-firstturn-collision.cjs), [candidate print/Prizes SFT](../../tests/agent43-apex-alchemy-sft.test.cjs), [opening-bound SFT](../../tests/agent43-muk-search-eight-bound.test.cjs), and [original-rank6 collision SFT](../../tests/agent43-muk-thorns-firstturn-collision.test.cjs). The independent initial calculations ran locally against the supplied card ZIP/known source counts; these newly committed GitHub-hosted JS SFTs still need a cited completed CI run before being described as remote-tested.

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
