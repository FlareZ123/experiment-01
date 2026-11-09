# Two-action Basic shortfall rescue: pay Retreat, promote funded attacker

**Agent 2 | 9 November 2026 | paper Expanded developmental policy, default OFF**

## Implemented gameplay improvement

The common actor can strand an already funded Bench attacker because its Active Pokémon cannot pay Retreat. The prior policy treats the Basic Energy attachment as attack funding only, while paid-retreat planners generally require the fee already attached. The new source-independent owner-only bridge joins both resources into one immediate two-root plan:

1. The live Active has a printed fee of **one or two Colorless Energy**, has exactly one Basic Energy short of that printed fee, and a Basic Energy in the owner's visible hand can pay the shortfall.
2. A Benched attacker already has known Basic Energy satisfying a fixed printed nongeneric attack of at least 80 damage, with no visible immediate attack restriction. The Active cannot use any currently payable attack, and the held Basic would not make a printed Active attack payable.
3. The actor proposes a normal **attach Basic to Active** action. The genuine pinned Store determines its legal outcome. On the next detached owner-root observation, if the fee is fully paid in physical Basic cards, the actor proposes **paid Retreat into the funded Bench**. The regular attack chooser handles the resulting Active separately.

This is **one Basic short of a fee**, rather than arbitrary acceleration over several turns. The two action types are already supported by the common actor's physical native action constructor. The bridge is controlled by `retreatFundingBridge:true`; omitting the flag preserves the existing policy and source behavior.

The planner refuses active-position lock loss, visible opponent retreat blockers, Asleep/Paralyzed, used attachment or retreat quota, active Tools, insufficient or unknown Special Energy payment, any payable Active control/GX attack, and any newly payable Active attack after using the held Basic. It vetoes redundant payment when an observed Skyliner makes a Basic Active's Retreat free. The genuine Store remains the arbiter of continuous effective-cost modifications. Printed-attack threshold 80+ is a conservative *opportunity screen*, not a guarantee of tactical superiority.

## Code

- [Owner-only v2 bridge](../../../simulation/twinleaf/2026-11/agent2-retreat-funding-bridge.cjs)
- [Canonical shared actor opt-in](../../../simulation/twinleaf/agent34-actor-only-root-policy.cjs)
- [Full native original-deal runner option](../../../simulation/evaluation/agent41-bilateral-v2-development.cjs)
- [Pure bridge contracts](../../../tests/2026-11/agent2-retreat-funding-bridge.test.cjs)
- [Canonical actor off/on contracts](../../../tests/2026-11/agent2-retreat-funding-actor-integration.test.cjs)
- [Original physical two-seat Store fixture](../../../tests/2026-11/agent2-retreat-funding-two-action.native.test.cjs)
- [Four original source-deal A/B runner](../../../simulation/evaluation/2026-11/agent2-retreat-funding-original-source.cjs)
- [One-button existing manual CI workflow](../../../.github/workflows/agent36-bilateral-competence-v9.yml), with inputs `agent2_retreat_funding_native` and `agent2_retreat_funding_original_source`; does not install a new push-triggered workflow

## Native results

**One-unit fee V1:** [GitHub run 42590813440](https://github.com/FlareZ123/experiment-01/actions/runs/42590813440), completed successfully **16/16** contracts. In both Store physical seats, a staged Dedenne GX UNB Active with no attached Energy paid its one-unit retreat using the exact Psychic Basic from hand. Dialga-GX UPR, already funded by three attached Energy cards, was promoted and `Shred` dealt 80 native damage. The exact payment entered the owner's discard pile; the promoted attacker preserved its original cards.

**Two-unit fee V2:** [GitHub run 42593450741](https://github.com/FlareZ123/experiment-01/actions/runs/42593450741) proved **all four** native Store fixtures: Dedenne-GX one-unit fee and Genesect V FST two-unit fee, each in physical seats zero and one. Every fixture accepted the new Basic attachment, paid the entire fee using original physical Basic cards, promoted Dialga-GX with its existing Energy intact and resolved `Shred` for 80 damage. The overall run's **20/21** test outcome was marked failed due to a *pure fixture expectation*: its two-unit unit test unexpectedly funded the Active's attack, so the guarded planner correctly abstained. Corrected fixture commit `29a5d6f`. The [final native V2 run 42593810427](https://github.com/FlareZ123/experiment-01/actions/runs/42593810427) subsequently **passed 21/21 tests with zero failures**, including all four real Store attachment, original Basic payment, paid retreat, and `Shred` continuations.

**Original field source, v1:** [GitHub run 42591867258](https://github.com/FlareZ123/experiment-01/actions/runs/42591867258) executed **four previously registered** rank11/13 original Aichi fixed-deck physical deals in two A/B policy conditions, eight native attempts. Every complete pair preserved identical source and candidate 60s and a matching physical opening. **No game selected the new bridge**, and no public root or attachment target changed in the three complete comparisons. Three pairs finished natively in both arms; rank13 seat A produced the *same engine error in both arms*. These four deals show neither utility nor a negative win-rate impact: the policy was inactive. The first report accidentally dropped the actor audits when compacting native rows; a corrected comparator preserves those audits and flags, and distinguishes the symmetric pre-audit engine abort. Its scope is developmental, zero competitively qualified paper games.

**Original field source, v2:** [GitHub run 42594327552](https://github.com/FlareZ123/experiment-01/actions/runs/42594327552) completed successfully with **6/6 source-comparison contract tests passing** and eight more matched native game attempts using the two-unit-aware planner. Three original-deal pairs have authenticated actor flags, **identical full 60s**, and matching native physical deals, all with **zero bridge selection and zero policy-caused first root or target divergence**. The fourth pair is the same symmetric rank13 engine abort before actor/deck audits, reported separately as a non-comparable error. The complete-deal gate passed. The aggregate booleans for *all four* flags and SHA256 fields are correctly **false** because aborted games cannot attest missing fields, so only the three complete pairs are admissible for causal comparison. Native terminal wins are unchanged on those three, with no competitive game qualification.

## Direct next research question

Find naturally encountered original-source roots with an already funded positive-damage Bench attacker, held Basic Energy, and a stranded Active exactly one Basic short of one-/two-unit retreat. Run **only a matched same-physical-deal A/B follow-through and opponent response** after that opportunity is genuinely observed. The 29 admitted exact original Top32 60s remain unchanged in this work. An inactive source pair does not warrant another indiscriminate field panel.

**Status:** mechanically viable under the pinned native Store. Actual competitive impact unmeasured. **No paper win-rate or 99.5% claim.**
