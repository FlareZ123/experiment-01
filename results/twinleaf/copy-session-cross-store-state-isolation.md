# Pinned copied-attack sessions lose source delegation after a foreign Store effect

**Agent 12, 17 October 2026.** Engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is an injected-State engine regression, not a legal completed game or a matchup result.

## Reproduction

The committed [cross-Store fixture](../../simulation/twinleaf/copy-session-cross-store-leak.cjs) manually opens a copied-attack session for Regidrago VSTAR using a Goodra VSTAR source reducer instrumented to count `EndTurnEffect` callbacks. It compares two `Store.reduceEffect` sequences with independent Stores and independent physical Regidrago objects:

- **Control:** original Store A, then Store A again.
- **Interleaved:** Store A, a separate Store B using its own State and Active Pokémon, then Store A again.

In [manual compiled CI 39040180258](https://github.com/FlareZ123/experiment-01/actions/runs/39040180258), the cross-Store step completed and logged:

| Source-reducer callback count | After first A | After optional B | After second A |
| --- | ---: | ---: | ---: |
| No interleaving | 2 | 2 | **4** |
| Independent Store B interleaved | 2 | 2 | **3** |

Thus the foreign Store produces **zero** callbacks to the instrumented source itself, but the resumed original Store produces **one** rather than **two**. The initial regression incorrectly compared total counts without measuring the intervening interval, briefly obscuring this distinction. The interval-counted test supersedes that earlier interpretation.

## Source-level explanation

[Pinned `copy-attack-delegation.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-delegation.ts) stores `copyAttackSessions` in a **module-level mutable array**, while `resolveCopyAttackSessions(store, state, effect)` prunes entries when their copied Pokémon is absent from the supplied State. [Pinned `Store.reduceEffect`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) calls this resolver regardless of which Store originally established the session. This code structure explains how an unrelated Store's State can remove another Store's registered session. The observed one-callback deficit is consistent with that mechanism.

## Limits and required follow-up

The fixture manually opens the copy session and instruments the source reducer; it does not model the complete Apex Dragon declaration, energy cost, alternating legal turns or downstream game result. A separate `copy-session-speculative-simulator.cjs` diagnostic is being repaired to test a real speculative `Simulator.dispatch` against a real Store's active session. It must be evaluated independently rather than assumed to behave like arbitrary Store B.

Avoid using same-process concurrent or speculative Store trajectories as qualified competitive evidence until copy-session lifetime and source-state isolation are tested under the actual caller. A solution should keep session ownership scoped to the appropriate game/State and preserve copied effects that legitimately last across turns. Any research-side patch must be reversible, pinned-revision-aware, and validated against actual attack/prompt/turn continuation. The shared fixed 60-card Aichi objective remains at **zero qualified games**.

## Stable speculative Simulator branch: an additional confirmed exposure

[Manual compiled CI 39040763500](https://github.com/FlareZ123/experiment-01/actions/runs/39040763500) passed the revised [speculative-session fixture](../../simulation/twinleaf/copy-session-speculative-simulator.cjs). It constructs the Simulator from a prompt-free State *before* the control Store generates EndTurn prompts, then dispatches a real `PassTurnAction` in the Simulator and resumes a real `Store.reduceEffect`. All constructed Simulators dispatched without an error.

| Profile | Observed instrumented Goodra callback Store sequence |
| --- | --- |
| No Simulator | real, real, real, real |
| Pinned Simulator | real, real, **speculative, speculative**, real, real |
| Experimental prototype-safe Simulator | real, real, **speculative**, real |

Thus even in the nominally detached speculative branch, source reducer code ran under the speculative Store, and the prototype-safe profile left the original Store with **one** resumed callback rather than two. The ordinary pinned clone yielded two speculative callbacks but retained both real resumed callbacks in this fixture. This is a lifecycle observation, not a proof that either clone is fully semantics-preserving. Instrumented events record which Store invoked the source handler, not a complete source graph or card-effect equivalence test.

The earlier [manual CI 39040428794](https://github.com/FlareZ123/experiment-01/actions/runs/39040428794) passed the unpatched cross-Store test and showed `ERROR_SIMULATOR_NOT_STABLE` for simulations constructed after pending EndTurn prompts. That censored probe has been superseded by the stable-State construction.

An experimental in-memory [per-State session hook](../../simulation/twinleaf/copied-session-state-scope-hook.cjs) and [regression](../../simulation/twinleaf/copied-session-state-scope-test.cjs) have been written. Their compiled validation is pending; do not infer that the hook is safe in full matches or preserves ongoing copied effects inside cloned hypothetical States.
