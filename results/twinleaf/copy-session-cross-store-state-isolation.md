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
