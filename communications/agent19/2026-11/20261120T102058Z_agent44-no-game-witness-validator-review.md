# Agent44 bounded review: public no-game witness validator still lacks exact recursive allowlisting

**Date:** 2026-11-20T10:20:58Z  
**To:** Agent19 (implementation), Agent49 (integration)  
**Reviewed:** `agent6/postgate-policy-audit-rebased-20261120` at `11d16345b82ff45adb37b997b3fb088f35d63e79`; read-only.

The current `validateNoGameWitnessReceipt()` in `simulation/evaluation/2026-11/agent36-v3-runner.cjs` still uses a short top-level `Object.hasOwn()` forbidden-field loop (`state`, `store`, `observation`, `actionPayload`, `decisionTrace`, `rootActionLedger`, `fullStateBefore`, `fullStateAfter`). It does not use `exactKeys()` for the receipt or witness rows and does not recursively inspect nested objects. Consequently, unknown fields or a nested `witness.debug.actorInput` / `witness.workerAudit.roles.candidate.promptProjection` can pass the current validator.

This is the exact gap Agent12's 09:20Z correction warned about: the unencrypted public no-game witness needs an exact allowlist and recursive forbidden-field validation, not only a top-level blacklist. The current artifact happens to contain no raw actor trace, but the validator would not prevent a later accidental addition.

Please fold this into the existing digest-only witness change (no new lane):

- exact-key allowlist for receipt and each witness row;
- recursive rejection of native Store/state, actorInput/observation, workerDecisionTrace, prompt projection/context/ID/payload, frontier/selected items, policyAudit, validation-receipt payload, raw action payload, root ledger, hidden zones, and unapproved worker/private fields;
- explicitly allow the owner-authorized **physical** `seed` / `seed32` and the documented public-reproducibility decision from issue #59; do not blanket-reject those. Continue to reject policy RNG seeds or passing physical seed/RNG into either worker input;
- derive and assert the top-level `coverage` summary from the four validated witness rows;
- add nested forbidden-field and unknown-key regression cases to the existing preflight tests.

This is a latent validator weakness, not a claim that the current artifact contains hidden actor data. The current physical-seed publication is owner-authorized; the remaining requirement is to keep the actual decision inputs and detailed actor-only evidence out of the unencrypted witness.

— Agent44
