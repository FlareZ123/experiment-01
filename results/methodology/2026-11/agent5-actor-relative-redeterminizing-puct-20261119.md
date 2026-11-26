# Agent 5 — actor-relative re-determinizing PUCT

**Date:** 19 November 2026  
**Scope:** Generic search-core correction for imperfect-information decision search. This is a synthetic algorithm test, not a Twinleaf match, card-mechanics result, deck matchup, or competitive-strength estimate.

## Question

Can the existing observation-keyed PUCT core make decisions for both physical seats without conditioning an opponent's choices on the root player's private cards?

## Why the legacy mode is insufficient

The legacy mode samples one hidden world from the root player's information set, then traverses later decisions in that same world. Its opponent nodes are keyed by the opponent's observation, but their action values still depend on root-private cards that the opponent cannot see. The existing counterexample demonstrates the resulting strategy fusion: the same opponent information set chooses Block when the root secretly holds a threat and Pass when the root secretly holds a bluff, despite the opponent's public threat prior being 20% in both cases.

See [the original counterexample](agent5-root-determinization-opponent-belief-fusion-20261113.md) and [its regression](../../../tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs).

## Implemented core change

`simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs` now accepts an optional trusted host-side callback:

`redeterminize(state, actorSeat, random, actorObservation, deadline)`

When supplied, it replaces the one-time root sampler and is called before every nonterminal decision node and nonterminal leaf. The callback must:

1. sample a detached state from the acting seat's own verified information state;
2. preserve the acting seat's complete observation, including its K0/K1/PARTIAL knowledge ledger;
3. preserve the public state, active physical seat, terminality and prompt stability;
4. avoid conditioning the sampled hidden world on other information unavailable to the acting seat.

The core independently hashes the actor observation before and after sampling and fails closed if it changes. It also checks that the returned state is detached, stable, nonterminal, and still belongs to the acting seat. The adapter's observation must be perfect-recall: include the complete public history and the acting player's own prior actions/observations as well as its private knowledge ledger. The core verifies equality of the supplied observation, not that the adapter included every strategically relevant fact; incomplete observations can merge distinct information sets or produce the wrong posterior.

The determinization RNG is independent of game-transition randomness and keyed only by search seed, iteration, physical acting seat, and actor-observation hash. It deliberately excludes internal search ply. The callback receives a frozen actor-observation snapshot and a narrow deadline-check capability, not the search's root-seat identity, live clock, or transition RNG.

With this mode enabled and no fixed opponent callback, the same PUCT tree selects actions at both seats. Nodes remain keyed by physical seat plus actor-observation hash; action frontiers must remain identical for repeated visits to the same information set. The old root-only mode remains available and is explicitly reported as `determinizationMode: "root-only"`; the new mode reports `determinizationMode: "actor-relative"` and `opponentModel: "actor-relative-puct"`.

## Action and prompt boundary

The search loop requires a stable state at every decision node and after every actor-relative sample. Therefore a native adapter must expose a **complete root-plus-prompt choice as one composite legal action** (or run an inner prompt-chain search that returns a fully settled successor) and make `applyAction` return a stable state after the entire chain. Do not feed an unresolved native prompt into this PUCT loop or greedily settle a prompt outside the root search: that would either violate the stability contract or optimize the root action and its consequences in separate decisions. The composite action key must bind the root action, exact prompt source/shape, all selected tokens/targets/payments, and the final settlement receipt. This is a post-trace adapter requirement, not implemented in the current Flittle diagnostic adapter.

## Synthetic regression

The extended test in `tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs` runs the same hidden-card counterexample from either physical root seat:

- the root privately holds Threat or Bluff;
- the opponent sees the same public state and a 20% threat prior;
- the opponent chooses Block or Pass;
- the opponent-relative sampler preserves the root's private card when the root acts, but samples that card from the opponent's public prior when the opponent acts;
- both seats use PUCT; no fixed rank-specific opponent policy is supplied.

Across 400 iterations and two action plies, the test requires identical opponent action distributions across the two root-private worlds, a Pass preference under the 20% prior, exactly 400 actor-relative samples per seat, and 800 observation-preservation checks. It repeats the test with either physical seat as root. A separate negative test confirms that changing the actor's observation during re-determinization aborts search, and another confirms that a nonterminal horizon leaf is re-determinized for its acting seat before heuristic evaluation, preserves that actor's own sampled private card, and re-samples the root's hidden card from the actor's prior.

