# Deck-agnostic two-sided Twinleaf search interface

**Status:** research adapter and contract tests; not yet wired into a registered Aichi full-game decision loop. No competitive games were dispatched by this work.

## Decision this work can change

The immediate implementation gate is whether the existing information-set MCTS can serve as a reusable, actor-safe, two-sided decision-search component rather than a Flittle-only one-ply demonstration. This work closes two design gaps:

1. The core previously backed up one scalar zero-sum utility. A draw therefore had value zero to both seats, which is not the all-game win-probability objective: a draw is a nonwin for both players.
2. The only Twinleaf MCTS adapter was guarded by a Flittle/59-Psychic fixture envelope. That is useful as a smoke test, but it is not a deck-agnostic action/prompt interface.

## Implementation

### General-sum win-probability objective

**simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs** now supports two explicit modes:

- **zero-sum** remains the default and preserves the previous scalar terminalValue / evaluateObservation API.
- **seat-win-probability** accepts terminalValues(state) -> [pSeat0, pSeat1] and evaluateObservationValues(actorObservation, actorSeat) -> [pSeat0, pSeat1].

In the second mode, each decision node maximizes the acting physical seat's own win probability. A terminal seat-0 win is [1,0], a seat-1 win is [0,1], and a draw/no-winner is [0,0]. Values must be finite probabilities in [0,1] and the two win probabilities may not sum above one. Backpropagation adds the corresponding physical seat's component at every node; it does not negate the other seat's component.

With no fixed opponentActionPolicy, both seats use PUCT nodes in the same search tree. Supplying a fixed opponent policy intentionally changes the opponent side to that behavioral policy; it is not the two-sided PUCT configuration.

### Generic Twinleaf adapter

**simulation/twinleaf/2026-11/agent12-twinleaf-two-sided-search.cjs** builds on existing research-owned interfaces rather than creating a second game runner:

- **agent3-known-cap-free-action-enumerator.cjs** for the pinned, cap-free native action enumerator;
- **agent36-native-action-frontier.cjs** for cloned-Store legality checks, actor-visible action projections, stable native action signatures, and fail-closed unsupported/truncated-frontier diagnostics;
- **agent5-twinleaf-belief-input.cjs**'s createTwinleafDeterminizationSampler as the per-decision redeterminize function, including its metadataByState, knowledgeBySeat, and refreshMetadata hooks;
- **agent5-information-set-mcts.cjs** for the shared two-sided search tree.

The adapter has no Flittle/card/deck envelope. It searches native action frontiers for either physical seat and treats actor-owned player prompts as additional search decisions. Engine/chance prompts are handled by explicit trusted-host callbacks. The actor policy/value and prompt-choice callbacks receive actor-visible observations/projections, not native full State. The adapter checks both sampled-seat knowledge ledgers and carries the owner K0/K1/PARTIAL ledger, rules profile, and actor's own deck identity into the observation key.

The exported createNativeTwinleafPromptCallbacks helper binds those callbacks to Agent36's existing agent36-prompt-projection.cjs: player prompts use its actor-only prompt projection and choice map; selected raw choices are decoded/validated by the native prompt validator before dispatch; host-only prompts use its physical-RNG resolver. Card-effect prompts remain fail-closed unless the caller supplies provenanceForPrompt and a mapSourceCard function that maps the typed source card into the cloned State. The generic adapter also passes the current cloned Simulator/Store to host-only resolvers, so they do not need to access or mutate the live Store.

Admission is deliberately fail-closed: the native frontier must be complete under the reviewed pinned enumerator, and any unsupported or truncated action family aborts the search. The current frontier ceiling is 256 actions. A prompt must be classified as automatic or owned by one physical seat; unknown prompt ownership aborts rather than silently delegating it.

The adapter never mutates the live Store. It constructs a cloned native Simulator for each transition, carries sampled belief metadata through the transition hooks, and resolves automatic prompts before returning the successor state. Its returned action is the actor-visible projected action/token, not a native action object; a live caller must bind that token/signature to the exact current live frontier before dispatch.

## Reproduction and evidence

The contract tests are appended to the existing MCTS suites:

- **tests/2026-11/agent5-information-set-search.test.cjs**
  - demonstrates a case where legacy win-minus-loss utility prefers a 40%-win / 60%-draw line over a 50%-win / 50%-loss line, while the all-game win-probability objective chooses the latter;
  - verifies the opponent decision node maximizes the opponent's own win probability;
  - rejects malformed, out-of-range, and mutually impossible payoff vectors.
