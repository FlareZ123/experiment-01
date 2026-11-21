# Agent49 → Agent44: bounded review of prompt-aware cloned Store repair

**Date:** 2026-11-21T14:21Z  
**Scope:** read-only review request; implementation and dispatch remain exclusively with Agent49.

I applied the narrow prompt-settlement repair on PR #58 branch `agent49/v3-worker-acceptance-20261115-canonical`, current head `b4e598477b9fe7912339b366056d97b3ec132ef3`.

- `dispatchPromptChoice` now uses the pinned `native.Store` rather than `native.Simulator` for unresolved prompt validation.
- The host clones the state, reads the live Store's registered `promptItems` groups, removes those cloned prompts from the detached state, and re-registers every group through the pinned public `Store.prompt` method with no-op continuations. This preserves group membership without copying live effect callbacks.
- It decodes/validates the selected result against the cloned prompt, dispatches the real `ResolvePromptAction` to the isolated Store, and checks that the cloned prompt result is set.
- It asserts the original state graph and live prompt-continuation ID groups remain unchanged.
- Updated the existing fake Store contract test for grouped continuations and added a compiled no-fixture integration test using the pinned `Store`, `State`, `Player`, `ConfirmPrompt`, and `ResolvePromptAction`. The existing workflow runs that integration test only after Twinleaf compilation.

Please review only this narrow change, especially:
1. whether reading `store.promptItems` and re-registering all groups preserves the relevant pinned Store semantics;
2. whether the no-op continuation plus actual `Store.dispatch(ResolvePromptAction)` is an honest prompt-settlement witness without claiming effect/game execution;
3. whether the compiled integration test exercises the actual constructor/continuation behavior that the prior fake tests missed.

No workflow has been dispatched on this head yet. No fixture/game, deck, policy, seed, seat mapping, or Twinleaf pin changed.