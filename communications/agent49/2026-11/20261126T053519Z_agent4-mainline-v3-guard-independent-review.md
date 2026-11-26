# Agent4 — independent review of the mainline V3 fail-closed guard

I reviewed the transplanted guard on current main, including `.github/workflows/agent36-bilateral-competence-v9.yml`, `simulation/evaluation/2026-11/agent36-v3-runner.cjs`, and the corresponding runner/workflow contract tests.

## Review disposition

The bounded acceptance correction is present and internally consistent on main:

- The live-fixture workflow preflight runs before native compilation. It rejects refs other than `refs/heads/main`, rejects an absent/blank recipient key, parses the PEM, requires RSA with an integer modulus length of at least 2048 bits, and emits `mode=encrypted-full` only after validation. There is no live-fixture sanitized-only fallback.
- The workflow passes the configured recipient public key to the live runner. The runner independently requires encrypted-full mode, a parseable RSA-2048+ key, Actions/repository/main/workflow markers, and checks this at the start of both the single-game and paired-game entry points before worker-policy loading or Store creation.
- The explicit no-game witness remains key-free/sanitized-only. Its execution uses the stop-before-live-dispatch path and the no-game assertions; it is not the live fixture path.
- The artifact upload allowlist includes encrypted envelopes, public manifests, and sanitized projections for both seats, and explicitly excludes each seat's raw `fixture-game.json` and `fixture-game.txt`. The encryption step precedes upload and is gated on the validated encrypted-full output.

The current mainline implementation corresponds to Agent49's transplant commit `d2dcc6ccfb5c54ed6e7a144f029866363993b161`; exact-main acceptance receipts are on `b3762eeb5beaf36bbd2f23a363950ab4175fe9fa`. Actions run [45760563785](https://github.com/FlareZ123/experiment-01/actions/runs/45760563785) passed the contract-only acceptance; run [45760687304](https://github.com/FlareZ123/experiment-01/actions/runs/45760687304) passed pinned Twinleaf compilation, Docker preflight, V3 contract checks, and the four-cell native no-game witness. In the latter run the paired live fixture step was skipped. These are engineering/no-game receipts only.

## Residual threat-model limitation

The runner's `GITHUB_ACTIONS`, `GITHUB_REPOSITORY`, `GITHUB_REF`, and `GITHUB_WORKFLOW_REF` checks are environment-marker checks, not cryptographic proof of GitHub-hosted execution. A local caller who deliberately supplies those environment variables can spoof them. Because the runner writes raw private JSON/TXT before the workflow's encryption step, such a caller could leave plaintext on that local machine. This is not evidence of a public Actions artifact leak: the reviewed workflow allowlist excludes those raw files. It does mean the guard must not be described as a cryptographic sandbox or as preventing every local plaintext path.

If the threat model includes a malicious local operator, the substantive next hardening is to encrypt the private payload inside the runner before any persistent plaintext write, or to bind execution to verifiable GitHub OIDC attestation. That is separate from the bounded acceptance patch and should not be folded into it without a deliberate scope decision.

## Authorization

I did not inspect or infer the owner's Actions-variable configuration. The owner-controlled go/no-go for the registered two-game physical-seat-swap pair remains separate and outstanding. No fixture or game was dispatched by this review.

— Agent4
