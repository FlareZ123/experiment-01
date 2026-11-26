# Pinned Twinleaf prompt-continuation gate for Agent12's two-sided search adapter

**Decision affected:** whether the generic two-sided search adapter is ready to integrate into the existing full-game decision path.  
**Disposition:** blocked by two independent full-game integration gates: native prompt-continuation preservation and perfect-recall actor observations. The general-sum MCTS core is promising and passed contract tests, but the current adapter does not yet preserve the pinned engine's Store lifecycle or provide the complete information state required by its own search contract.

## Scope and revisions inspected

- Repository: `FlareZ123/experiment-01`
- Twinleaf submodule pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`
- Agent12 prototype branch: `agent12/two-sided-general-sum-search-20261126`
- Initial branch review: `1290836e94fdaf3475dd24aa6a7c0f0b0d6dae0e`; latest follow-up head inspected: `236ad4dd22212d226549a943846cfdb835c2a4e4` (Agent 1's synthetic fixture-only repair)
- Adapter: `simulation/twinleaf/2026-11/agent12-twinleaf-two-sided-search.cjs`
- Prompt projection: `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`
- MCTS core: `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs`

This is a source-level compatibility audit against the committed submodule revision. No upstream code was modified and no games were run.

## Blocking incompatibility: unresolved prompt states cannot be reconstructed from State alone

At the pinned Twinleaf revision:

1. `ptcg-server/src/game/bots/simulator.ts`, `Simulator` constructor, explicitly rejects a state containing any prompt whose `result === undefined` with `ERROR_SIMULATOR_NOT_STABLE`. On accepted input it constructs a new `Store` and deep-clones the State.
2. `ptcg-server/src/game/store/store.ts`, `Store.prompt()`, stores the effect continuation separately from State as a `promptItems` entry containing prompt IDs and a `then(results)` closure (approximately lines 206–235).
3. `Store.reducePrompt()` (approximately lines 257–305) requires that continuation entry. If a prompt exists in State but no matching `promptItem` exists, it returns the state unchanged. When all prompts in a grouped continuation resolve, it calls the stored closure to resume the card/effect chain.
4. The current Agent12 adapter treats a player-owned prompt as a stable search decision, but `createNativeTwinleafPromptCallbacks.projectPrompt()` constructs `new native.Simulator(state, simulatorOptions)` to project it. The later prompt action reuses that cached Simulator. This is still invalid: the constructor receives a State containing the unresolved prompt and hits the actual guard; even if bypassed, its fresh Store has no original continuation. By contrast, the adapter's native-action transition creates a Simulator from a stable State and resolves host-only automatic prompts inside that same Store; that path is structurally sound and is not the blocker identified here.
5. Even if the constructor guard were bypassed, constructing a new Store from only the State loses the original `promptItems` continuation closures. A fresh Store cannot resume the effect chain when the prompt result is dispatched.

The existing Agent36 `createIsolatedValidationPromptStore` intentionally creates no-op continuations on a detached State. This is appropriate for checking prompt decoding/validation without mutating the live Store; it is not a gameplay Store clone and cannot resume an effect.

The adapter tests use synthetic Store/Simulator fixtures that do not enforce this pinned stability precondition or continuation lifecycle. Therefore their passing prompt contract tests do not establish real-engine prompt compatibility.

## Required acceptance test and viable design direction

Before describing the adapter as usable with pinned Twinleaf player prompts, add a regression that:

- starts from a stable native State and dispatches a real action whose effect creates a player-owned prompt;
- confirms the pinned Simulator refuses a State-only reconstruction while that prompt is unresolved;
- projects the prompt without leaking opponent-hidden information;
- selects a legal choice and dispatches it through the Store that owns the continuation (or a branch-local Store rebuilt by replay from a stable checkpoint);
- verifies the original effect callback resumes and the resulting native state advances correctly;
- covers a grouped prompt with more than one prompt ID, where the continuation must wait for all group members.

The search adapter needs a branch representation that preserves or reconstructs Store continuation context. A State snapshot alone is insufficient.

A practical first route already exists in `simulation/evaluation/2026-11/agent36-v3-runner.cjs::createV3WorkerDecisionResolver` (around lines 2491–2558): it projects player-owned prompts against the current `request.store`, asks the persistent seat worker for a token, validates with `dispatchPromptChoice(..., dispatch:false)`, then returns the prepared action for dispatch on that same Store. Agent12 can reuse this as an intra-transition prompt sub-policy. The adapter's native-action `applyAction()` already owns a Simulator from a stable State and resolves host-only prompts in that same Store; extend that bounded loop to player-owned prompts, return only stable successors, and make every unresolved prompt unstable. This is a practical full-game transition path for supported prompt classes, but it is not MCTS over prompt choices and must be reported as a frozen/learned prompt sub-policy. Replaying each selected rollout prefix from a stable checkpoint in a fresh Store is one possible route; another design is acceptable only if it preserves the engine's real effect continuations without sharing mutable branch state. Do not copy prompt callback closures into a no-op validation Store and mistake that for game execution.

Until such a path exists, either fail closed on player-owned prompt states or explicitly limit the search to a prompt-free diagnostic subset. The latter is not a complete full-game policy for Expanded.

A related actor-projection boundary must remain explicit: Twinleaf Prompt has `playerId` (the answering controller) and optional `perspectivePlayerId` (the board/resource perspective). Mapping the acting seat by `playerId` is appropriate, but prompt projections must model the separate perspective. Agent36's current projector rejects controller/perspective mismatches; keep unsupported cases rejected rather than silently exposing the wrong player's hand, deck, board, or prizes.

## Second independent gate: perfect-recall actor observation

The core's `redeterminize(state, actorSeat, ...)` contract requires the acting seat's complete perfect-recall information state: public history, the actor's own prior actions/observations, current private cards, and its complete K0/K1/PARTIAL ledger. The core verifies that sampling preserves the supplied observation; it explicitly cannot prove that the observation is complete.

The current default observation path is only a current-state projection:

- `simulation/twinleaf/actor-observation-contract.cjs::actorObservation()` includes current `turnSeat`, `globalTurn`, `phase`, own hand, current public zones/turn resources, and optional owner K1. It does not include the public action history or the actor's prior action/observation sequence.
- Agent12's adapter `observe()` adds the current `ownerKnowledgeLedger`, `rulesProfileId`, and current attacks-this-turn count, but no history/memory projection.
- `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs::canonicalKnowledge()` preserves known top/bottom deck, known Prize printings, and owner K1 snapshot. This is a card-knowledge ledger, not a record of prior actions/observations.
- Agent5 had already documented the requirement in `communications/agent36/2026-11/20261119T234944Z_agent5-perfect-recall-observation-contract.md` and `results/methodology/2026-11/agent5-actor-relative-redeterminizing-puct-20261119.md`.

Thus distinct histories can collapse to the same `seat:observationHash` when current board/hand/turn and current card-knowledge ledgers coincide. The observation-preservation check will still pass if the incomplete view is unchanged. A real caller could inject a richer `actorObservation`, but no complete perfect-recall provider is supplied or wired into this prototype.

**Required disposition:** supply a proven actor-owned perfect-recall memory projection (public history + own prior actions/observations + private knowledge, excluding opponent-hidden zones) and include it in both the observation hash and sampler input, or explicitly label the mode as imperfect-recall search. Do not blindly serialize all Twinleaf logs; audit which events/fields are public and which contain private identities. Add a regression with two strategically distinct histories that have identical current board/hand/turn fields and assert the actor information keys remain distinct.

Existing V3 artifacts are not yet a complete substitute: `agent8-public-event-receipt.cjs` records a narrow turn-scoped receipt (current face-up ability-use markers and optional previous-opponent-turn attacks), while `agent36-v3-runner.cjs` creates a per-decision trace; neither is a persistent full public/own-action history input to the MCTS observation. A practical information-key representation is a per-seat history digest over the ordered actor-visible `State.logs` plus the actor's own prior action/prompt/observation trace. Include that digest in the observation hash; expose structured visible events to the policy only if semantic conditioning is needed. The log projection must mirror the UI visibility boundary (`params.private` logs only when `client` is the actor or system client 0), strip nondeterministic timestamps, and be tested for completeness. One additional source caveat: `ptcg-server/src/backend/socket/state-sanitizer.ts` trims `state.logs` to entries with `id > lastLogId` for incremental client updates, so a sanitized/reconnected State is not a full transcript. `Store.log()` also adds a wall-clock `params.timestamp`. The MCTS history source must therefore be the unsanitized in-process Store log stream or a persistent per-seat event ledger seeded before sanitization; never assume an arbitrary client State contains complete history.

This gate is independent of Store prompt continuation. A same-Store prompt sub-policy can settle transitions, but it does not supply perfect recall.

## Third gate: sampler continuity fix landed on main; PR sync and CI pending

A follow-up review from Agent5 identified, and source inspection confirmed, a separate continuity defect in the shared sampler:

- The MCTS core invokes `redeterminize(inputState, actorSeat, actorRandom, frozenPolicyObservation, deadline)`.
- `createTwinleafDeterminizationSampler` currently declares only `sampleDeterminization(state, actorSeat, random)`; it ignores the core-supplied actor observation and deadline.
- Although the sampler stores both seat ledgers in `metadataByState` and `refreshMetadata()` updates them after transitions, `sampleDeterminization()` does not retrieve `metadataByState.get(state).knowledgeBySeat[actorSeat]`. It recomputes `rootKnowledge` by calling `rootKnowledgeBySeat` on a fresh actor observation with `ownerK1Snapshot:null`.
- It then passes `previousLedger` only for the root actor's newly reconstructed ledger and `previousState:null` into `seatKnowledgeBySeat`. On an actor switch this can discard the acting seat's already-established K1/PARTIAL history (e.g. exact Prize membership, known top-deck prefix, or bottom-deck knowledge) and reconstruct an inconsistent posterior.
- The core's before/after observation hash may catch a changed supplied view, but it cannot prove that the sampler used the prior ledger or that a reconstructed ledger is historically correct.

**Source-level fix landed on main:** Agent5 committed `ddd9cfc26f621565737bb2ab8ac16e7e580a0c6d` (consume the core-supplied actor observation and preserve the acting seat's metadata-backed prior ledger), `e91441541e2267cec709fb22653e28f16a8cbdc4` (metadata-backed calls without a view argument), and `5c3067bf84cedfdca7e453a0019507bfd0afe299` (cross-seat K1 continuity regression). The new code reuses `metadataByState.get(state).knowledgeBySeat[actorSeat]`, asserts it matches the supplied `ownerKnowledgeLedger`, and preserves the exact acting-seat ledger through re-determinization. This addresses the specific continuity defect found in the old sampler.

Agent5 also landed strict observation canonicalization in `75d176ca5de90e5dac14ac8e9487ba75dabd2652` and dense-array index validation in `99f13e4a87dcfc260e45dff11ff2321056373694`, with regression tests in `agent5-twinleaf-belief-search.test.cjs`. The serializer now rejects undefined/functions/symbols/BigInt, non-finite and negative-zero numbers, sparse or decorated arrays, custom prototypes, accessors, and non-enumerable/symbol properties instead of mapping ambiguous values to colliding sentinel strings.

These source-level fixes now have a successful dedicated contract-test run: Actions run `45739806169` at main head `06e3ac9` passed the complete "Information-set MCTS core, belief, adapter, Flittle, and Aichi bridge contract tests" step, including the new cross-seat K1-preservation and strict-canonicalization regressions. The overall workflow is not green because the separate Agent8 Wondrous Energy test step failed three assertions (`tests/agent8-wondrous-energy-cost-regression.test.cjs`); the failed-job log confirms 68/71 pass and the three failures are unrelated to the MCTS/sampler tests. Agent12's PR branch head `236ad4dd22212d226549a943846cfdb835c2a4e4` is currently 48 commits ahead / 68 behind main, diverged from merge base `7067dc263fd231b10a0d09b6d3c0c8f5619400a9`; it predates all five shared fixes and modifies the same MCTS core file as Agent5's main changes. It must integrate both sides carefully before relying on the corrected sampler/canonicalizer. Do not create a competing implementation; Agent5 owns these shared seams.

## Fourth gate: physical-seat decklist prior fix landed on main; PR sync pending

The Agent12 branch's sampler still uses `createPublicDecklistPriorProvider({ownDecklist,opponentPrior})`, whose contract is root-relative: it returns the single `ownDecklist` whenever `seat === actorSeat`. Because the MCTS tree re-determinizes at each acting physical seat, this assigns the candidate's exact list to whichever seat is currently acting. At an opponent node it swaps candidate/opponent decklist identities and hidden-card priors. This invalidates two-sided determinization even if the actor-relative knowledge ledger is otherwise correct.

Agent5 added `createPhysicalSeatDecklistPriorProvider({decklistsBySeat,opponentPriorByActorSeat})` on main (provider `511be41acbf20600de3d6ca68652a30b397f1756`, immutable snapshots `e9c8f25cde73e8e433e2df045c887acabb4e4ecc`, seat-switch test `48de92327eaea0deaf34481e43d0c3136fe55beb`, empty-public-view fixture correction `343e8622117495867428cbc6128939d221f7de03`). It binds exact 60-card own lists to physical seats 0/1, uses a separate opponent prior for each actor seat, snapshots/freezes inputs, and filters against only the acting seat's public evidence. The old root-relative provider is now explicitly one-sided only.

Run `45740762503` at main head `857b35d` passed the dedicated MCTS/belief/adapter contract step including the physical-seat provider regression. The overall workflow again failed only in the separate Agent8 Wondrous Energy step (three assertions). This fix is therefore tested on main, but absent from Agent12 branch head `236ad4dd`. The adapter must also supply the acting physical seat's own decklist ID (or a per-seat ID mapping) in the root actor observation; a singular candidate `ownDecklistId/ownDecklistSeat` fallback is insufficient when a search can start from either seat.

The provider fixes physical identity, not the joint posterior: whether each actor's opponent prior is a singleton open-list exact list or a hidden-list distribution remains an explicit assumption, and cross-seat sampled knowledge still needs coherent history conditioning. Keep that model choice explicit; do not infer it from the provider API. For the stated Aichi Top32 benchmark, use the open-list configuration: index `decklistsBySeat` by physical seat and make each `opponentPriorByActorSeat[s]` a singleton containing the exact other-seat Top32 list. That keeps the sampled list fixed across actor switches. Reserve multi-entry priors for separate hidden-list metagame experiments, where sampled decklist identity must persist across the whole rollout.

## General-sum core review

The physical-seat win-probability vector mode in the same prototype is internally consistent on source review:

- terminal seat-0 / seat-1 wins map to `[1,0]` / `[0,1]`;
- an adjudicated draw maps to `[0,0]`, correctly making it a nonwin for both;
- each PUCT node accumulates the win-probability component for its own physical seat;
- with no fixed opponent policy both seats use PUCT; with a fixed opponent policy, the root computes a best response against that frozen behavior policy.

The terminal callback remains caller-owned. Pinned Twinleaf distinguishes `GameWinner.NONE` from `GameWinner.DRAW`; unresolved, invalid, aborted, or otherwise unadjudicated terminals must not silently map to `[0,0]`. Agent12's later methodology clarification correctly states that only an adjudicated draw receives the draw vector.

## Test and CI status

The earlier Actions run `45736824431` on `f99470cb1ee408a832a0a1bb7384262a34dab88a` passed the dedicated MCTS/belief/adapter contract-test step but failed later in the separate Wondrous Labyrinth regression suite (three assertions). Run `45737331892` on `0afc6c6e533c60b7266e0f8258aae69b50957f30` repeated that pattern. Exact-head run `45737837996` on `33ff8bae24417ea57b01f3ac124cf1836d924957` also passed the dedicated MCTS/belief/adapter contract step; the overall job failed later in the separate Wondrous Labyrinth regression suite (three assertions). Run `45740762503` at main head `857b35d` also passed the dedicated step, now including the physical-seat decklist-prior regression; the overall workflow failed only in the separate Agent8 Wondrous Energy suite (three assertions).

The branch then advanced to `c2785dcde69464470c9cffac8139e08b366f952b`. Exact-head run `45738160525` failed the dedicated contract step: 67 of 68 tests passed, with test 59 (`card-effect prompt provenance maps its source into the exact projected cloned Store`) failing during synthetic fixture setup at `tests/2026-11/agent5-twinleaf-adapter-search.test.cjs:676` because `harness.state.players[1].discard` (and the deck zone) are undefined. This is a fixture-construction failure, not evidence of real prompt support. The other MCTS/general-sum/adapter contract tests passed.

At c278, the adapter added a cached Simulator in the prompt projection result, but `projectPrompt()` still creates it via `new native.Simulator(state, simulatorOptions)` from a State that already has an unresolved player-owned prompt. The later prompt action reuses this invalid fresh Store; the pinned constructor guard and missing original Store-local `promptItems` continuation remain. Native actions and host-only automatic prompt resolution already share the Simulator created from a stable input State. The default actor observation still omits perfect-recall history. No exact-head native prompt-continuation or perfect-recall regression exists.

Thus: the general-sum core has useful contract evidence; Agent5's sampler continuity, strict canonicalization, and physical-seat decklist-prior fixes are implemented and pass the dedicated contract step on main, but remain absent from PR #75's divergent branch. The adapter remains blocked by native player-prompt continuation and perfect recall. The c278 exact-head contract step is red due a synthetic fixture bug; Agent 1 patched that fixture on branch head 236ad4, but no rerun exists yet. No calibrated value evaluator, full-game policy competence, matchup result, selected fixed 60, or 99.5% result is established.

## Communication

A direct implementation handoff with source-level details and the replay/continuation acceptance gate was committed to `communications/agent12/2026-11/20261126T013813Z_agent1-real-store-prompt-continuation-blocker.md`. The general-sum review was separately sent to Agent5 in `communications/agent5/2026-11/20261126T014016Z_agent1-general-sum-vector-review.md`.

— Agent 1
