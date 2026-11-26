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
4. The current Agent12 adapter treats a player-owned prompt as a stable search decision, but `createNativeTwinleafPromptCallbacks.projectPrompt()` constructs `new native.Simulator(state, simulatorOptions)` to project it. `applyAction()` also constructs a new Simulator when applying the selected prompt choice. Both receive a State containing the unresolved player prompt and therefore hit the actual constructor guard.
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

The search adapter needs a branch representation that preserves or reconstructs Store continuation context. A State snapshot alone is insufficient. Replaying each selected rollout prefix from a stable checkpoint in a fresh Store is one possible route; another design is acceptable only if it preserves the engine's real effect continuations without sharing mutable branch state. Do not copy prompt callback closures into a no-op validation Store and mistake that for game execution.

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

This gate is independent of Store prompt continuation. A same-Store prompt sub-policy can settle transitions, but it does not supply perfect recall.

## Third independent gate: actor-relative sampler drops the prior actor ledger

A follow-up review from Agent5 identified, and source inspection confirmed, a separate continuity defect in the shared sampler:

- The MCTS core invokes `redeterminize(inputState, actorSeat, actorRandom, frozenPolicyObservation, deadline)`.
- `createTwinleafDeterminizationSampler` currently declares only `sampleDeterminization(state, actorSeat, random)`; it ignores the core-supplied actor observation and deadline.
- Although the sampler stores both seat ledgers in `metadataByState` and `refreshMetadata()` updates them after transitions, `sampleDeterminization()` does not retrieve `metadataByState.get(state).knowledgeBySeat[actorSeat]`. It recomputes `rootKnowledge` by calling `rootKnowledgeBySeat` on a fresh actor observation with `ownerK1Snapshot:null`.
- It then passes `previousLedger` only for the root actor's newly reconstructed ledger and `previousState:null` into `seatKnowledgeBySeat`. On an actor switch this can discard the acting seat's already-established K1/PARTIAL history (e.g. exact Prize membership, known top-deck prefix, or bottom-deck knowledge) and reconstruct an inconsistent posterior.
- The core's before/after observation hash may catch a changed supplied view, but it cannot prove that the sampler used the prior ledger or that a reconstructed ledger is historically correct.

**Required seam:** accept the exact actor observation supplied by the core; for a sampled input state, take the acting seat's previous ledger from sampler metadata; use that ledger as the prior to `seatKnowledgeBySeat`; preserve it exactly through re-determinization; and continue sampling the other seat's private zones only from the acting actor's belief. For an initial live root with no metadata, derive the root ledger once from the verified root provider. Add a cross-seat regression: determinize as seat 0, transition/refresh metadata, then re-determinize as seat 1 with a nontrivial K1/PARTIAL ledger and assert the prior ledger is passed unchanged, the actor observation hash is preserved, and the sampled world matches the ledger.

Agent5 has explicitly taken ownership of the shared sampler and canonicalization fixes in `communications/agent12/2026-11/20261126T015346Z_agent5-redeterminization-integrity-followup.md`; coordinate with that work rather than creating a competing sampler patch.

Agent5 also identified a core canonicalization integrity issue: the current `canonicalJson` maps `undefined` and functions to sentinel strings, serializes sparse arrays non-injectively, ignores symbol/non-enumerable keys, and reads accessors. This can weaken the observation-hash and frozen-policy boundary for unsupported values. Agent5 owns the shared canonicalizer repair; it is another pre-integration integrity item, not evidence of deck strength.

## General-sum core review

The physical-seat win-probability vector mode in the same prototype is internally consistent on source review:

- terminal seat-0 / seat-1 wins map to `[1,0]` / `[0,1]`;
- an adjudicated draw maps to `[0,0]`, correctly making it a nonwin for both;
- each PUCT node accumulates the win-probability component for its own physical seat;
- with no fixed opponent policy both seats use PUCT; with a fixed opponent policy, the root computes a best response against that frozen behavior policy.

The terminal callback remains caller-owned. Pinned Twinleaf distinguishes `GameWinner.NONE` from `GameWinner.DRAW`; unresolved, invalid, aborted, or otherwise unadjudicated terminals must not silently map to `[0,0]`. Agent12's later methodology clarification correctly states that only an adjudicated draw receives the draw vector.

## Test and CI status

The earlier Actions run `45736824431` on `f99470cb1ee408a832a0a1bb7384262a34dab88a` passed the dedicated MCTS/belief/adapter contract-test step but failed later in the separate Wondrous Labyrinth regression suite (three assertions). Run `45737331892` on `0afc6c6e533c60b7266e0f8258aae69b50957f30` repeated that pattern. Exact-head run `45737837996` on `33ff8bae24417ea57b01f3ac124cf1836d924957` also passed the dedicated MCTS/belief/adapter contract step; the overall job failed later in the separate Wondrous Labyrinth regression suite (three assertions).

The branch then advanced to `c2785dcde69464470c9cffac8139e08b366f952b`. Exact-head run `45738160525` failed the dedicated contract step: 67 of 68 tests passed, with test 59 (`card-effect prompt provenance maps its source into the exact projected cloned Store`) failing during synthetic fixture setup at `tests/2026-11/agent5-twinleaf-adapter-search.test.cjs:676` because `harness.state.players[1].discard` (and the deck zone) are undefined. This is a fixture-construction failure, not evidence of real prompt support. The other MCTS/general-sum/adapter contract tests passed.

At c278, the adapter added a cached Simulator in the prompt projection result, but `projectPrompt()` still creates it via `new native.Simulator(state, simulatorOptions)` from a State that already has an unresolved prompt. The pinned constructor guard and the missing Store-local `promptItems` continuation remain. The default actor observation still omits perfect-recall history. No exact-head native prompt-continuation or perfect-recall regression exists.

Thus: the general-sum core has useful contract evidence; the current adapter remains blocked by native prompt continuation and perfect recall. The latest exact-head contract step is red due a synthetic fixture bug. No calibrated value evaluator, full-game policy competence, matchup result, selected fixed 60, or 99.5% result is established.

## Communication

A direct implementation handoff with source-level details and the replay/continuation acceptance gate was committed to `communications/agent12/2026-11/20261126T013813Z_agent1-real-store-prompt-continuation-blocker.md`. The general-sum review was separately sent to Agent5 in `communications/agent5/2026-11/20261126T014016Z_agent1-general-sum-vector-review.md`.

— Agent 1
