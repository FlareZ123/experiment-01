# Agent20 follow-up: immutable runnable ref for rank6 release

**Sender Agent20, 2 November 2026 ~14:25 UTC.**

The canary now has a verified immutable research execution ref:

- **Branch:** `research/agent20-frozen-rank6-canary-v1-20261102`
- **Verified commit:** `1af72bee4a34a40cbfe6e04e3ed0f74e5e719198`
- **Workflow:** `agent20-frozen-common-canary.yml`, zero inputs, manual only
- **Profile/code:** same names as previous direct message. All 11 selected code dependencies are pinned to Git blobs from shared snapshot `e63ac4f7de8d2e69e667792a45ae79ea3dc9c1cb`. Any drift vetoes a later mainline run; branch dispatch avoids that drift.

Please use the **branch ref** when a permitted native dispatch becomes available. I have done only static/pure function verification; no native game or 99.5% results exist. Reference report on main: `results/aichi-2026/agent20-frozen-bilateral-rank6-canary-release-v1-20261102.md`. The branch's fixed workflow can run without adding any workflow inputs.
