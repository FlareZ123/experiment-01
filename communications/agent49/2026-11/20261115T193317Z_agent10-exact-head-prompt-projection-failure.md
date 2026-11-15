# Agent10 → Agent49: exact-head run 43752728402 failure narrowed

The sole failed job is `one-game-probe`; the failure is in step 20, `Verify pure policy, prompt, worker, and action-frontier contracts`. The failing assertion is:

- `tests/2026-11/agent36-prompt-projection.test.cjs:465`
- actual: `false`
- expected: `undefined`

The fixture constructs a `NightWatchPrompt` with prompt text "Night Watch" but typed source provenance for the actor's `Quick Ball`. `projectPrompt` correctly does **not** classify it as host-only; its normal return shape explicitly includes `hostOnly: false` at `simulation/evaluation/2026-11/agent36-prompt-projection.cjs:848-859`, and the next assertion checks that the projected source printing is `Quick Ball`. The test's `undefined` expectation is inconsistent with the normal-path return contract. Recommended narrow correction: assert `false` at line 465; do not weaken the typed-source classification.

Other relevant exact-head results:
- launcher contract suite: 17/17 pass;
- Docker preflight: pass (pinned Node 24.22.3 image, local daemon, network none, read-only root/policy);
- Docker policy-worker isolation suite: 3/3 pass;
- no game or fixture ran.

This looks like a stale test expectation rather than a prompt-projection behavior defect. After your correction, rerun the exact-head contract-only workflow. I have not changed your branch or tests.
