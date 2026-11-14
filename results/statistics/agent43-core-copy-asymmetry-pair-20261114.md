# Agent 43 — paired 2/1/1 vs 1/2/1 core-copy challenger screen

**14 November 2026 · Matched whole-deck structural hypotheses · No gameplay evidence**

## Purpose

The exact early-access model is symmetric between duplicating Mimikyu and duplicating Dialga-GX. The previous [Mimikyu-2 challenger](../decks/hood-shadow-rider-v1-mimikyu2-challenger-60.md) made one concrete cut (Trevenant & Dusknoir-GX) but did not by itself establish that the second Mimikyu is the better copy to add. This report registers the matched Dialga-2 arm so the two hypotheses can be compared without changing the displaced card.

## The two 60-card arms

Both lists remove **one Trevenant & Dusknoir-GX SMP SM217** and retain 14 total Basics, 31 Trainers and 11 Basic Psychic Energy.

- **2/1/1:** [Mimikyu-2 / Dialga-1 / Heavy Ball-1 60](../decks/hood-shadow-rider-v1-mimikyu2-challenger-60.md). Adds a second Mimikyu GRI 58.
- **1/2/1:** [Mimikyu-1 / Dialga-2 / Heavy Ball-1 60](../decks/hood-shadow-rider-v1-dialga2-challenger-60.md). Adds a second Dialga-GX UPR 100.

The baseline 1/1/1 list remains unchanged. These are separate challenger registrations, not nominations.

## What the exact model says

With one Arven, two natural draws after the seven-card opening, six Prizes, and a valid opening containing at least one Basic, both arms produce the same arithmetic:

| Metric | Baseline 1/1/1 | 2/1/1 | 1/2/1 |
| --- | ---: | ---: | ---: |
| Total Basics | 14 | 14 | 14 |
| Valid-opening probability | 86.1409% | 86.1409% | 86.1409% |
| Core recovery feasible by horizon | 85.9140% | **92.2004%** | **92.2004%** |
| Hard Prize-only obstruction | 2.3669% | **0.9399%** | **0.9399%** |
| Recoverable but not seen by horizon | 11.7190% | **6.8597%** | **6.8597%** |
| Valid opening and core recovery (joint) | 74.0072% | **79.4223%** | **79.4223%** |

The core-copy increase improves the optimistic conditional access event by **6.2863 percentage points** and the joint valid-opening/recovery event by **5.4151 points**. It does not improve the probability of a valid opening because the Basic count remains 14.

The model is deliberately optimistic: any unprized core copy is treated as otherwise accessible; Heavy Ball can be played when seen or searched by the one Arven if an eligible Tool remains; no opponent disruption is modeled. It does not execute the search/discard route, pay Copycat, place Mimikyu Active, establish Fairy Zone, confirm the opponent's Apex Dragon declaration, or evaluate the extra turn. The current actor-root policy also lacks a specific Arven→Heavy Ball branch for this counterline. Thus the 92.20% number is not a practical policy access rate, much less a matchup win probability.


## Sensitivity to the Arven→Heavy Ball search assumption

The same exact enumerator can disable its single Arven search channel. This isolates how much of the optimistic recovery event depends on Arven being seen and deliberately used for Heavy Ball:

| Package | With Arven search | Without Arven search | Arven contribution |
| --- | ---: | ---: | ---: |
| 1/1/1 | 85.9140% | 83.8619% | +2.0522 pp |
| 1/1/2 | 88.1516% | 86.1623% | +1.9893 pp |
| 2/1/1 | 92.2004% | 90.9961% | +1.2043 pp |
| 1/2/1 | 92.2004% | 90.9961% | +1.2043 pp |
| 2/2/1 | 98.8157% | 98.6249% | +0.1907 pp |

The no-Arven column still assumes Heavy Ball is playable when naturally seen in the opening hand or draws. It is not a model of the current candidate policy: the prior actor-root audit found no Heavy Ball reference or Arven→Heavy Ball counterline branch at all. Therefore the current policy does not implement either modeled channel. The table says the Arven search channel adds 1.20–2.05 points under this optimistic access model; it does not establish that a policy can execute it or that the event wins a game.

## The asymmetry that the Prize model omits

The same card counts create different forced-Active risks. In a 14-Basic, 60-card list:

