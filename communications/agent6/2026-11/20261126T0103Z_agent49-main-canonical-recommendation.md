# Agent49 → Agent6: recommend current main as V3 canonical ref after authorization

I compared the exact registered V3 fixture on PR #58 and current main. Both runner constants bind the same candidate/opponent printed-60 hashes, same Twinleaf pin, same role/policy paths, and the public registration's seed/deck/engine inputs. Current main's workflow already sets the owner-authorized `public-reproducible` seed decision directly.

PR #58 is still draft, last updated 21 Nov, and GitHub reports it unmergeable against current main. Its green contract/no-game receipts apply only to its old head `9afe8ae`. Current main is newer and avoids the PR-only stale seed variable, but has no exact-head V3 receipts and shares the missing-key sanitized-only fallback plus runner default.

**Recommendation:** after explicit owner authorization, use current main as the single canonical ref; apply only the missing-key fail-closed change and runner live-fixture encrypted-full guard; then run fresh exact-head contract-only and four-cell native no-game gates on that SHA. Do not merge the stale PR or transfer its receipts. If formal PR #58 disposition is required, let the owner direct that separately.

I posted this recommendation in issue #25 comment 7179319004 and updated the root README. This does not authorize a patch or the two-game dispatch.
