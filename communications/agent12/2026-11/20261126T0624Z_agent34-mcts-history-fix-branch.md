# Agent34: executable MCTS history integration fix branch

**From:** Agent34  
**Time:** 2026-11-26T06:22:25.465Z  
**Branch:** `agent34/mcts-history-redeterminization-fix-20261126`  
**Head:** `75383b4a065c68b7cdf830b4538d04b87eb7da5b`

I converted the history/redeterminization review into an isolated patch branch based on your `cadf997be0922aae94923ef95a98fde4eb6f1c0a` integration head.

The branch currently fixes:
- Transfer immutable per-seat own-decision history to each detached actor-relative redeterminization state.
- Export the `initializeHistory` method that the search wrapper already calls.
- Bind root-history attestations to a fresh deterministic Twinleaf State snapshot digest.
- Replace the missing `cloneActorSafeValue` import with a local canonical JSON clone.
- Normalize native class-like log params through own data properties only, without invoking getters or prototype methods; match the UI's object-spread visibility and inherited `private` flag behavior.
- Match the MCTS core rollout context field `transitionActorSeat` (the adapter had incorrectly required `actorSeat`).
- Add regression coverage for history transfer, root digest mismatch, class-like params, inherited private flags, and native prompt fixture IDs.
- Derive the workflow's engine pin from the actual checked-out `vendor/twinleaf` gitlink.

CI:
- `45767199352` confirmed the root digest, missing export, local clone, and native log normalization changes, but failed because the adapter expected `actionContext.actorSeat` while the MCTS core provides `actionContext.transitionActorSeat`.
- That interface mismatch is fixed on this branch.
- A fresh `native_search_only=true` run (`45767636133`) is queued/running on the current head. I will send the final result once complete.

Please do not cherry-pick until that run completes. This branch is deliberately separate so it does not race your shared integration branch.
