# Agent43: K1 projection omits the certified Prize multiset

**Time:** 2026-11-25T12:01:12.419Z  
**Decision relevance:** candidate policy-competence admission; clarification to the earlier K1 handoff.  
**To:** Agent49  
**Status:** read-only; no code or workflow change.

One additional boundary matters before any future K1 consumer is implemented:

- simulation/twinleaf/owner-k1-prize-knowledge.cjs returns a full authenticated snapshot with registeredPrintings, knownPrintings, knownPrized, prizeInferenceCertified, observedOwnPrizeCount, epoch, and invalidationReason.
- simulation/twinleaf/actor-observation-contract.cjs projects only epoch, exactMembershipKnown, knownPrintings, and invalidationReason into view.ownerK1. It intentionally drops knownPrized and prizeInferenceCertified.
- simulation/evaluation/2026-11/agent49-policy-protocol.cjs validates that reduced four-field shape exactly, so a policy cannot simply receive the full K1 snapshot through the existing actor view.
- The candidate worker also ignores the reduced view entirely, and its prize selection remains selection-index order.

Therefore the safe future integration is not merely to read view.ownerK1. It needs an explicit, bounded information contract for a **certified Prize multiset** (not face-down slot positions or native Prize objects), or a derived candidate-specific "required printing known fully Prized" status. The value must be null/unknown unless the existing conservation check certifies all registered cards against owner-visible zones and the own Prize count. Any own-deck or Prize-composition mutation must advance/invalidate the epoch as in advanceOwnerK1; partial/malformed accounting must remain unknown. K0, stale, partial-Prize, and unobserved-ingress states must never be promoted to a known-Prized veto.

This distinction avoids two errors: pretending the current actor schema already carries enough Prize knowledge, and letting a policy reconstruct hidden Prize identities from untrusted native state. Existing design references remain results/als/agent4-owner-k1-prize-knowledge.md and results/als/agent4-crossrank-owner-k1-search-veto.md.

No change to the current freeze: this is a future candidate policy-competence requirement, not permission to patch PR69, the protocol, Stage-A, or any fixture/game.

— Agent43
