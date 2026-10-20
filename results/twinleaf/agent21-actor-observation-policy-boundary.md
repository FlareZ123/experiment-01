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

## Independent pinned-engine acceptance, 20 October 2026

**The earlier pure-test-only limitation above is now partially superseded for the observation *input* itself.** [Manually dispatched GitHub Actions run 39353555620](https://github.com/FlareZ123/experiment-01/actions/runs/39353555620) **completed successfully** at Git revision `226cbc4bc246ce87ccf355a6764b416f86e018b4` with the pinned Twinleaf TypeScript engine built. The [isolated real-Store projection parity observer](../../simulation/twinleaf/actor-observation-live-audit.cjs) and [compiled canonical four-arm runner](../../simulation/evaluation/agent21-actor-observation-compiled.cjs) exercised the original **rank6/rank11 champion/New Moon historical physical deal fixtures** without changing the source policies or candidate 60s. A new opt-in job in the existing manual-only [hidden-information workflow](../../.github/workflows/twinleaf-hidden-information.yml) runs these acceptance checks. Local pure tests and CI passed **10/10** tests, covering the base seven actor-view invariants plus three observer/Store-restoration controls.

The compiled execution reported **4 genuine games**, **842 real Store dispatches**, **834 actor-view parity checks**, of which **520 checks occurred during pending owner-prompt episodes** (these counts describe observations, not distinct native prompts). For each such pre-dispatch decision boundary, the actor-only view from the actual Store was deeply equal to a structural shadow whose opponent hidden hand/deck/Prize and owner's own face-down deck/Prize identities were replaced by count-only facades. A separate unchanged-control invocation reproduced **all four entire canonical result rows** exactly, including root histories, source physical-deal fingerprints, settled attack effects, actions, terminals and caps. The observer restored the Store method after completion. Machine-readable output [artifact 12233743596](https://github.com/FlareZ123/experiment-01/actions/runs/39353555620/artifacts/12233743596), uploaded ZIP SHA256 `e9bd4ca7bb6a2294c062bcf1142cff05997d46650d1f84760a394d28ae944ecd`; [test source](../../tests/actor-observation-live-audit.test.cjs). This is strong read-only **input-boundary** evidence. The native bot still evaluates actions with its complete physical State, so this check does **not** establish full-policy information-set fidelity, strategic competence or a win rate.

An additional focused [owner-K1 selection evidence helper](../../simulation/twinleaf/actor-k1-search-selection-audit.cjs) with [four pure tests](../../tests/actor-k1-search-selection-audit.test.cjs) separately captures exact printed deck counts and native singleton selection validity **only after a real actor-owned pending own-deck prompt is authenticated by the Store caller**. Its intended test is the rank6 New Moon zero-attacker, 260-root historical censor: distinguish an accessible Mewtwo/Energy line from card-availability failure at the first truly observed deck search. This K1 helper has pure-test coverage as of the above commit, but is not yet integrated into the compiled Store observer and has no real-root output at this point. Candidate utility and subsequent legal attachment/attack decisions remain to be established.

**Benchmark unchanged:** 29/32 complete exact Top32 opponent 60s; zero competitively qualified games, no 99.5% success claim.
