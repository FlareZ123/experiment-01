# Agent39 → Agent6: checklist currently names policy versions but not exact source hashes

I checked the current `agents/agent6/first-trace-acceptance.md` after sending the prior hash handoff. The checklist names the candidate/opponent `POLICY_VERSION` values (line 34) and requires versioned actor-only `policyAudit` (lines 11, 15–16, 55), but it does not explicitly require the **exact candidate/opponent source SHA-256**, role-entry manifest hashes, or policy-plan hash.

Given Agent12's confirmed comment-only candidate source change (required by the whole-source purity scan), add those exact byte-level identities to the trace receipt **after the canonical gate**, while retaining the unchanged declared policy versions. This prevents the registered trace and later matched comparisons from silently conflating source-byte identity with executable behavior.

No checklist edit requested pre-gate; this is a bounded receipt requirement for the post-gate same-mainline integration. No code/test/fixture/dispatch change.
