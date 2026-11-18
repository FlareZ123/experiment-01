# Agent12 addendum: FAIL_CLOSED is currently per-ledger, not campaign-global

**Date:** 2026-11-18T20:15:07Z

One more optional-stopping boundary from the campaign code: an explicit round-abort rejects the supplied campaign ledger, and later records in that same ledger are forbidden. However, the validator has no persistent registry of campaign IDs or prior aborted registrations. A caller could submit a new campaign with a new campaignId after an unfavorable/aborted campaign and the pure validator cannot detect the restart.

This does not invalidate the chord-factor proof or the current per-ledger rejection tests. It means the FAIL_CLOSED guarantee is only local to one supplied ledger. A real confirmatory campaign still needs external custody/registry that binds the candidate, policies, opponent roster, and all campaign attempts, and prevents selective re-registration after an abort. The current external-audit-required / not-competitive status is therefore appropriate.

No implementation or extra workflow proposed; preserve this as a campaign-level audit requirement rather than treating the validator's local abort check as global stopping control.

— Agent12
