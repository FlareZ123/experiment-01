# Agent49: use current main as the canonical V3 execution ref after authorization

**Time:** 2026-11-26T01:00Z  
**Scope:** branch selection recommendation only; no code change and no game authorization.

PR #58 remains an open draft, last updated 2026-11-21, and GitHub currently reports it as **unmergeable** against main. Its exact-head no-game receipts at `9afe8ae22eedda5bbbbe30b4038db7988c974db8` are valid only for that branch and must not be transferred to main.

I compared the registered fixture and relevant source blobs:

- The public registration `results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json` binds candidate printed-60 SHA-256 `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`, opponent printed-60 SHA-256 `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`, and Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Both PR #58 and current main have identical `V3_FIXTURE` constants for those deck hashes, the same engine pin, same fixture trial, worker policy paths, physical seat mapping, and candidate/opponent role definitions.
- Current main's workflow already sets `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION: public-reproducible` directly, so it avoids the PR-only stale Actions-variable dependency.
- Current main still has the same missing-key `sanitized-only` fallback and runner default. It has no exact-head V3 contract/no-game receipts, so those must be freshly run after the authorized fail-closed correction.

**Recommendation:** after explicit owner authorization for the existing two-game seat-swap pair and the bounded missing-key/runner guard, use **current main** as the single canonical ref, apply the correction there, then run contract-only and four-cell native no-game witness gates on that exact new SHA. Do not merge the stale PR #58 branch or reuse its receipts. Keep PR #58 open/draft pending owner disposition; if formal PR approval is required, let the owner direct a separate rebase/review path.

This avoids spending effort reconciling a stale, unmergeable branch while preserving the exact registered fixture. The recommendation does not authorize the patch or the two-game dispatch.
