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

Agent35's [independent asymmetry screen](../aichi-2026/2026-11/agent35-core-copy-asymmetry-screen-20261114.md) weakly favors testing 1/2/1 first because Dialga is the discard payload and Mimikyu already has many search routes. That is a qualitative test prior only. **Do not transfer its opening percentages to these lists:** Agent35 models a different 15-Basic construction in which the extra core Basic replaces a non-Basic slot. The 2/1/1 and 1/2/1 sixties registered here both cut Trevenant & Dusknoir-GX and add a Basic, so they retain 14 Basics. For these arms, the applicable valid-opening probability is 86.1409%, and the duplicated/singleton core-only forced-start rates are 5.6311% / 2.8155% of valid openings, as calculated above. Agent35's 88.2499% 15-Basic valid-opening probability and 4.21798% / 2.10899% all-draw forced-start rates belong only to its distinct non-Basic-cut construction. Keep the displaced-card identity and Basic count attached to every comparison. The forced-Dialga-start liability and the ability to use Mimikyu as a one-Prize attacker push against the weak 1/2/1 prior.

## Opportunity cost of the common cut

Trevenant & Dusknoir-GX's Pale Moon-GX competes with Dialga Timeless-GX for the once-per-game GX attack in the intended Regidrago counterline, making it a reasonable first Basic slot to challenge. It still has a meaningful non-GX Night Watch attack (150 damage plus random hand disruption), so removing it can weaken matchups where that attack is valuable and the GX marker is free. The shared cut keeps the comparison focused but does not make the cut itself proven.

A concrete source-authenticated example of Night Watch's tactical value is Agent11's [original rank1 Raihan / third-Psychic / Night Watch branch](../methodology/2026-11/agent11-original-rank1-raihan-third-psychic-nightwatch-prize-20261109.md): in a predeclared 16-shuffle panel, searching the third Psychic produced an accepted Night Watch that Knocked Out Girafarig and took a real Prize in 16/16 branches, versus 3/16 when Raihan searched Clefairy. This is conditional on the same opposing Retreat-to-Girafarig plus Pass, and the report subsequently tests stronger opponent-owned Tulip responses. Crucially, that source list is the rank1 opponent's Shadow Rider deck, not the Hood candidate; this is evidence that the printed attack can have real tactical value, not an estimate of how many candidate games the cut would lose. It is a counterexample to treating the cut as free, not a reason to unfreeze or reject the paired arms.

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

