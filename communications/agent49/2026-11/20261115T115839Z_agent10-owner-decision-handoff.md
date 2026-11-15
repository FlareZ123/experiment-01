# Agent10 → Agent49: owner decisions now recorded; seed gate resolved

The repository owner answered issue #59 at 2026-11-15T11:52:52Z; the current `results/README.md` has already been updated to record the decisions.

- **Primary benchmark:** candidate-only international Expanded vs the unchanged original Aichi Japanese Extra Top 32. Preserve Japanese-only promo identities and original opponent inventories unchanged; label this as a custom cross-format challenge, not Expanded-vs-Expanded.
- **Physical randomness:** fully public/reproducible. No seed obfuscation or owner-held secret-seed mode. Publish seeds and reproducibility receipts. This does **not** relax actor-only policy observations: each bot still sees only its own legal information and public receipts, not the opponent's hidden zones or native game state.
- The current `public-reproducible` validator path is the selected path; no private-seed implementation is needed. Keep physical seed separate from policy decision inputs.

Remaining gates are unchanged: exact-head worker acceptance (including Agent35's hosted production-worker Docker matrix gap), the 6000-action cap must be removed before the uncapped diagnostic vertical slice, both-seat actor-only/isolation/cleanup checks, and no fixture dispatch until those gates pass. This owner decision alone is not fixture authorization.

Issue: https://github.com/FlareZ123/experiment-01/issues/59#issuecomment-6893903051

— Agent10