- **tests/2026-11/agent5-twinleaf-adapter-search.test.cjs**
  - exercises both physical seats through the generic native frontier;
  - exercises a player-owned prompt as a search node;
  - exercises Agent36 native ConfirmPrompt projection and host-only CoinFlipPrompt resolution;
  - checks the actor-relative knowledge metadata contract and native prompt-result validation.

The first workflow dispatch exposed a prompt-frontier count expectation error; the next exposed a duplicate test-only determinizer overriding its metadata-bearing sampler. Both fixture defects were corrected. Exact-head run **45736824431** on branch head **f99470cb1ee408a832a0a1bb7384262a34dab88a** completed with the workflow step **“Information-set MCTS core, belief, adapter, Flittle, and Aichi bridge contract tests” successful**. This includes the new native ConfirmPrompt projection, native choice validation, and host-only CoinFlipPrompt resolver tests. The overall workflow job was not green: a later, separate step, **“Generic owner-hand Trainer category and shared-action opportunity tests,”** failed three Wondrous Labyrinth assertions in tests/agent8-wondrous-energy-cost-regression.test.cjs. Thus the MCTS/general-sum/generic-adapter contract step passed on the exact head; the broader workflow has an unrelated failure and must not be represented as green.

## Integration contract

A real Twinleaf/V3 caller should provide:

- the actual pinned native bindings, enginePin, random flip/shuffle simulator options, and the reviewed cap-free enumerator;
- the base actor-observation contract and one shared sampler returned by createTwinleafDeterminizationSampler;
- rulesProfileId, candidate deck identity/seat, and the same knowledgeBySeat / metadata hooks attached to that sampler;
- the callbacks returned by createNativeTwinleafPromptCallbacks({native,simulatorOptions,provenanceForPrompt,mapSourceCard}) for Agent36 prompt projection and host-only resolution; for card-effect prompts, provenanceForPrompt must return typed source provenance and mapSourceCard must map the source object into the cloned State;
- alternatively, custom projectPrompt and enumeratePromptChoices callbacks returning stable actor-visible keys and opaque native results; native raw results are still decoded/validated before dispatch;
- terminalValues mapping paper wins/losses/draws to [1,0], [0,1], [0,0];
- an actor-view-only evaluateObservationValues calibrated to estimate both seats' win probabilities. It must return nonnegative probabilities summing to at most one.

A minimal construction is shown below.

    const determinize = createTwinleafDeterminizationSampler(beliefDependencies);
    const simulatorOptions = {
      flipMode: BotFlipMode.RANDOM,
      shuffleMode: BotShuffleMode.RANDOM
    };
    const promptCallbacks = createNativeTwinleafPromptCallbacks({
      native,
      simulatorOptions,
      provenanceForPrompt,
      mapSourceCard
    });
    const search = createTwinleafTwoSidedSearch({
      native,
      enginePin: EXPECTED_ENGINE_PIN,
      simulatorOptions,
      redeterminize: determinize,
      actorObservation,
      rulesProfileId,
      ownDecklistSeat,
      ownDecklistId,
      ...promptCallbacks,
      terminalValues,
      evaluateObservationValues
    }, {
      iterations: 512,
      maxPlies: 48,
      seed: registeredSeed
    });
    const decision = search.search(liveState, candidateSeat);

This is an interface example, not a complete configured runner. maxPlies counts player decisions and player-owned prompt decisions, not full turns. The search result contains the selected projected action, root action values/visits, rollout action paths, per-seat transition counts, and native-frontier diagnostics; these are suitable for the existing full-state/decision-trace recorder without creating another serializer or runner.

## Limitations and next actions

- The adapter is tested against synthetic Store fixtures, not yet against a complete actual Twinleaf game. Contract tests do not establish full card-pool support or paper Expanded correctness.
- The native prompt helper is contract-tested with synthetic ConfirmPrompt/CoinFlipPrompt fixtures, not yet against the full pinned engine prompt-class population. Card-effect prompts need a provenanceForPrompt callback and source-card remapping into each cloned State; unsupported or provenance-incomplete prompts remain fail-closed.
- The value evaluator is an injected dependency; no calibrated all-game win-probability model is supplied here. A heuristic or uncalibrated evaluator is not evidence of deck strength.
- The adapter is not yet connected to the V3 registered two-seat search/review loop. Use the existing V3 runner and full-state recorder; do not add another runner, workflow, or trace serializer.
- Before any competitive evaluation, run exact-head no-game contracts, integrate the adapter into the existing candidate decision path, capture both seats' complete decision traces, and obtain independent review of meaningful candidate and opponent decisions. No game or matchup result is claimed here.

**Conclusion:** the code now has a reusable general-sum, two-sided search contract and a generic Twinleaf transition/frontier adapter. It is an implementation milestone only—not a selected deck, a policy-competence result, a matchup result, or evidence toward 99.5%.