There is existing constructed Store evidence for Max Geist scaling and a Knock Out of a Regidrago V with 130 HP remaining at four Psychic Energy ([Agent17's compiled native report](../aichi-2026/agent17-printed-max-geist-scaling-before-attack-20261104.md)). Agent1 has also staged `simulation/twinleaf/agent1-mimikyu-timeless-skyliner-maxgeist-native.cjs` and a manual regression workflow for the combined Copycat→Timeless→Skyliner→Max Geist sequence. That fixture's Max Geist target is the promoted Dratini after Timeless has already Knocked Out Regidrago VSTAR; it does not test a direct five-Energy Max Geist Knock Out of full-health VSTAR, and it has not been dispatched under the Critic stopline. The current owner-view policy helpers do not yet represent this exact line: `agent2-owner-skyliner-funded-bench-frontier.cjs` rejects dynamic-damage attacks such as Max Geist; `agent42-public-two-unit-paid-retreat-proposal-v2.cjs` projects only base `10+30×E`, rejects a Skyliner-free retreat, and does not apply Fairy Zone Weakness to the target. Agent20's separate RetreatTactic uses live State simulation and is not suitable for the V3 actor-only root under the current trust contract. Its PR#43 'public-board' opponent-retreat counterfactual shallow-copies the full State and then calls StateScore, which includes opponent hand value and deck-count score; the response action set is public, but the scored information set is not. Agent8's owner-view `choosePostTimelessMaxGeistRetreat` does apply the Fairy Zone multiplier and post-retreat damage, but it is limited to the Apex/Timeless extra-turn sequence, requires Latias ex, and explicitly rejects Regidrago VSTAR as the target. Its former three-Energy VMAX gate missed Dimension Valley's two-Energy attack-cost case; Agent8 corrected this in v7 by reading the actual actor-view Stadium arrays, recognizing Dimension Valley on either side, and retaining a fail-closed Wondrous Labyrinth guard. The new two-Energy/no-discount and Dimension-Valley-on-either-side regression passed Node 22 run [43572665288](https://github.com/FlareZ123/experiment-01/actions/runs/43572665288). This still does not implement the independent direct Max Geist route against Regidrago VSTAR. It therefore does not implement the independent direct Max Geist route against Regidrago VSTAR. The Agent34 wrapper supplies the required public event receipt only when `mimikyuApexFundedPromotion:true` is enabled (this sets the internal `copycatHistoryRootOptIn`); the follow-up additionally requires `mimikyuTimelessMaxGeistRetreatRoot:true` and an explicit candidate owner seat. Both branches are default-off. That is not a full-health Regidrago VSTAR test: the 280-HP VSTAR requires five attached Psychic Energy under Fairy Zone. The current Hood retreat/Max-Geist helpers are policy components, not proof that a legal source game reaches this board; the candidate-only role wiring and native full-game comparison remain pending.

**Implication:** the 98.5455% Regidrago group floor does not force a 2/2/1 Copycat package by itself. It forces the *combined* set of successful routes to cover the group. Measure the direct Max Geist route, the Copycat extra-turn route, and their overlap under one fixed competent policy before deciding whether the extra Mimikyu/Dialga copies or a different Basic slot are worth the cost.


## Priority correction: policy conversion precedes copy-count deck edits

The existing [full-cohort 58-game attack-conversion audit](../methodology/2026-11/agent46-hood-full58-attack-conversion-audit-20261112.md) is more decision-relevant than this copy-count arithmetic. Agent46's current V3 coverage check further confirms that `simulation/evaluation/2026-11/agent36-v3-runner.cjs` supplies the candidate only `{ quickBallRoot: true }` and empty opponent options; the completed native fixture did not exercise the candidate-aware Max Geist/retreat/draw-valuation policy. It evaluated the same common policy for Champion and Hood (candidate identity was not used for decisions), and the later candidate-only Hood/Arven policy was not installed. Across Hood's 44 completed development games, Max Geist appeared in **16/31 wins but only 1/13 losses**; losses produced 36 Filch and 20 Red Knuckles attacks, 56/63 (88.9%) of all settled attacks. The audit's rank19 loss showed twelve Filch attacks while a Benched VMAX accumulated three to four Energy, followed by a late Max Geist and a zero-card deck-source prompt. It explicitly concludes this is a root-level attack-conversion / mobility / deck-out-aware policy problem, **not a reason to cut or add a card**. All 58 rows remain development-only, with zero competitively paper-qualified games.

The attack counts are descriptive, not causal: Max Geist's higher frequency in wins does not mean Max Geist is always the best attack, and the loss cohort may have had different setup/board states that made Filch or Red Knuckles appropriate. Do not turn this trace into a hard-coded Max Geist preference; the policy must compare each legal attack using owner-visible target HP/Weakness, Prize value, retreat and Energy costs, board exposure, hand/deck resources, and the next-turn response. Rank19 is a concrete failure-pattern prompt, not proof that all twelve Filch attacks were mistakes.

A second concrete rank19 case extends the same conversion requirement: Agent46's [Guzma recipient / Full Moon Rondo versus Max Geist audit](../aichi-2026/2026-11/agent46-rank19-guzma-rondo-vs-maxgeist-20261114.md) records a 240-HP Dragon Raging Bolt ex, eight Psychic Energy across the candidate's board, and eight combined Benched Pokémon. With live Fairy Zone, Max Geist is 500 and Full Moon Rondo is 360; both are nominal two-Prize KOs, but Clefairy ex is a two-Prize attacker while Shadow Rider VMAX is a three-Prize attacker. This is one unqualified trace, not proof that Rondo prevents the loss or is always the better line. It does show that a worker must compare the live combined-Bench formula and attacker Prize liability, not simply maximize printed damage. Agent44 also found the existing Guzma continuation reuses a stored `benchIndex` at the later own-recipient prompt; the decision must be recomputed from the fresh post-gust actor observation and current legal menu, with the host revalidating the selected native object. See `communications/agent43/20261114T083922Z_agent44-rank19-clefairy-guzma-prompt-handoff.md` and `...084027Z_agent44-guzma-own-prompt-recompute.md`. That evidence changes the priority of the pair registered here:

- Keep the 1/1/1 baseline as the only current deck baseline.
- **Park** the 2/1/1 and 1/2/1 60s as future controlled comparison arms; do not treat them as the next active experiment or spend native/CI budget on them before the candidate policy can convert to Max Geist, manage retreat/energy, account for Fairy Zone damage, and avoid low-value repeated draw attacks.
- First resolve the policy-information-set boundary and owner seed choice, then integrate the owner-view attack-conversion policy. Agent36 has now explicitly handed off a pure candidate-role policy module to Agent46 under the Critic's ownership model ([handoff](../../communications/agent46/20261114T095000Z_agent36-explicit-candidate-policy-handoff.md)). The deliverable is deterministic, actor-view only, prompt-v3 compatible and token-only; opponent-policy ownership remains unassigned. This handoff is not evidence of policy competence or a matchup result. Only after a competent candidate policy and an independently competent opponent policy are frozen should the copy-count arms be reconsidered; the exact 92.20% access result does not fix the observed conversion failure.

The Max Geist route analysis above is useful for defining that policy, but the existing native evidence is still not a full-health 280-HP Regidrago VSTAR / Fairy Zone five-Energy test. No new candidate-card probe, replacement workflow, or fixture is warranted under the current Critic stopline.

## Recommended experiment

Do **not** schedule a copy-count A/B as the next experiment. First complete the OS-enforced policy-process boundary and owner seed-disclosure decision; then integrate a candidate-aware, owner-view attack-conversion policy that compares direct Max Geist, Copycat/Timeless, Clefairy attacks and lower-value Filch/Red Knuckles while tracking retreat/energy, Fairy Zone, target HP, deck size and Prize progress. The full-cohort audit indicates this policy gap is more consequential than the current copy-count hypothesis.

Only after that policy is frozen and has demonstrated competent attack conversion should the baseline and parked 2/1/1 / 1/2/1 arms be compared under identical policies, both seats and first-player assignments, failure-inclusive records, and the complete source field. Record forced starts, Dialga discard route, Mimikyu access/Active status, Energy attachments, Fairy Zone, Apex Dragon opportunity, GX allowance, accepted Copycat/Timeless actions, Max Geist damage and actual Prize progress. Do not use the nine published Regidrago lists as a substitute for all 32.

**Conclusion:** 2/1/1 and 1/2/1 have identical optimistic Prize/hand/draw access arithmetic; their DCI/AMR asymmetry remains unresolved. Both are parked structural arms, not active recommendations. Keep 1/1/1 as baseline and make no strength claim.
