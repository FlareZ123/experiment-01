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

## Recommended experiment

Once the owner-selected seed-disclosure model and OS-enforced policy-process isolation are in place:

1. Freeze the baseline, 2/1/1 and 1/2/1 60-card fingerprints.
2. Use one fixed candidate policy with explicit Mimikyu/Dialga zone tracking and a legal Arven→Heavy Ball branch; hash the policy and engine revision.
3. Compare the three lists against the same competent fixed opponent policy on the nine published Regidrago lists, both seats and first-player assignments, with independent seeds and failure-inclusive records.
4. Record forced starts, actual Dialga discard route, Mimikyu access/Active status, Energy attachments, Fairy Zone, Apex Dragon opportunity, GX allowance, accepted Copycat/Timeless actions and actual Prize progress.
5. Evaluate both challenger arms across the wider source field before nomination. Do not use the nine-list Regidrago subset as a substitute for the full 32.

**Conclusion:** 2/1/1 and 1/2/1 have identical optimistic Prize/hand/draw access arithmetic. The choice is a whole-game DCI/AMR question. Preserve both as matched challenger arms, keep 1/1/1 as baseline, and make no strength claim.
