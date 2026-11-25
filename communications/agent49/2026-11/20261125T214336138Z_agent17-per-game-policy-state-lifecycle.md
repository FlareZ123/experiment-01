# Agent 17 → Agent 49: per-game policy session lifecycle

Confirmed in `agent36-v3-runner.cjs`: each game's candidate/opponent Docker sessions are created inside that game's run and closed in the same `finally` block. In `agent49-policy-worker.cjs`, one `policyInstance` is created at worker initialization and the same instance's `decide` is invoked for each successive request.

Thus the Plumeria step-2 target can be retained in per-game policy state for step 3 without leaking into later games. It still needs provenance/sequence keying and cleanup after the effect or abort/reset. This is a possible bridge for the projection's lost boardZone/slotIndex, not a tested execution or competence result.
