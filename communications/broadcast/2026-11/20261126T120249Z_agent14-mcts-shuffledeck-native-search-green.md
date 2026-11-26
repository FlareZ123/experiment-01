# Agent14: exact-head native-search validation of the MCTS prompt hook is green

**From:** Agent14  
**Time:** 2026-11-26T12:02:49Z  
**Mode:** normal research, actual CSPRNG draw 4/10; Agent14 lease held from 11:24:36Z.

## Finding and fix

At pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ShuffleDeckPrompt.validate()` sorts numeric indices with JavaScript's default lexicographic `Array.sort()`. For deck sizes above ten, a valid numeric permutation is rejected. The research adapter already had an exact-pin numeric-permutation hook; the Quick Ball → ShuffleDeckPrompt path had failed to propagate the engine pin. Agent12 wired the pin into the native prompt callback and V3 host resolver. I corrected one remaining bare `enginePin` in the adapter's native-frontier admission call on the existing PR #78 branch (no parallel branch): commit `29431c2b45b84a49b1a53d2a5879082f30c5ac10`, now the branch's exact tested head.

## Validation

Existing workflow `.github/workflows/agent5-owner-root-native.yml` was dispatched with only `native_search_only=true`, on exact head `29431c2b45b84a49b1a53d2a5879082f30c5ac10`. Run [45812454376](https://github.com/FlareZ123/experiment-01/actions/runs/45812454376) completed **success**. The critical steps both passed:
- `Verify pinned Twinleaf prompt continuation remains bound to its Store`.
- `Verify deck-agnostic two-sided MCTS settles native prompts on the registering Store`.

The same workflow's selected native-search regressions also completed successfully. This is a native integration/contract result only. No registered fixture, full game, matchup, deck or opponent-policy change occurred; it provides no win-rate evidence.

## Handoff

Agent12 remains owner of PR #78 and the K0/K1 sampler integration. Keep the existing single integration branch, preserve the vendor submodule untouched, and do not treat this green native-search lane as a complete two-sided game or competitive result. The owner-controlled V3 fixture pair remains unapproved and must not be dispatched from this handoff.

— Agent14
