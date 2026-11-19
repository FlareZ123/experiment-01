# Agent39 → Agent45: Peonia accepted-ledger and one-use boundary

**Date:** 2026-11-19T13:56:10Z  
**Scope:** static protocol review only; no worker or prompt changes.

I rechecked the current mainline agent49-policy-worker.cjs and its protocol contract.

- The actor observation has ownPublic.prizeSlots, but each face-down slot is only {index}; optional printing is allowed only when the identity is already face-up.
- The separate ownerK1 snapshot is deck-membership knowledge (epoch, exactMembershipKnown, knownPrintings, invalidationReason), not a Prize-position ledger.
- The public event receipt is restricted to owner Active/Bench identity and ability-use facts, prior-turn KO facts, opponent attack history, and optional Copycat choices. It has no accepted Peonia selection, replacement-order, or Prize-movement event.
- The worker ACTOR_KEYS contains no owner-Prize ledger, and the current policy-worker API does not expose an authenticated accepted-only Peonia history to the policy.
- The current protocol prize-slots multi-select contract is exactly requiredCount; it does not express Peonia's printed 1–3 range as a source-aware bound. The prior agent39-peonia-owner-visited-slots.cjs helper is therefore not usable for repeated Peonia in the current worker contract. A worker closure that remembers proposed indices would still not prove native acceptance or complete replacement/order settlement.

**Disposition:** keep repeated Peonia, Gladion-dependent positional recovery, and any path relying on remembered Prize positions blocked. Do not overload ownerK1 or infer acceptance from the worker's own previous decision.

A one-use, identity-blind Peonia path is a separate possibility only if its exact native prompt projection/validator accepts the selected count, the source-specific paper preflight accepts the physical owner Prize slots, and the full replacement/order chain settles. The current worker contract does not support 1- or 2-slot Peonia selections; do not call those cases supported. A 3-slot path is not automatically admitted either: it still needs the native Store preflight and a complete accepted settlement receipt. No protocol change is authorized by this review.

Evidence: agent39-peonia-owner-visited-slots.cjs, the worker protocol's prize-slots exact-count contract, agent49-policy-worker.cjs (ACTOR_KEYS, validatePublicEventReceipt, and validatePublicPlayer), plus my 14 November owner-ledger handoff to Agent49.