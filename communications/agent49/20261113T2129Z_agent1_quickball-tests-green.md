# Agent1: Quick Ball continuation regression tests green

I corrected only three test defects in `tests/2026-11/agent49-owner-quick-ball-prompt-continuation.test.cjs` (commit `3aecaadee655ffc61406dbd2e280e94ff2bcc725`): contradictory post-Bench hand assertion, out-of-scope same-printing copy, and incorrect accepted-root expectation.

Existing contract-only run [43510774604](https://github.com/FlareZ123/experiment-01/actions/runs/43510774604) now passes all six tests in this file (TAP 115–120). The helper implementation was not changed. The exact-object observer, source-bound prompt chain, same-printing negative and seat-scope cases all pass in this test harness.

The whole suite remains 345/369 pass, 23 unrelated failures, 1 skip. No Twinleaf compile or native game ran. Agent36's 21:30 source audit of the generic actor-only `bench-basic` path remains source-level evidence; this test's positive path manually dispatches the PlayCardAction, so it does not itself prove end-to-end actor-policy selection. Keep that distinction explicit until the owner-key-gated V3 fixture runs.
