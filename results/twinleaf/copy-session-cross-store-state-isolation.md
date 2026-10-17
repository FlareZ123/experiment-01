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

## Opt-in in-memory isolation experiment: compiled validation

[Manual compiled CI 39040941097](https://github.com/FlareZ123/experiment-01/actions/runs/39040941097) **passed** at head `77e6dd89fec7d5f817ea5568c37c205b34a011a3` with the research-only [State-scope loader](../../simulation/twinleaf/copied-session-state-scope-hook.cjs) and [paired regression](../../simulation/twinleaf/copied-session-state-scope-test.cjs). The hook intercepts one compiled CommonJS import, verifies exact source anchors and replaces the module-global array with a `WeakMap` keyed by the current `State`. No vendored file is modified, and the experiment runs in its own Node process. It uses Node's internal CommonJS loader interface and is **not** recommended as a production integration.

| Pair | Pinned unpatched | Per-State experimental |
| --- | --- | --- |
| Uninterrupted A then A, total source callbacks | 4 | 4 |
| A then independent B then A, total source callbacks | **3** | **4** |
| Callback count in foreign Store | 0 | 0 |
| Callbacks when original A resumes | **1** | **2** |

The same compiled patched process additionally passed the existing paid Regidrago spent-GX denial / next-turn Mimikyu Copycat compatibility fixture: with declaration-history hook, Mimikyu copied the appropriate ordinary attack and damaged Regidrago for 80, as before. This is a **positive bounded regression**, with no source-ranked full-game or bot-policy qualification.

**Remaining open issues:** A cloned `State` does not automatically inherit its parent State's active copied-attack session under this patch. Thus a speculative clone may silently omit its legitimate ongoing copied-attack effects. No full match integration, source-dealt decision replay, one-turn lock/effect fidelity matrix, or engine-version-upgrade test has been completed. The loader must remain opt-in until those are resolved. The fixed-deck 99.5% objective has not been approached through competitive win-rate evidence here.

## Cloned-State session inheritance remains incomplete

[Manual compiled CI 39041317694](https://github.com/FlareZ123/experiment-01/actions/runs/39041317694) **passed** an additional opt-in regression at `401cb941fb6fe156364fe9961214586602213d60`, comparing real Store continuity with both pinned and prototype-safe speculative Simulator branches under the State-scoped loader.

With that loader installed, both speculative branches produced instrumented source callbacks `real, real, speculative, real, real`. The original State therefore retains its expected two resumed callbacks; a speculative State produces only **one** source callback, compared with two in the unpatched pinned Simulator and in the uninterrupted real control. This supports an explicit model gap: the State's sticky copied-attack session is not inherited by the clone. The extra speculative callback originates from ordinary propagation of the instrumented source card, while the missing callback is the session-specific delegated handler.

The opt-in State-scoped loader restores independent-game isolation while **underrepresenting sticky copied effects in clones**. Treat both findings as separate gates. No production default was changed, and no competitive result is qualified.

## Pinned Simulator explicit session transfer

[Compiled CI 39042075165](https://github.com/FlareZ123/experiment-01/actions/runs/39042075165) passed a bounded opt-in clone-transfer regression at `3d127309`. The added [wrapper](../../simulation/twinleaf/copy-session-aware-simulator-hook.cjs) calls a fail-closed per-State session-copy helper after the pinned Simulator constructor. The copied Goodra reducer callbacks changed from `real,real,speculative,real,real` under State scope alone to `real,real,speculative,speculative,real,real` with explicit transfer, preserving both hypothetical callbacks and the real parent continuation.

The same test rejected prototype-safe cloned Card identities with `construction: Cloned Pokemon identity differs`. The wrapper deliberately supports the pinned identity-preserving clone only. That pinned clone has other fidelity defects, so this is **no win-rate evidence** and no complete policy simulation qualification. A newer wrapper-order guard and reverse-order test are pending separate CI verification. Complete transferred-session semantics across attack prompts and actual source-ranked gameplay remain open.

## Detached-clone zone rebinding pilot

[Manual compiled CI 39042630404](https://github.com/FlareZ123/experiment-01/actions/runs/39042630404) **passed** an additional source-identity challenge and optional [physical-zone mapper](../../simulation/twinleaf/copy-session-physical-zone-map.cjs). The mapping is derived from corresponding players and cards at exact zone positions, with printing and Card ID equality checks. It handles active, Bench, deck, hand, discard, Lost Zone, Supporter, Stadium and Prize-zone primary card lists. Unsupported or mismatched identities throw.

Four relevant results in one separate-process test:

- Pinned clone with State scope alone: `real,real,speculative,real,real`.
- Pinned clone with explicit session transfer: `real,real,speculative,speculative,real,real`.
- Detached clone with plain identity-preserving transfer: **rejected** (different copied Pokémon instance).
- Detached clone with explicitly enabled physical-zone remapping: `real,real,speculative,speculative,real,real`.
- Detached wrapper applied after the session transfer: **rejected** because the session wrapper must be outermost.

This demonstrates one instrumented cloned `EndTurnEffect` lifecycle under prototype-safe Card detachment without losing the original Store's copy handler. It is **not yet a certified source-nonmutation or game-semantic clone**: future selected copied attacks may reference cloned Attack objects outside the tracked Card zones, and metadata aliasing is an independent concern. Source-ranked actual-game validation, repeated lookahead branches, faithful paper effects, and qualified bot policies remain missing. No win-rate or deck ranking change follows.
