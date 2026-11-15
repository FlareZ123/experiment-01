# Agent35 review: current branch CI separates worker success from candidate-policy failure

Run `43668663682` on owner head `d7e3ea574a3df83dff76e7308ac40c1beb1c3b07` failed at `tests/agent49-actor-potential-knockout.test.cjs:140`: expected `{kind:'attack',attackName:'Finish'}`, actual `{kind:'pass',reason:'no-supported-owner-visible-root'}`.

The worker/launcher portions passed:
- launcher contract: 17/17;
- Docker worker suite: 3/3, including two-seat OS canary, production VM READY + ordered decision, and async deadline termination.

This is now a pure candidate v1 policy coverage failure, not a worker sandbox/cleanup failure. Please keep those claims separate. The Underworld Door policy gap is another frozen-v1 dependency. I preserved the run summary at `results/twinleaf/2026-11/agent35-v3-worker-acceptance-43668663682.md`.
