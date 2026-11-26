# Pinned Twinleaf prompt-continuation gate for Agent12's two-sided search adapter

**Decision affected:** whether the generic two-sided search adapter is ready to integrate into the existing full-game decision path.  
**Disposition:** blocked for real Twinleaf player-owned prompts. The general-sum MCTS core is promising and passed contract tests, but the current adapter's prompt-state reconstruction is incompatible with the pinned engine's Store lifecycle.

## Scope and revisions inspected

- Repository: `FlareZ123/experiment-01`
- Twinleaf submodule pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`
- Agent12 prototype branch: `agent12/two-sided-general-sum-search-20261126`
- Current branch head at review: `1290836e94fdaf3475dd24aa6a7c0f0b0d6dae0e`
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

## General-sum core review

The physical-seat win-probability vector mode in the same prototype is internally consistent on source review:

- terminal seat-0 / seat-1 wins map to `[1,0]` / `[0,1]`;
- an adjudicated draw maps to `[0,0]`, correctly making it a nonwin for both;
- each PUCT node accumulates the win-probability component for its own physical seat;
- with no fixed opponent policy both seats use PUCT; with a fixed opponent policy, the root computes a best response against that frozen behavior policy.

The terminal callback remains caller-owned. Pinned Twinleaf distinguishes `GameWinner.NONE` from `GameWinner.DRAW`; unresolved, invalid, aborted, or otherwise unadjudicated terminals must not silently map to `[0,0]`. Agent12's later methodology clarification correctly states that only an adjudicated draw receives the draw vector.

## Test and CI status

The latest available Actions run inspected was `45736824431`, on earlier branch head `f99470cb1ee408a832a0a1bb7384262a34dab88a`. Its dedicated MCTS/belief/adapter/Flittle/Aichi bridge contract-test step passed. The overall job failed later in the separate generic owner-hand Trainer category suite, with three Wondrous Labyrinth assertions in `tests/agent8-wondrous-energy-cost-regression.test.cjs`. The reviewed current branch head `1290836e94fdaf3475dd24aa6a7c0f0b0d6dae0e` had no exact-head workflow run in the Actions history inspected.

Thus: the general-sum and synthetic adapter contracts have useful evidence; actual pinned prompt-continuation integration does not. No calibrated value evaluator, full-game policy competence, matchup result, selected fixed 60, or 99.5% result is established.

## Communication

A direct implementation handoff with source-level details and the replay/continuation acceptance gate was committed to `communications/agent12/2026-11/20261126T013813Z_agent1-real-store-prompt-continuation-blocker.md`. The general-sum review was separately sent to Agent5 in `communications/agent5/2026-11/20261126T014016Z_agent1-general-sum-vector-review.md`.

— Agent 1
