# Pinned Twinleaf prompt continuation: native Store and Quick Ball regression

**Date:** 2026-11-26  
**Research identity:** Agent14  
**Engine:** Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Status:** Native prompt-continuation primitive and one real card-effect transition validated; MCTS adapter integration remains open.

## Question

Can a pending player prompt be safely resumed after retaining only its serialized `State`, or must the transition preserve the original Twinleaf `Store` that registered the prompt?

## Finding

The original Store is required. Twinleaf's `Simulator` constructor rejects a State containing unresolved prompts. The continuation for a prompt group is held in Store-local `promptItems` closures, not serialized into State. Reconstructing a Simulator from the unresolved State is therefore both rejected by the pinned engine and incapable of recovering the original effect continuation.

The adapter-safe boundary is to preserve the branch-local Simulator/Store through prompt resolution. Project the prompt from that Store, validate the typed actor choice, dispatch the choice to the same Store, resolve any follow-up host-only prompts, and return a stable successor State only after the effect continuation has completed.

## Reproducible evidence

The regression is implemented in:

- [`tests/2026-11/agent14-native-store-prompt-continuation.test.cjs`](../../../tests/2026-11/agent14-native-store-prompt-continuation.test.cjs)
- The test is wired into the existing [`agent5-owner-root-native.yml`](../../../.github/workflows/agent5-owner-root-native.yml) after the pinned Twinleaf compile step.

The test contains two cases.

### 1. Native grouped-prompt continuation primitive

Using the actual pinned `Simulator`, `Store`, `ConfirmPrompt`, and `ResolvePromptAction` classes, it registers a two-prompt continuation group plus an unrelated pending group. It verifies:

1. `new Simulator(unresolvedState)` throws a native `GameError`.
2. Resolving only the first prompt does not run the grouped continuation.
3. Resolving the second prompt runs the original Store's continuation exactly once with both results.
4. The unrelated pending group remains intact.

This confirms the Store-local continuation lifetime and grouped-prompt completion rule.

### 2. Real Quick Ball FST card-effect continuation

The test stages a native turn state, adds Quick Ball FST to the actor's hand, leaves one Double Colorless Energy as its discard cost, and places a Basic Venonat in the deck. It then:

1. Dispatches a native `PlayCardAction` for Quick Ball.
2. Obtains the real actor-owned `ChooseCardsPrompt` created by the deck-search effect.
3. Projects the prompt using Agent36's `projectPrompt()`.
4. Resolves the Basic-Pokémon selection through Agent36's `dispatchPromptChoice()`, which validates on an isolated clone but dispatches the actual result to the original Store.
5. Resolves the resulting `ShowCardsPrompt`, `ShuffleDeckPrompt`, and `WaitPrompt` through the host-only prompt resolver.
6. Asserts the selected Basic reaches the actor's hand, the Double Colorless Energy discard cost is completed, no unresolved prompts remain, and the original Store's continuation queue is empty.

The test's source, decision, and prompt settlement are deterministic under the pinned engine; the physical-random callback is used only for host-only shuffle handling.

### CI receipts

- [Run 45754516373](https://github.com/FlareZ123/experiment-01/actions/runs/45754516373): grouped native Store continuation primitive passed.
- [Run 45754899656](https://github.com/FlareZ123/experiment-01/actions/runs/45754899656): both the primitive and real Quick Ball continuation tests passed. The existing workflow ran with `native_search_only=true`; no full-game replay was requested.
- The workflow checks out and compiles the repository's pinned Twinleaf submodule before running this test. The test also asserts the checked-out submodule commit equals the frozen engine pin.

## Implication for the two-sided MCTS adapter

A search adapter that returns only `simulator.store.state` after a native action, discards the Store, then reconstructs a Simulator when it encounters a player prompt cannot preserve the effect continuation.

The first viable integration is a **fixed actor-only prompt sub-policy inside the native transition**, not prompt-node MCTS:

- Keep the branch-local Simulator/Store created from the stable input State.
- After dispatching the selected native action, process pending prompts on that same Store until the transition is stable.
- For actor-choice prompts, use the existing actor-visible projection and typed-choice dispatcher against that same Store.
- For automatic/host-only prompts, use the same Store and the separate physical-random stream.
- Return a stable successor State only after all prompt groups and their continuations have completed.
- Make `isStable` false for any unresolved prompt so the search core cannot redeterminize or expand a prompt-bearing State.

The next integration receipt should run this Quick Ball transition through the PR #75 adapter and assert that the stable post-continuation successor is exactly the State observed and expanded by search. The adapter must also persist the prompt-decision audit, policy identity/hash, actor seat, and physical RNG provenance.

## Limitations

This is a native transition/continuation regression, not a full-game simulation. It does not establish:

- that PR #75 currently preserves the Store or returns the same successor to MCTS;
- that the prompt sub-policy is strategically strong or optimized by MCTS;
- completeness for every Twinleaf prompt class, grouped-controller pattern, or card effect;
- paper Expanded legality of any deck;
- any Aichi Top 32 matchup, policy competence, or game win rate.

The 99.5% objective remains unproven. Keep this result classified as engine-integration evidence only.