The regression is committed. All 12 tests in the regression file passed in a fetched-source Code Mode harness against the exact committed core, using deterministic hash and Node assert/test shims. The existing manual Agent5 workflow run [44638161668](https://github.com/FlareZ123/experiment-01/actions/runs/44638161668) failed earlier in its unrelated actor-root intent step (4 failures among 237 tests), so its MCTS test step was skipped. The harness is not Node 22 or native Twinleaf CI. No new workflow was created.

## Evidence and limitations

- Core implementation: commit `5e82e34d225ccbc6941a414fccb202b0e5c1c842`.
- Contract hardening: commit `08a711ae69b18d1f96fe2358f8e8b5ff17ab5388`; perfect-recall observation contract: `f9fcaf89363dc5e24ff233152e2b40db7885d093`.
- Synthetic regression: initial cases `5860a411fdcac1d21c272e2d31070b74c8fa009d`; nonterminal-leaf case `1f86e6a11aa62badede51a1b287a50bc21e2962d`.
- Pinned Twinleaf revision in the current repository: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

This is an algorithmic core capability, not yet a usable Expanded player. The mainline Agent5 adapter remains root-only. PR #78's current branch now exposes actor-relative `redeterminize` and a same-Store prompt chain, but the K0/K1 sampler is not yet wired into it. The existing `createTwinleafDeterminizationSampler` accepts either physical `actorSeat`, derives the actor's root knowledge, samples both hidden partitions, and stores both seats' ledgers; its returned callable is compatible with the PR #78 redeterminize hook. The remaining integration gaps are per-seat decklist identity on an unsampled root, transition-local private evidence for K1/PARTIAL ledger refresh, and source-backed callback implementations. The Flittle-only applicability envelope and expected-action frontier remain major blockers to full Expanded use. A native integration must preserve each acting player's verified K0/K1/PARTIAL ledger, sample only hidden zones consistent with that actor's information, preserve public transitions and native prompt settlement, and prove complete legal frontiers. The callback is trusted adapter code; the core's observation check cannot prove that a malicious or incorrect sampler did not consult concealed information before constructing its sample.

The synthetic test establishes only that this generic core mode removes the demonstrated root-private conditioning when supplied a correct actor-relative sampler. It does not establish full-game search quality, self-play training, AlphaZero capability, a matchup result, a selected final 60, or any win-rate estimate. It does not change the candidate deck or the 32-opponent field status.

## Next useful integration

After the canonical first natural-terminal trace is captured and reviewed, adapt the Twinleaf belief sampler/adapter to provide actor-relative re-determinization for both seats. Use the same search configuration and evaluator for candidate and opponent roles, then validate it with actor-observation invariance, seat-swap metamorphic tests, native action-frontier completeness, prompt-resolution tests, and paired multi-ply evaluation. Preserve the legacy baseline for controlled comparison; do not qualify the new mode from synthetic tests alone.

Use the existing [Agent19 curated 30-case source-bound corpus](agent19/shared-player-challenge-corpus-v1.md) as the initial shared-player regression surface: 24 development cases are regression-only, six held-outs must not tune the policy, all 30 are blocked, and none has exact runtime actor-view digests, native receipts, traces, or games. The broader [318-case source-suite index](shared-policy-challenge-corpus-v1.json) is a registry, not an executable policy input. The curated 30 cases are all opponent-role cases, with zero candidate-role cases and no seat-swapped native traces, so they cannot themselves validate seat symmetry; they are source-bound scenario inventory only. Do not create a duplicate corpus or treat historical rank-policy decisions as strategic oracle labels.

Reproduce the core regression under Node 22:

```sh
node --test tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs
```

## 2026-11-26 — K1 sampler and rollout-context integration boundary

### Current interfaces

- `createTwinleafDeterminizationSampler(deps)` returns a callable compatible with PR #78's `redeterminize(state, seat, random, actorView, deadline)` hook: the first four arguments align, and the sampler safely ignores the extra deadline argument. Wire it as `deps.redeterminize`, not as the legacy root-only `sampleDeterminization`. Keep the exact same `metadataByState`, `knowledgeBySeat`, and `refreshMetadata` objects connected to the adapter.
- `createPhysicalSeatDecklistPriorProvider` binds the two fixed paper lists to physical seats and exposes `ownDecklistIdBySeat`; the sampler now forwards that frozen two-entry map as `sampler.ownDecklistIdBySeat`. For open-list Aichi evaluation, use singleton opponent priors per actor seat so the same two deck identities persist across actor switches. Multi-entry priors do not yet persist one latent opponent list across an entire rollout.
- `sampler.refreshMetadata(fromState, toState, transitionEvidenceBySeat)` accepts an optional transition-local `[seat0Evidence, seat1Evidence]` JSON pair. It forwards only the corresponding seat's evidence to that seat's `seatKnowledgeBySeat` callback. Each entry may contain public events plus only that seat's private search/reveal/prompt evidence; public events can be present in both entries. This is a delta for the current native transition, not a shared raw-state dump.
- Initial root K1 has a special constraint: `knowledgeBySeat` calls `actorObservation(state, seat, {ownerK1Snapshot:null})` and then `rootKnowledgeBySeat({rootSeat, observation})`; the latter receives no State argument. The raw actor observation must therefore derive the acting seat's real K1 snapshot from its own private state/log evidence even when the override is null. Do not interpret null as 'no K1' and do not read the opponent's concealed zones.

### PR #78 adapter consumption

- I inspected current PR #78 head `29431c2b45b84a49b1a53d2a5879082f30c5ac10`. Its MCTS core already includes `typed-terminal-outcome-v2`, `adjudicated-no-winner`, actor-relative `redeterminize`, and `actor-safe-prompt-event-v2` rollout context. This supersedes the earlier pre-merge warning that its no-winner support was missing. Do **not** replace the entire PR #78 core with PR #77; preserve PR #78's rollout-context and prompt-event work. PR #77 remains a clean four-file general-sum core reference.
- The current PR #78 adapter's `transferMetadata(fromState,toState)` still calls `refreshMetadata` with only two arguments, and `buildBaseActorView` still asks for scalar `ownDecklistSeat` / `ownDecklistId`. The minimal integration is to pass `sampler.ownDecklistIdBySeat[seat]` for unsampled roots and extend `transferMetadata` to pass the two-entry transition evidence pair.
- `settlePendingPrompts` has the prompt owner's `actorObservation`, `promptProjection`, and selected tokens before the rollout receipt is sanitized. Build an internal private evidence delta from that information before reducing the receipt to opaque tokens. Partition private evidence by event `actorSeat` (the prompt owner), not `transitionActorSeat` (the action initiator); an action by seat 0 can trigger a private prompt owned by seat 1. Put public events in both seat entries. Do not put raw private card identities into shared rollout receipts or the other seat's policy observation.

### Validation and limitations

- `tests/2026-11/agent5-twinleaf-belief-search.test.cjs` now has 14 sampler tests, including root K1 initialization with a null override, physical-seat ID propagation, and per-seat transition-evidence routing. Exact mainline `native_search_only=true` run [45820094251](https://github.com/FlareZ123/experiment-01/actions/runs/45820094251) completed successfully on tested code/test blobs `d0f594859b073770a03ef6d054b0c23d36866d15`; those blobs are unchanged at main `7c9749d7058e5652832f74d896a289035d73eb9c`. The workflow also passed the selected pinned-Twinleaf native contract checks and same-Store prompt continuation; full-game and fixture-game steps were not run.
- PR #77 exact-head `native_search_only=true` run [45817935923](https://github.com/FlareZ123/experiment-01/actions/runs/45817935923) passed on core head `cf07589585a634bac0742b5565d5bc0f781415c2`. PR #78 exact-head native-search-only run [458124](https://github.com/FlareZ123/experiment-01/actions/runs/458124) passed on its current head, but that validates its adapter/prompt continuation, not K1 sampler integration.
- All K1 tests remain synthetic JS State fixtures with stub `cloneState` and `createCard`; no test has yet run the Agent5 sampler against an actual pinned Twinleaf State/Store. Production acceptance still requires concrete source-backed `rootKnowledgeBySeat`, `beliefKnowledgeBySeat`, and `seatKnowledgeBySeat` implementations; actor-safe prompt/action evidence; both physical root seats; and a native K1 determinization test through a native action and same-Store prompt chain. No full game, Aichi matchup, deck selection, policy competence, or win-rate claim follows.