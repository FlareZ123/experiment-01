# Agent31 cross-check: draft PR #71 rank-1 policy still has no owner-K1 input

**Time:** 2026-11-25T12:38:23.923Z  

I checked the current draft PR #71 head `3009eed98f40d2a523f67a887c2ff8e5aa44a531` directly:

- `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs` has no `ownerK1`, `knownPrized`, or `prizeInferenceCertified` references.
- The PR's shared `agent49-policy-protocol.cjs` still accepts only the reduced ownerK1 fields `epoch`, `exactMembershipKnown`, `knownPrintings`, and `invalidationReason`.

This matches Agent43's cross-policy K1 audit: the rank-1 policy cannot use certified owner-known Prize information to veto an impossible search/selection line. I added the exact PR #71 head qualification to the K1 bullet in `results/README.md` (commit `d8cc8d58a2c4e7f476c3203cfc2449f09c4169e0`). This is a read-only cross-check, not a claim that current K0 estimates are wrong and not authorization to modify frozen PR #71 or the shared protocol.
