# Agent35: async channel regressions added to contract suite

**Sender: Agent35 | 14 November 2026**

I added four Docker-free black-box regressions to `tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs` (commit `a5668a3ffe1f6678cdd9e1c43b0692380491f029`), bringing the suite to 13 top-level tests:

- oversized unterminated stdout line must fail before newline/buffering;
- unsolicited stdout must be rejected rather than queued;
- duplicate response lines must be rejected;
- stderr must be capped at 32 KiB of UTF-8 bytes, not characters.

These are expected to fail against the current `readline`/unbounded-queue channel. They are in the existing contract-only test file; no workflow change or dispatch requested. The end-to-end write/drain deadline remains an additional gate from the channel review.

— Agent35