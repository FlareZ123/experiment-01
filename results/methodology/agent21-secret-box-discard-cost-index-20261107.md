# Agent21: owner-visible Secret Box discard-cost index for root93

**Initial 7 November 2026 result.** Pure owner-policy experiment, 8/8 local Node tests. At initial publication there was no native Store run or competitive game qualification; the follow-up below records later evidence and corrections.

## Question

The archived New Moon owner root93 has a ten-card hand: two Battle VIP Pass, two Rescue Carrier, Secret Box, Powerglass, two Lillie's Determination, Forest Seal Stone, and Mysterious Treasure. Active Unown AOR has no Energy. Two Basic Psychic Energy from an earlier Unown Knock Out are in the owner's discard. Mewtwo & Mew-GX is Benched. The source Active Trubbish FST has 60 damage on 70 HP. See the [root93 response-tree synthesis](agent36-root93-rank11-response-tree-synthesis-20261107.md#frozen-state-and-evidence-anchors).

The current [Agent43 adapter](../../simulation/twinleaf/agent43-owner-secretbox-fog-ko.cjs) hardcodes a physical payment of two Battle VIP Pass plus one Rescue Carrier. That is a valid three-card payment when the prompt offers those objects. It does not evaluate the remaining value of the two recovery Items or the second Lillie's Determination.

A second payment is worth testing: discard both spent VIP Passes and one Lillie's Determination. The owner keeps both Rescue Carrier and one Lillie for a draw after Secret Box. Since Secret Box is an Item, Lillie can still be played in the same turn if the Supporter allowance remains available.

## Method

Added the research-owned CommonJS module [agent21-secret-box-dci-payment.cjs](../../simulation/twinleaf/agent21-secret-box-dci-payment.cjs). It enumerates every three-card combination from the actor's own hand and assigns an ordinal discard-cost score. Lower scores represent cards that appear safer to spend in the current state.

The New Moon policy uses these starting weights:

| Card / state | Base discard cost | State adjustment |
| --- | ---: | --- |
| Battle VIP Pass FST | 12 | 0 after global turn 2, when both seats have had a first turn |
| Lillie's Determination M1L | 6 | -2 for another copy in hand; -1 if a Supporter has already been played this turn |
| Rescue Carrier EVS | 8 | -2 for another copy; +3 if a Pokémon with 90 HP or less is in the public discard |
| Powerglass SFA | 10 | +2 if Basic Psychic Energy is in the public discard |
| Forest Seal Stone SIT | 12 | None |
| Mysterious Treasure FLI | 7 | None |
| Ace Trainer AOR | 8 | None |
| Sky Field ROS | 8 | None |
| Field Blower GRI | 8 | None |
| Fog Crystal CRE | 7 | None |
| Other cards | 10 | -2 for another copy in hand |

The maximum accepted three-card cost is 11. These are ordinal heuristic weights. They are not probabilities, measured card values, or a learned policy. The model reads only the owner's hand, public discard, and turn resources. It does not read the owner's hidden deck, Prize identities, or any opponent hand/deck information.

At a real prompt, the selector requires the exact Secret Box TWM source, the prompted owner, CHOOSE_CARD_TO_DISCARD, a native min/max of exactly three, three distinct physical objects, membership in the offered prompt and owner's hand, the existing secretBoxPaymentNegative paper guard, and a successful native prompt.validate result. A missing or invalid payment returns null so the caller can delegate or decline its proposal.

## Result on the archived owner-hand fixture

The minimum-cost plan is:

1. Battle VIP Pass FST
2. Battle VIP Pass FST
3. Lillie's Determination M1L

**Local pure tests:** 8/8 passed.

The modeled payment score is **4**. The current hardcoded VIP/VIP/Carrier payment scores **6** when no eligible Pokémon recovery target is in discard. If a recoverable low-HP Pokémon is present, the Carrier score rises to 9 and the difference becomes five ordinal units.

The proposed payment leaves both Rescue Carrier copies and one Lillie's Determination in hand. It also preserves Secret Box, Powerglass, Forest Seal Stone, and Mysterious Treasure. The two Basic Psychic in discard make Powerglass more valuable under this model.

This enables a useful untested hybrid branch:

1. Pay Secret Box with VIP/VIP/Lillie.
2. Search Fog Crystal, Powerglass, Ace Trainer, and Sky Field from the four separate Secret Box categories, subject to the genuine prompt's physical offers and validator.
3. Play the remaining Lillie's Determination and observe its actual eight-card draw.
4. Use Fog Crystal for a live Basic Psychic target, attach to Unown, and attempt Hidden Power against the damaged Trubbish.
5. Preserve all drawn Field Blower copies for the source's subsequent Garbodor/Float Stone response, if available.

The Box search cannot fetch both Fog Crystal and Field Blower in the same effect because they are both Items. Lillie's draw is the proposed second access channel. The four-category target availability, the Lillie draw, the candidate's post-draw hand, and the source retool remain to be observed in a same-deal native run.

## Reproducibility

- Module: [simulation/twinleaf/agent21-secret-box-dci-payment.cjs](../../simulation/twinleaf/agent21-secret-box-dci-payment.cjs)
- Tests: [tests/agent21-secret-box-dci-payment.test.cjs](../../tests/agent21-secret-box-dci-payment.test.cjs)
- Runtime: Node v22.16.0, node --test.
- Test cases cover the exact ten-card owner-hand fixture, the three distinct physical objects, native prompt source/owner/stage/min-max checks, duplicate-card alternatives, live Rescue Carrier targets, Powerglass recovery value, Supporter usage, the global-turn VIP boundary, and refusal to inspect hidden deck, Prize, or opponent state.

## Limits and next step

The DCI weights are a human-authored starting prior. The test uses a detached prompt fixture and the existing paper-payment predicate. No Twinleaf Store was started, no native Secret Box payment was executed, and no full game was completed. The proposed hybrid may still fail because a category target is absent or Prized, the Item or Supporter is locked, the Energy attachment is already used, or the source's response removes the candidate's advantage. The New Moon list remains an unqualified English mechanics proxy. No candidate deck is promoted.

The originally proposed same-deal A/B is superseded by Agent44's randomized Lillie-versus-Box native probes and the collective root93 freeze directive. Do not add another root93-specific variant. The four seeded Lillie arms each reached the same KO-and-Prize checkpoint, but none completed the source promotion and subsequent turn; this remains a tactical prompt witness, not a matchup result.

The collective status remains 29/32 authenticated original opponent lists, zero competitively qualified games, no selected final deck, and no demonstrated 99.5% win rate.


## Follow-up: native payment witness and DCI correctness corrections (7 November 2026)

Agent4's isolated manual native run [42357190204](https://github.com/FlareZ123/experiment-01/actions/runs/42357190204) compiled the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and passed the Agent21 DCI payment test in both physical seats. It confirms the real Secret Box discard prompt, native validator acceptance, three distinct physical discards, payment settlement, retained hand resources, and the next Secret Box search prompt. It does not execute Lillie, settle the four-category search, complete a game, or establish strategic optimality.

The first DCI implementation had two correctness defects:

1. Its duplicate-copy discount was computed independently per card from the pre-payment hand. It therefore discounted every selected copy even when the payment discarded the entire printing set. The v2 selector now counts selected copies by `fullName` and grants the discount only if at least one physical copy remains after the complete three-card payment. A single-card cost query retains its original interpretation by defaulting to the number of other copies in hand.
2. The cost table used `Ace Trainer XY7`, while the pinned Twinleaf fullName is `Ace Trainer AOR`. The policy now uses the actual AOR printing key.

The v2 pure tests cover the three-copy all-selected counterexample (no discount), the two-of-three payment (one remaining copy preserves the discount), permutation invariance across identical physical copies, and the exact Ace Trainer printing key. The scalar weights remain heuristic priors, not measured card values or an optimized policy.

Agent44's separate seeded Lillie/Box probes are preserved in `results/methodology/agent44-root93-lillie-versus-secretbox-randomized-20261107.md`. Agent41's source-response review identifies the subsequent Garbotoxin/Float Stone branch as unresolved. Critic's 07:33 broadcast and Agent36's steward memory explicitly freeze root93 as a retrospective regression fixture. Preserve all existing artifacts; do not create another root93 workflow or infer a full-match result from the one-Prize checkpoint.

The broader benchmark remains 29/32 authenticated original opposing 60-card lists, zero competitively qualified games, no selected final fixed 60, and no demonstrated 99.5% win rate.
