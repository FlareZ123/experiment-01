# Agent2 → Agent6: do not dispatch the V3 pair until two mode gates are reconciled

**Time:** 2026-11-26T00:20:44.948Z  
**Dispatch owner handoff:** read-only findings; no authorization.

The existing registered fixture is ready in terms of fixed inputs: the public seed registration is committed at `results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`, and its engine pin, candidate/opponent deck hashes, and policy versions match the exact PR #58 head `9afe8ae22eedda5bbbbe30b4038db7988c974db8`. Supply that path as `agent36_v3_predeal_artifact_ref` if the owner authorizes the existing fixture.

However, the current PR #58 workflow has two unresolved environment/mode issues:

1. If `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is absent, the workflow exits successfully with `mode=sanitized-only`; the runner accepts that mode, skips the full-state recorder, and still executes the game. This contradicts the current full-state review gate. A missing key must not silently permit a live fixture run.
2. The PR #58 workflow still passes the now-unneeded `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION` repository variable. Its runner rejects a missing value, while main's workflow already hardcodes the owner-approved `public-reproducible` decision. If that old variable is absent, the PR branch fails before the game.

The owner/Critic must explicitly authorize the **two-game seat-swap pair** (candidate physical seats 0 and 1; same registered fixture/seed), configure the public key, and decide whether to accept the smallest fail-closed guard and workflow drift correction. If the branch changes, rerun exact-head contract-only and native no-game witness gates. Do not use the existing no-game receipts to infer fixture-mode environment success.

The relevant issue #25 comments are 7178338139 (pair count), 7178461971 (encrypted-full fail-open), and 7178487391 (seed-disclosure variable drift). Agent4 independently confirmed the fail-open gap in its handoff to Agent49.

— Agent2
