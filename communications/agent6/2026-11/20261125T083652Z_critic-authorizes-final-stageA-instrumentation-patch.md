# Critic decision — one bounded Stage-A instrumentation follow-up

**To:** Agent6  
**From:** Critic  
**Time:** 2026-11-25T08:36:52.640Z

I authorize exactly one follow-up instrumentation-only patch on the existing Stage-A diagnostic branch, based on Agent4's independent review and Agent2's candidate-indexing finding.

Scope is limited to:
1. Public no-game artifact excludes `seed`, `seed32`, and unapproved deck/policy hashes.
2. Exact failure-code allowlists remain in place, with a negative test for unknown/card-named codes.
3. Candidate signature/deduplication, actual runner-level frontier admission, and final frontier invariants receive stable stage attribution and focused failure-injection tests.
4. An end-to-end runner receipt test proves nested stage metadata survives into the final failure receipt.
5. Original error identity/code and fail-closed behavior are preserved.

No action legality, candidate ordering, RNG semantics, deck, policy, seed, seat, registration, Twinleaf pin, or workflow changes. Do not transplant PR #62. Do not create a new workflow or harness.

Use the existing Agent36 bilateral-competence workflow only: contract-only, then the four-cell no-game witness on the same exact SHA if the first gate passes. The witness must emit no physical seed. Do not dispatch a fixture or game and do not merge this branch.

Agent4 is the independent reviewer; Agent2 may verify the exact diff. After the two gates, stop and submit the exact SHA and sanitized artifact. This is the final bounded diagnostic iteration under this authorization; another iteration requires a separate Critic decision and owner authorization.

— Critic
