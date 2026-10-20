# Actor-only exact-printing observation contract for shared policy design

**Agent 21, 20 October 2026 UTC. Evidence class: executable pure Node decision-input invariants, without live Store integration or competitively qualified games.**

## The immediate policy blocker

The pinned default `SimpleTacticsAi` evaluates some candidate actions using concealed opponent information, as demonstrated by Agent 23's [six-world whole-bot action-choice regression](rank11-full-bot-hidden-hand-pair.md) and Agent 10's [Perfection decision reversal](perfection-hidden-state-action-choice-reversal.md). The canonical four-arm bilateral v2 runner still advertises `hiddenInformationSafe:false`. Agent 41's [genuine prompt-closed candidate-attack packet](../aichi-2026/agent41-canonical-integrated-settlement-20261020.md) establishes meaningful source-dealt attack effects, while the rank-6 New Moon cap shows zero converted attacks under the current generic decision policy. A whole-bot policy replacement must have a reproducible, explicit actor-information input boundary.

## Implemented API

- [`simulation/twinleaf/actor-observation-contract.cjs`](../../simulation/twinleaf/actor-observation-contract.cjs), Git blob `28932e140b98f097fdaa81373598339f1105c574`, exports `actorObservation(state, seat, {ownerK1Snapshot})` and supporting face-up-zone projection helpers.
- [`tests/actor-observation-contract.test.cjs`](../../tests/actor-observation-contract.test.cjs), Git blob `9fc9eaaafe2e359f543818f9a37f6678611c9443`, has **7/7 passing local Node tests** on the exact committed bytes and relative paths. This is a pure stubbed engine-shape test, not a compiled Twinleaf test. No Actions workflow was added.

The returned value is a detached, deeply frozen plain object with exact printed card identifiers and printed attack names/costs for both visible boards; public discard/Lost Zone/Stadium/Supporter cards; each side's hand/deck/Prize **counts**; the actor's own hand **identities**; publicly enforced player play-lock flags; and the actor's optional, explicitly supplied K1 snapshot. It also labels ordinary owner roots versus owner-authenticated pending choice prompts. For a prompt, acting-seat ownership is established by `prompt.playerId` even when the other player owns the active turn.

Neither owner's physical deck/face-down Prize card identities nor the opponent's hand, deck or Prize card identities are ever read. The object does not retain references to native `State`, `Player`, `Card` or `Prompt` objects that could be traversed to circumvent the contract. Exact printings distinguish visibly different Garbodor variants, Tools and attack-payload cards.

## Falsification controls

The seven local tests require:

1. Retained owner/public printed information and detached, frozen nested arrays.
2. Identical observations after changing only concealed opposing hand/deck/Prize identities or hidden order. Changing the **face-up** Garbodor BKP to LTR must change the observation.
3. Identical K0 observations after changing only the actor's own still-unseen deck and Prize identities.
4. Successful projection when every prohibited hidden card array is a hostile `Proxy` that throws upon any operation beyond `.length`.
5. External K1 snapshot detached from later mutations, and no K1 invented by default.
6. Prompt-owner turn-crossing semantics that reject observation by the wrong seat.
7. Rejection of invalid actor seat, wrong root owner and corrupt K1 epoch.

The executable does not infer K1 from a physical search itself. The existing [owner-K1 deck membership ledger](../als/agent41-owner-k1-deck-membership-feasibility.md) is the appropriate source, provided its update is authenticated at the real Store prompt and later transfers are tracked or invalidated.

## Actionable canonical integration

For **new policy components**, bind `actorObservation` to the actual acting seat at the genuine headless decision boundary; pass only this projection to the search/evaluation routine, which emits an abstract intent such as `play-held-Item`, `choose-prompt-printings` or `attach-to-public-slot`. Translate the intent back into the **real** native `PlayCardAction` or `ResolvePromptAction` and validate it against the genuine Store/prompt *after* the decision. Keep owner K0 search decisions separate from K1 owner-deck search prompts and invalidate stale K1 after unknown transfers. A policy evaluator must not be given the native `state` as an extra argument or close over it.

**Next falsifier:** insert this boundary as an opt-in decision input into Agent 41's single existing shared candidate wrapper, first on the four retrospective rank6/rank11 arms. Compare the actor-owned visible projections under source-hidden permutations and replay actual Store choice/effect/next-source roots. Re-run the specific rank-6 zero-attacker setup failure and source-first equipped-Garbodor response under that common algorithm. Use the same unchanged candidate 60s and paired physical deals. Do not open prospective v2 outcome sampling until the full bot, delegated Perfection choices, opponent policy, paper effects and clock all qualify.

**Limits:** The current generic Twinleaf policy still sees full `State`; this module is an API and security invariant for future actor-only subpolicies, rather than a change to the historical games. It has not been compiled or tested against pinned Twinleaf object prototypes, and `ownerK1Snapshot` authentication remains the caller's responsibility. Passing these seven tests cannot prove arbitrary downstream choices information-safe, legal, strong or timed. As of this report, **29/32** exact source 60s, **zero** qualified competitive games and no evidence for the 99.5% target.
