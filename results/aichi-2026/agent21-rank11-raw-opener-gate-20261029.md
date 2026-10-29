# Agent 21: rank-11 opener direct-hand prerequisite is exceptionally narrow

**29 October 2026 | exact combinatorial card-location diagnostic, not a win-rate estimate.** This audit tests the predicate in [rank11-autonomous-opener.cjs](../../simulation/twinleaf/rank11-autonomous-opener.cjs) against the fixed Aichi rank-11 Wataru Yano [source 60](full-decklists.json). It does not recreate the full bilateral actor or infer any competitive game outcome.

## Mechanism

The existing narrow `openingOpportunity(...)` requires, at inspection, **Active Oranguru V**, **Battle VIP Pass** and **Float Stone** in the owner's hand, a free Bench, unused VSTAR, and no Trubbish already Benched. It also *rejects* a hand already holding **Forest Seal Stone** or **Boost Shake**, even though these may directly advance the same lock. The eleven-action chosen sequence is VIP → Trubbish; Back Order → Forest Seal; Star Alchemy → Boost Shake; Float Stone → Trubbish; Boost Shake → Garbodor. This chain has been observed in a real native Store on an earlier selected source deal. The exact published 60 has **2 Oranguru V, 4 VIP Pass, 3 Float Stone, 2 Forest Seal Stone, 2 Boost Shake, 11 Basic Pokémon total**.

## Exact direct card-location calculation

Draw an unordered starting seven, then one ordinary turn-start card uniformly from the remaining 53. Randomly setting six Prizes in between does not alter the unconditional eighth-card distribution. Condition on an initially **Basic-valid** seven (exclude opening mulligans). Require at least one Oranguru V *in the original seven*, allowing it to be selected Active, and at least one VIP and Float among the eight cards. The original strict event also has zero Forest Seal Stone and Boost Shake among the eight. This models a **raw hand without intermediate searches, draw effects, or setup decisions**.

Enumerate all original-seven group counts `(o,v,f,b,z)` from populations `(2,4,3,4,47)` with exact integer weight `C(2,o) C(4,v) C(3,f) C(4,b) C(47,z)`. For each eighth-card group, multiply by the remaining number of copies. Total possible (seven-set, eighth-card) outcomes: `C(60,7)*53 = 20,468,966,760`. Valid-Basic original-seven denominator: `(C(60,7)-C(49,7))*53 = 15,916,235,808`.

| Direct eight-card location event | Exact favorable outcomes | Probability given Basic-valid original seven |
| --- | ---: | ---: |
| Strict v1: starting Oranguru, VIP + Float by eighth card, neither Forest nor Boost | 361,972,450 | **2.27423402%** |
| Relax only the no-held-Forest/Boost gate | 539,236,466 | **3.38796480%** |
| Hands excluded solely by that additional hand condition | 177,264,016 | **1.11373077 percentage points** |

Unconditional strict event across all original-seven-plus-next-card samples: **1.76839630%**. Even when the event occurs, the actor must select Oranguru Active and pass other public-board checks. Other legitimate paths may draw/search first, use already-held Boost Shake / Forest Seal Stone, start with another Pokémon, or receive mulligan bonus draws. Thus **2.274% is a baseline for this narrowly specified raw eight-card event, never a ceiling on playable lock access or a matchup-win probability**.

## Impact on the fresh cohort

[Agent 41's independent pre-registered 32-arm native scout](agent41-prospective-canonical-scout-native-20261029.md) observed rank-11 Boost Shake wrapper completion **2/16**, both on one paired seed, and **zero in its 12 source-first arms**. This is unsatisfactory source-pressure coverage, but absent evidence of *why* each own-information opportunity failed, zero in such a small paired cohort does not separate missing-card information states from flawed policy decisions. The source-first arms are not twelve independent opening hands.

**Next falsifiable shared-runner step:** at rank-11 owner decision boundaries in global turns 1/2, record the exact owner-visible reason the existing predicate passes/fails: real Active, free Bench, VIP/Float/Forest/Boost in hand, VSTAR spent, Trubbish already Benched, and whether previous legal search/draw changed the hand. Then classify legal alternates for already-held setup cards and alternative starters, preserving natural owner choices, opponent response, source timing, all capped/error arms, frozen policy version and source-deal receipts. Route improvements to the **existing common policy**, with a fresh preregistration before competitive comparison. Do not spin another selected-seed win branch.

**Reproduction:** [pure BigInt binomial regression](../../tests/agent21-rank11-raw-opening-gate.test.cjs) reads the original source 60 and checks three invariant/probability assertions. Local Node v22.16.0 executed all **5/5 passing** tests against an independently constructed exact-count rank-11 fixture, with the combinatorics also cross-checked by a separate Python calculation. These checks validate the arithmetic; no new native engine run or paper-game qualification is claimed.

## Independent alternative: direct held Boost Shake + any Tool

The original 60 permits a much simpler **candidate** branch that bypasses the Oranguru-first, VIP-plus-Float, no-held-Boost predicate: hold **Boost Shake**, attach a **Pokémon Tool** to a Trubbish available by hand, Battle VIP Pass or Quick Ball, and evolve into Garbodor. A direct Tool can be Float Stone (3), Muscle Band (1), or Forest Seal Stone (2). The original printed Forest Seal Stone permits attachment to any Pokémon without an existing Tool; only its `Star Alchemy` use is restricted to a Pokémon V. Garbotoxin merely requires a Pokémon Tool attached, independent of whether that Tool's other effect can be used. Attaching Forest Seal to Garbodor spends its better potential role on a V, a material tactical tradeoff.

A separate exact enumeration partitions the actual source as **Trubbish 2; other Basics 9; VIP 4; Quick Ball 4; Boost Shake 2; attachable Tools 6; other 33**. After an original Basic-valid seven and one turn draw, require at least one Boost, at least one attachable Tool, and at least one Trubbish/VIP/Quick.

| Alternative raw eight-card screen | Favorable ordered outcomes | Basic-valid probability |
| --- | ---: | ---: |
| Held Boost, any Tool, and Basic Pokémon search/Trubbish access | 1,422,950,438 | **8.94024476%** |
| Same, additionally a *non-Trubbish Basic* already in original seven for a separate Active | 1,192,975,377 | **7.49533615%** |

This screen **does not prove a legal completed opening**: Quick Ball must have a genuinely discardable second hand card and an unprized Trubbish search target, VIP is usable only on that player's first turn, and the actual board must permit the intended attachment and evolution before Boost Shake ends the turn. It does not confirm the original Store's card implementation, opponent counterplay, or target competence. Its conditions overlap with the Oranguru gate; the 8.94% and 2.27% figures **must not be added** or interpreted as simulated lock probabilities. Neither is a complete source-line access model.

The arithmetic supplies a falsifiable design priority: on own-hand decisions, inspect direct held Boost+Tool+Trubbish/search opportunities before assuming all source lock play must route through Oranguru. Preserve the important multi-action-cost, discardability, and opponent-response qualifications, and test the actual printed line in the original native Store.

**Field status unchanged:** 29/32 original opposing sixties, missing ranks 23/25/28; zero qualified competitive games, no evidence-backed 99.5% list.
