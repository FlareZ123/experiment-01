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

Across 400 iterations and two action plies, the test requires identical opponent action distributions across the two root-private worlds, a Pass preference under the 20% prior, exactly 400 actor-relative samples per seat, and 800 observation-preservation checks. It repeats the test with either physical seat as root. A separate negative test confirms that changing the actor's observation during re-determinization aborts search.

The regression is committed. All 11 tests in the regression file passed in a fetched-source Code Mode harness against the exact committed core, using deterministic hash and Node assert/test shims. The existing manual Agent5 workflow run [44638161668](https://github.com/FlareZ123/experiment-01/actions/runs/44638161668) failed earlier in its unrelated actor-root intent step (4 failures among 237 tests), so its MCTS test step was skipped. The harness is not Node 22 or native Twinleaf CI. No new workflow was created.

## Evidence and limitations

- Core implementation: commit `5e82e34d225ccbc6941a414fccb202b0e5c1c842`.
- Contract hardening: commit `08a711ae69b18d1f96fe2358f8e8b5ff17ab5388`.
- Synthetic regression: commit `5860a411fdcac1d21c272e2d31070b74c8fa009d`.
- Pinned Twinleaf revision in the current repository: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

This is an algorithmic core capability, not yet a usable Expanded player. The current Twinleaf adapter and native root provider remain restricted to the one-Flittle/59-Psychic diagnostic fixture and do not supply this actor-relative callback. Their existing sampler/adapter contracts assume a fixed root seat. A native integration must support both physical seats, derive each acting player's own verified K0/K1/PARTIAL ledger, sample only hidden zones consistent with that actor's information, preserve public transitions and native prompt settlement, and prove complete legal frontiers. The callback is trusted adapter code; the core's observation check cannot prove that a malicious or incorrect sampler did not consult concealed information before constructing its sample.

The synthetic test establishes only that this generic core mode removes the demonstrated root-private conditioning when supplied a correct actor-relative sampler. It does not establish full-game search quality, self-play training, AlphaZero capability, a matchup result, a selected final 60, or any win-rate estimate. It does not change the candidate deck or the 32-opponent field status.

## Next useful integration

After the canonical first natural-terminal trace is captured and reviewed, adapt the Twinleaf belief sampler/adapter to provide actor-relative re-determinization for both seats. Use the same search configuration and evaluator for candidate and opponent roles, then validate it with actor-observation invariance, seat-swap metamorphic tests, native action-frontier completeness, prompt-resolution tests, and paired multi-ply evaluation. Preserve the legacy baseline for controlled comparison; do not qualify the new mode from synthetic tests alone.

Use the existing [Agent19 curated 30-case source-bound corpus](agent19/shared-player-challenge-corpus-v1.md) as the initial shared-player regression surface: 24 development cases are regression-only, six held-outs must not tune the policy, all 30 are blocked, and none has exact runtime actor-view digests, native receipts, traces, or games. The broader [318-case source-suite index](shared-policy-challenge-corpus-v1.json) is a registry, not an executable policy input. Do not create a duplicate corpus or treat historical rank-policy decisions as strategic oracle labels.

Reproduce the core regression under Node 22:

```sh
node --test tests/2026-11/agent5-root-determinization-opponent-belief-fusion.test.cjs
```
