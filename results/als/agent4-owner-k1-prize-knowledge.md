# K0→K1: an owner-authenticated, fail-closed Prize-belief primitive

**Agent 4, 21 October 2026.** Pure-test and integration-boundary research; no new source game, competitive outcome or prospective seed. The fixed-60 Aichi objective remains at **29/32 exact opponent lists**, **zero competitively qualified games**, and no credible 99.5% result.

## Context

Two previous original-source observations establish the need:

- [Rank24 Tag Call → Guzma & Hala](../aichi-2026/rank24-native-k1-owner-search-policy-failure.md) shows a physical owner search that revealed the singleton Thunder Mountain Prism Star missing, followed by a scripted Supporter plan still depending on it. This is a decision-memory failure.
- [Rank26 first Battle VIP Pass](../aichi-2026/rank26-native-second-vip-after-squawk-20261020.md) has a read-only direct singleton Double Colorless Energy zone helper. A new native runner assertion consumes that information across forks but awaits compiled CI validation after a workflow dispatch was blocked.

A player can inspect their own deck during an authentic deck search and infer Prize identities from the known registered 60 and their own visible zones. K0 cannot use this information before the first search.

## Reusable implementation

Source: [owner-k1-prize-knowledge.cjs](../../simulation/twinleaf/owner-k1-prize-knowledge.cjs). Regression tests: [agent4-owner-k1-prize-knowledge.test.cjs](../../tests/agent4-owner-k1-prize-knowledge.test.cjs). This uses CommonJS with JSDoc outside the vendor module.

The captureOwnerK1 entry checks the **live unresolved ChooseCardsPrompt**, acting owner identity, and exact **prompt.cards === owner.deck** reference before reading deck printings. It then obtains the standard detached [actorObservation](../../simulation/twinleaf/actor-observation-contract.cjs). A test seam may inject a fixture observer.

The frozen snapshot includes a knowledge epoch; original registration and last-searched deck printing multiplicities; inferred Prize multiset *only* when all 60 registered cards are accounted for by the current deck, owner's hand and face-up zones, and remaining Prize count; a certification Boolean; and search-turn/prompt provenance. It never inspects face-down Prize identities or opponent private cards. Incomplete zone accounting fails closed to an unknown Prize composition.

The assessRequiredDeckPrinting method reports **known-prized only when every registered copy** of a printing is certified in Prizes. A partly Prized two-copy card cannot produce this verdict. Other states return unknown; physical search availability must be re-evaluated after later deck movements.

The advanceOwnerK1 method tracks stale deck membership separately from retained known-Prize deductions. Its caller **must explicitly flag** any possible deck mutation and any possible Prize-composition mutation, including exchanges preserving the Prize count. Missing either transition flag raises an assertion. A changed Prize composition invalidates the earlier Prize inference. A fresh authenticated search can re-establish it.

This is a knowledge and potential plan-veto primitive, **not** a decision policy or proof that an alternate Supporter would win. Native Store remains the source of move legality.

## Validation boundary and next gates

**Seven pure tests passed locally in this invocation under Node 22.** They cover both actor seats, K0 refusal, Prized and available singleton cases, a multi-copy partial-Prize false-positive, opponent concealed-zone variations, owner-deck ordering, incomplete accounting, Prize taking/same-count swaps, and evolution/attachments. The committed repository revision has **not** been compiled or tested in GitHub Actions and has **not** been run against the pinned Twinleaf engine (a9905a76a6c4103ba4b6cb9a49e86bad795c5c05). No competitive games qualify.

Follow-up should (1) validate 60-card conservation during real Store owner searches, including Items/Supporters temporarily in resolution zones; (2) reproduce rank24 negative seed 2966203069, where Tag Call reveals Thunder Prized, and the separate rank24 positive seed 2804067880; (3) audit rank26 actual first VIP K1 83:B without peeking at hidden Prizes; (4) integrate this strictly opt-in epoch into Agent41's common both-seat actor policy, including every relevant Prize-mutation invalidation; (5) only then test whether a legal alternative action produces a more competent source/opponent response. Preserve original control roots and failed outcomes throughout.

Missing source lists 23/25/28, paper-clock rules, complete opponent competence and Japanese legality remain independent open requirements.
