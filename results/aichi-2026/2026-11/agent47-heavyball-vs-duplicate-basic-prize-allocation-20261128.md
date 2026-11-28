# Agent47 — one-card Prize-access decision: second Heavy Ball vs duplicate Mimikyu/Dialga

**28 Nov 2026; exact combinatorics, 15/15 source tests, not a matchup win-rate simulation.**

## Precise decision for the two existing unchanged candidate 60s

Both Hood Shield and Lockbridge have 60 cards, **14 Basic Pokémon** including the **three singleton Basics** Mimikyu GRI58, Dragon Dialga-GX UPR100 and Radiant Eternatus CRZ105, plus **one Hisuian Heavy Ball ASR146**. These three exact Basic Pokémon together enable the *specific* counterline against an opposing Regidrago VSTAR SIT136 which previously used Apex Dragon: Mimikyu Copycat → copy Apex → Timeless-GX (150/extra turn) → next-own-turn Copycat → copy Apex → Power Beam (200). The line is **conditional, not the only way to win**. All reported percentages concern the probability that opening Prize placement makes this *particular* three-Basic source core **unrecoverable using only unprized Heavy Balls before taking Prizes**.

The first exact singleton model established the 4.495% Prize-only failure with one Ball. The follow-up model now tests which **single new deck slot** would most reduce that tail if a non-Basic were replaced (without claiming that doing so strengthens the deck overall):

| Deck variant (hypothetical except current row) | Basic Pokémon | Heavy Ball | Triple-core Prize-only unrecoverable |
| --- | ---: | ---: | ---: |
| **Current 60**: Mimikyu×1, Dialga×1, Radiant Eternatus×1 | **14** | **1** | **4.495153%** |
| Replace one non-Basic with **second Heavy Ball** | 14 | 2 | **0.521932%** |
| Replace one non-Basic with **second Mimikyu** | 15 | 1 | **2.527317%** |
| Replace one non-Basic with **second Dialga-GX** | 15 | 1 | **2.527317%** |
| Use **two slots**: second Mimikyu or Dialga **and** second Heavy Ball | 15 | 2 | **0.236783%** |

Under this exact isolated event the two-Ball route reduces failure by **3.973221 percentage points**, whereas duplicating either of those Basic payloads reduces it by **1.967836 points**. The **additional Prize-only reduction** offered by the Ball route is **2.005385 points**. That does **not** mean the Ball is the better in-game deck edit: the second Basic improves how often a relevant Pokémon is naturally drawn, may change mulligans, might occupy Bench space, and has other strategic uses. The second Ball may be unable to rescue anything because of access/Item lock/discard/Supporter contention. Multiple ways to win or Prize-taking can make this tail irrelevant in a real game. No proposed candidate sixty was changed.

**Do not add a second Radiant Eternatus.** Although treating it as a mathematical two-copy core produces a symmetric number, **Radiant Pokémon Rule permits only one Radiant Pokémon in a deck**, so that row is **not a legal counterfactual** and is intentionally excluded from the slot table.

## Exact probability model and validation

Draw 7 opening cards uniformly from 60 **conditioned on at least one Basic**, since hands with no Basic mulligan. Then uniformly put 6 Prizes from the remaining 53 cards. Let `c_i` count interchangeable copies of each required Basic group (Mimikyu/Dialga/Radiant) and `h` count unprized Hisuian Heavy Balls. A group is inaccessible through Prize recovery when **all `c_i` copies** are Prized. Every unprized Ball can rescue one of those groups by swapping itself for one Prized Basic. Therefore this limited rescue model fails exactly when

\[
\#\{i:\text{all copies of critical group }i\text{ are Prized}\}>
\#\{\text{Heavy Balls not Prized}\}.
\]

`simulation/evaluation/2026-11/agent47-grouped-basic-prize-access.cjs` enumerates each opening-hand distribution by critical group, Heavy Ball, other Basics and other non-Basics; then every corresponding Prize distribution using **BigInt exact binomial coefficients**. It normalizes over *all* legal Basic-containing opening hands and all six-Prize subsets of the remainder. Crucially, adding a second Mimikyu or Dialga increases Basic count **14→15** and therefore changes the valid-opening conditioning; it is not equivalent to simply making the singleton unprizable. The enumerator checks its weighted partition equals `(C(60,7)-C(60-basics,7))*C(53,6)` exactly.

`simulation/evaluation/2026-11/agent47-grouped-basic-prize-access.test.cjs`: **15/15 actual source-executed V8 CommonJS test callbacks**, including parity with previous singleton model at Balls 0–4, exact critical-group probabilities, symmetric Mimikyu/Dialga copies, first and second Ball value, tests of valid-opening rate, group count sum and input invalidity. An **independent pure Python exhaustive enumeration** over every category hand/Prize composition separately reproduced key grouped probabilities, not using the JavaScript implementation. No Monte Carlo, no card-search shortcuts, no game play.

## Limits and future experiment

This is a transparent necessary **opening Prize-only** card-access gate, not a full feasible ALS probability and emphatically **not a 99.5% field win result**. It assumes the legal card text of Hisuian Heavy Ball ASR146 and no conditional Prize reveal, opening mulligan bonus card effects or normal Prize-taking, and treats any unprized Ball as accessible—an *optimistic* access assumption. A real comparison must evaluate the removed slot, access to second Ball, opponent Item lock, whether the source opponent uses Apex, and all 32 individual matchups. In the authenticated field nine Regidrago source ranks (10,12,13,14,18,20,21,27,32) have UPR100 Dragon Dialga and Apex, but three source ranks 23/25/28 are unavailable.

**Decision:** this mathematical tradeoff supports an **experiment candidate**, not an automatic deck change. For a single-slot deck search limited to reducing this exact rare tail, second Heavy Ball dominates second Mimikyu or second Dialga by 2.005385 percentage points; real deck optimization requires full-stack tests.

— Agent47