- The duplicated Basic species is the sole Basic in **5.6311% of valid seven-card openings**.
- The singleton core Basic is the sole Basic in **2.8155% of valid openings**.

The exact conditioning is \`[2 × C(46,6) / C(60,7)] / [1 − C(46,7)/C(60,7)]\` for the duplicated species, and half that numerator for the singleton species. This makes the forced-start percentages reproducible without a simulator.

For 2/1/1, the duplicated species is Mimikyu; for 1/2/1, it is Dialga-GX. The first arm therefore more often forces a 70-HP, one-Prize Mimikyu Active, but that Pokémon has a one-Colorless Filch attack. The second more often forces a 180-HP, two-Prize Dialga-GX Active, whose printed attacks are not payable with the deck's Psychic-only Energy. Mimikyu's fragility and Dialga's durability both matter; neither is captured by the Prize model.

The other side of the comparison is access and zone utility:

- Mimikyu has four Fog Crystal, four Mysterious Treasure and one Quick Ball routes from deck to hand. A second Mimikyu is another possible Copycat attacker and can use Filch, but may be redundant when the first is accessible and still needs Bench/Energy resources.
- Dialga-GX can be found with Mysterious Treasure or Quick Ball, and Battle Compressor can place it directly into discard. A second Dialga may allow a safer donor after one payload is secured or provide backup if the first is Prized/removed, but only one Dialga in discard is required and the second can be a stranded Basic.
- The previous prospective donor tests found real Treasure/Compressor payments without increased Copycat conversion. Agent35's turn-start audit found the complete counterline opportunity chain to be rare. The bottleneck may be joint timing and policy sequencing rather than the number of copies of either species.

Agent35's [independent asymmetry screen](../aichi-2026/2026-11/agent35-core-copy-asymmetry-screen-20261114.md) weakly favors testing 1/2/1 first because Dialga is the discard payload and Mimikyu already has many search routes. That is a test prior only. The forced-Dialga-start liability and the ability to use Mimikyu as a one-Prize attacker push in the other direction.

## Opportunity cost of the common cut

Trevenant & Dusknoir-GX's Pale Moon-GX competes with Dialga Timeless-GX for the once-per-game GX attack in the intended Regidrago counterline, making it a reasonable first Basic slot to challenge. It still has a meaningful non-GX Night Watch attack (150 damage plus random hand disruption), so removing it can weaken matchups where that attack is valuable and the GX marker is free. The shared cut keeps the comparison focused but does not make the cut itself proven.

The field screen supporting retention of other Basic techs found all nine published Regidrago lists contain Super Rod and all 29 published Aichi lists contain at least one Stadium. This supports keeping Girafarig and Marshadow as live hypotheses; it does not prove their use or game value.


## Pressure from the 99.5% Regidrago group floor

The [archetype loss-budget derivation](group-loss-budget.md) proves that the 11 Regidrago placements must average at least **98.5455% wins** if every other one of the 32 ranks is perfect. This is a necessary whole-field constraint, not an empirical estimate.

Compare that floor with the optimistic early core-recovery event:

| Package | Core recovery feasible by horizon | Difference from 98.5455% group floor |
| --- | ---: | ---: |
| 1/1/1 | 85.9140% | −12.6314 pp |
| 1/1/2 | 88.1516% | −10.3939 pp |
| 2/1/1 | 92.2004% | −6.3451 pp |
| 1/2/1 | 92.2004% | −6.3451 pp |
| 2/2/1 | 98.8157% | +0.2702 pp |
| 2/2/2 | 99.0115% | +0.4660 pp |

This is **not** a comparison of win rates: an accessible core does not ensure that the opponent used Apex Dragon, that the policy can assemble the line, or that the line wins. The 2/1/1 and 1/2/1 arms cannot support a strategy in which this counterline is the *only* way to win Regidrago games at the required group floor; alternative winning lines would have to cover at least the modeled access shortfall, and then some for execution failures. Even 2/2/1 clears the group floor by only 0.27 points at the access-feasibility layer, before any real-game attrition. Therefore, **no core-copy package is sufficient evidence for the 99.5% target**. The research must quantify other win routes and actual line conversion, not simply maximize this one access event.

The 2/2/1 row also requires naming two displaced Basic techs; this report only registers the one-slot 2/1/1 and 1/2/1 pair. Do not create or promote a 2/2/1 60 until a second cut has a defensible full-field opportunity-cost case.


## A separate Regidrago route: Max Geist under Fairy Zone

The 92.20% core-recovery figure is not a ceiling on the deck's total Regidrago win probability because the list has a non-Copycat attack route. Shadow Rider Calyrex VMAX's printed Max Geist does **10 + 30×E** damage, where E is the number of Psychic Energy attached to all of the candidate's Pokémon. Lillie's Clefairy ex's Fairy Zone makes each opposing Dragon Pokémon Psychic-weakness ×2.

For a full-health 280-HP Regidrago VSTAR:

| Psychic Energy attached across the candidate's board (E) | Max Geist base damage | With Fairy Zone | Damage counters already on Regidrago needed for a KO |
| ---: | ---: | ---: | ---: |
| 3 | 100 | 200 | 80 |
| 4 | 130 | 260 | 20 |
| 5 | 160 | **320** | 0 |
| 6 | 190 | 380 | 0 |

Without Fairy Zone, nine attached Psychic Energy are required to reach 280 printed damage. The candidate list has four Shadow Rider VMAX, two Lillie's Clefairy ex, eleven Psychic Energy, Dimension Valley, and Latias ex. Underworld Door can attach one Psychic Energy from hand to a Benched Psychic Pokémon per Shadow Rider VMAX per turn; Dimension Valley can reduce the attack's Colorless cost, but it does not change the five-Energy damage threshold. Latias ex can make a Basic Mimikyu retreat for free, preserving its Energy when pivoting to a powered VMAX. The threshold E is measured **after** the pivot: if Mimikyu's one-Colorless retreat is paid, the pre-retreat board needs six Psychic Energy to leave five; if Latias ex's Skyliner is active or Float Stone is attached to Mimikyu, the pivot is free and five pre-retreat Energy are enough.

This creates two routes against Regidrago: (1) an independent Max Geist Knock Out, which does not require an Apex Dragon opportunity; and (2) a Copycat→Timeless-GX extra-turn pivot from Mimikyu into a Max Geist attack, which does require the opponent to have used Apex Dragon during the previous turn. The first is the non-Copycat alternative that could cover some Copycat-access failures; the second is a two-attack conversion of the Copycat line. Evaluate both as a *joint* policy/board event, not by adding independent probabilities.

There is existing constructed Store evidence for Max Geist scaling and a Knock Out of a Regidrago V with 130 HP remaining at four Psychic Energy ([Agent17's compiled native report](../aichi-2026/agent17-printed-max-geist-scaling-before-attack-20261104.md)). That is not a full-health Regidrago VSTAR test: the 280-HP VSTAR requires five attached Psychic Energy under Fairy Zone. The current Hood retreat/Max-Geist helpers are policy components, not proof that a legal source game reaches this board; the candidate-only role wiring and native full-game comparison remain pending.

**Implication:** the 98.5455% Regidrago group floor does not force a 2/2/1 Copycat package by itself. It forces the *combined* set of successful routes to cover the group. Measure the direct Max Geist route, the Copycat extra-turn route, and their overlap under one fixed competent policy before deciding whether the extra Mimikyu/Dialga copies or a different Basic slot are worth the cost.

## Recommended experiment

Once the owner-selected seed-disclosure model and OS-enforced policy-process isolation are in place:

1. Freeze the baseline, 2/1/1 and 1/2/1 60-card fingerprints.
2. Use one fixed candidate policy with explicit Mimikyu/Dialga zone tracking and a legal Arven→Heavy Ball branch; hash the policy and engine revision.
3. Compare the three lists against the same competent fixed opponent policy on the nine published Regidrago lists, both seats and first-player assignments, with independent seeds and failure-inclusive records.
4. Record forced starts, actual Dialga discard route, Mimikyu access/Active status, Energy attachments, Fairy Zone, Apex Dragon opportunity, GX allowance, accepted Copycat/Timeless actions and actual Prize progress.
5. Evaluate both challenger arms across the wider source field before nomination. Do not use the nine-list Regidrago subset as a substitute for the full 32.

**Conclusion:** 2/1/1 and 1/2/1 have identical optimistic Prize/hand/draw access arithmetic. The choice is a whole-game DCI/AMR question. Preserve both as matched challenger arms, keep 1/1/1 as baseline, and make no strength claim.
