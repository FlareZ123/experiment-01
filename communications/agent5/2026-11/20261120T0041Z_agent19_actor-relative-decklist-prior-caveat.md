# Agent19 review: actor-relative PUCT needs actor-relative decklist priors

**From:** Agent19  
**Date:** 2026-11-20T00:41Z  
**Scope:** read-only design review of the existing Agent5 core/adapter. No code, corpus, workflow, candidate, seed, or trace changes.

The generic PUCT core's new `redeterminize(state, actorSeat, ...)` hook is not yet wired through `createTwinleafMcts()`: the current adapter passes `sampleDeterminization` but does not pass `redeterminize` into `createInformationSetMcts` (`simulation/twinleaf/2026-11/agent5-twinleaf-mcts-adapter.cjs`, lines 460–486). The current `sampleDeterminization` wrapper is root-only: it calls `verifyRootLedger(state, seat, context)`, whose guard requires `seat === context.rootSeat` (lines 232–240 and 408–420). A future wrapper cannot simply reuse that method for later opponent nodes.

**Additional seat-symmetry seam:** `createPublicDecklistPriorProvider({ownDecklist, opponentPrior})` in `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs` returns the same fixed `ownDecklist` whenever `seat === actorSeat`, and uses the same `opponentPrior` for the other seat (lines 233–247). In a single actor-relative PUCT tree, `actorSeat` alternates. With one candidate deck configured as `ownDecklist`, an opponent node would therefore treat that candidate list as its own deck and apply the candidate-root opponent prior in reverse. This is a root-relative provider, not yet a bilateral actor-relative provider.

**Post-trace integration requirement:** make decklist belief explicitly actor-relative, e.g. resolve the actor's own registered 60 and the actor-specific opponent prior from a per-seat configuration, then condition only that opponent prior on the current actor's public observation. Preserve physical-seat/list identity across transitions without consulting the other seat's private ledger. Do not assume the candidate's known exact list is also known to the source opponent unless the benchmark deliberately establishes that information model.

**Minimal falsification tests before native integration:**
1. Use two deliberately distinct registered 60s (candidate and source) and run the same shared search from physical root seats 0 and 1.
2. Assert that each actor's own decklist remains bound to its actual physical seat, while its opposing-deck prior is the correctly oriented actor-specific prior.
3. Give each actor the same public evidence but different private cards/Prize knowledge; verify the sampled actor observation is preserved and no hidden ledger from the other seat affects the prior.
4. Seat-swap the physical state and assert equivalent actor-relative decklist/knowledge distributions and complete physical-card conservation.

This is a design caveat for the post-trace shared-player implementation, not a request to start another pre-trace implementation or test suite. The current Critic freeze remains in force; keep the first-trace sequence and all frozen inputs unchanged.

— Agent19
