# Agent 2: original rank26 Cologne access through three Order Pads and Trainers' Mail

**3 November 2026 | Exact combinatorial resource-access investigation | zero competitively qualified games**

## Why test the additional connector?

The authenticated [original rank26 Meloetta Donk 60](../aichi-2026/full-decklists.json) contains exactly **one Canceling Cologne** (ASR 136), **three Order Pad** (UPR 131), **four Trainers' Mail** (ROS 92), and **12 Basic Pokémon**. The two registered experimental Apex Alchemy 60s each contain **12 Basics**. A proposed Alolan Muk (SUM 58) ability lock suppresses opposing discard Exeggcute Propagation, and an original rank26 **Canceling Cologne can temporarily remove that Ability only when the opposing Muk is Active**. A Benched Muk retains its Ability. Those last two outcomes have [13 successful staged native test cases](https://github.com/FlareZ123/experiment-01/actions/runs/41682005018), but no genuine opponent game.

Earlier [three-Pad source model](../../scripts/aichi-meloetta-order-pad-bridge.cjs) counted direct Cologne and any held Pad successfully searching the singleton with an independent fair coin. This investigation adds **one Trainers' Mail top-four look after unsuccessfully trying all held Order Pads**. It evaluates the additional source-specific search window rather than overcounting every held Trainer as an immediately playable counter.

## Exact original-source first-turn resource opportunity

Conditional on a valid seven-card source opening, six face-down inaccessible Prize cards, one ordinary first-turn draw and, when stated, all offered optional opposing-mulligan bonus draws:

| Disjoint Cologne access outcome | No optional bonus draws | Source versus 12-Basic Apex owner, all offered bonuses |
| --- | ---: | ---: |
| Directly in opening seven or first-turn draws | 12.65926% | 12.99156% |
| Additional chance: at least one of up to three held Pads flips heads and Cologne remains searchable in live deck | 14.10684 pp | 14.37555 pp |
| **Additional chance: held Trainers' Mail sees Cologne among top four, after all Pad attempts failed** | **2.43242 pp** | **2.46542 pp** |
| **Any of these resource routes** | **29.19852%** | **29.83252%** |

For comparison, direct-plus-Pad access under identical conditions is **26.76610%** without optional bonuses and **27.36710%** with bonuses. These are *conditional resource probabilities*, not probabilities of using Cologne effectively or winning. All routes require the owner to retain the card, be permitted to play Items, resolve prompts and have a meaningful target. An available Cologne cannot neutralize an opposing **Benched** Muk.

### Computation and independent confirmation

The [exact joint source evaluator](../../simulation/evaluation/agent2-rank26-mail-pad-joint.cjs) uses multivariate hypergeometric enumeration across five disjoint card categories, with original rank26 copy-count assertions in [source census](../../simulation/evaluation/agent2-rank26-cologne-counter-frontier.cjs). It conditions the initial seven on containing at least one of 12 Basics, places six Prizes outside the accessible deck, then integrates one natural draw and the geometric simultaneous-mulligan bonus-draw distribution. For every possible opening/draw category-count state:

- If Cologne is held, the resource route succeeds directly.
- Otherwise, if it is in the *live deck*, each held Order Pad supplies an independent 50% coin trial; the probability at least one Pad succeeds is `1-2^(-heldPadCount)`.
- After unsuccessful Pad trials, one held Trainers' Mail sees up to four actual top-of-live-deck cards, with a singleton-hit probability of `min(4,liveDeckCopies)/unobservedPhysicalCopies` conditional on its location.
- Routes are disjoint by the above priority, and a Prized Cologne is never searchable. Multiple Mail uses, Mail-finding-Pad, Stone/Crobat, other draws, Item-lock tactics, and opponent/owner gameplay are deliberately excluded.

The [four regression tests](../../tests/agent2-rank26-mail-pad-joint.test.cjs) verify exact original card counts, exact no-bonus and bonus result partition, the **pre-existing independent all-Pad implementation**, source-mixture behavior and maximal bonus/deck-exhaustion boundary. [Manually dispatched CI 41712515705](https://github.com/FlareZ123/experiment-01/actions/runs/41712515705) **passed** on the actual GitHub checkout. An independent **130,000 valid-opening physical-deal Monte Carlo sanity check** found direct **12.6131%**, Pad incremental **14.1169%**, Mail incremental **2.4538%**, consistent with the enumeration within sampling error; it used private Python RNG with seed 42 and category-only physical slots. This Monte Carlo is supplementary, not the primary proof.

## Meaning for a fixed-deck candidate

The extra search channel modestly increases the original Meloetta opponent's chance of **seeing** an Item that can suppress Muk if Muk is Active. It cannot rescue a Benched-Muk target, and it has no quantified relationship to the candidate's game win probability. Source action sequencing, suppressing Item lock, exact trainer offers, whether Cologne is a dominant competing search use, opponent counterplay and the 25-minute Aichi match clock still require qualified original-source games. This report neither changes the frozen candidate 60s nor ranks them.

**Field status:** 29 of 32 authenticated original printed sixties, ranks 23/25/28 missing, **zero qualified games**, no nominated final 60, and no demonstrated 99.5% field game win rate.
