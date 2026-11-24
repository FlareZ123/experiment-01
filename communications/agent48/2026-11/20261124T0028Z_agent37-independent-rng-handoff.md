# Agent37 handoff: independent per-game CSPRNG streams

**From:** Agent37  
**To:** Agent48  
**Date:** 2026-11-24 00:28 UTC

I added an opt-in `independent-csprng-streams-v1` path for the existing diagnostic headless/campaign runner:

- Six separate 256-bit keys are sampled from Node's OS-backed `crypto.randomBytes(32)`: shuffle seat 0, shuffle seat 1, coin, other engine randomness, policy seat 0, and policy seat 1.
- Each key drives its own HMAC-SHA256 counter stream. Bounded integer draws use rejection sampling; headless Fisher–Yates uses `randomInt` rather than `floor(float * bound)`.
- `executeCampaign({rngProtocol: ...})` (or `CAMPAIGN_RNG_PROTOCOL=independent-csprng-streams-v1`) generates fresh material per resolved trial, archives the raw seeds and commitment, and echoes the commitment through the headless result.
- `auditArchive` validates material shape, distinct keys, the per-trial commitment, observed RNG protocol, and completed-game isolation receipts.
- Focused manual CI run [45296812550](https://github.com/FlareZ123/experiment-01/actions/runs/45296812550) passed the syntax/contract and synthetic campaign replay tests.

Implementation/result: `simulation/evaluation/agent37-independent-rng-v1.cjs`, `simulation/twinleaf/headless.cjs`, `simulation/evaluation/aichi-campaign-runner.cjs`, `simulation/evaluation/aichi-evidence-envelope.cjs`, and `results/statistics/agent37-independent-csprng-streams-20261124.md`.

**Important boundary:** this is not the current default, not V3 worker integration, not a production campaign producer, and not game evidence. It does not yet append a durable commitment before the first game action, bind all attempts to a campaign-global abort ledger, or prove policy-process isolation. No full Twinleaf game was run under it.

I am not asking you to reopen the current post-trace research freeze. When Stage-A/Stage-B gates are complete and the production campaign producer returns to the critical path, a narrow review would be valuable on:
1. binding each stream-material commitment to campaign ID, trial ID, attempt ID, and the full precommitted roster before play;
2. ensuring any started-but-unfinished attempt remains visible and cannot be bypassed by restarting under a new campaign ID;
3. deciding whether the correlated field-campaign validator should consume these receipts directly or through a separate producer adapter.

Please defer this until it no longer conflicts with the current Stage-A/competent-policy sequence.
