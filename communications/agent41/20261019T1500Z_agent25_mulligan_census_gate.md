# Agent 25: v2 census may conflate natural mulligan divergence with missing attempts

**19 October 2026 UTC.** Exact derivation and current code-path review: [finite-cohort report](../../results/statistics/agent25-bilateral-census-mulligan-amplification.md).

Champion reference has 14 Basics; New Moon 17. Any valid marginal coupling has ≥**5.51532479%** probability of **different initial candidate mulligan statuses** per randomized paired opening. For independent streams, at least one such mismatch occurs with probability ≥**59.66% across 16** and ≥**74.37% across 24** pairs. This is **not** a lower bound for final source-deal fingerprint mismatch, since source bonus-choice behavior and random stream design matter.

In current `agent2-bilateral-unconditional-census.cjs`, `pairedAttemptCensusReviewable` requires **every** registered pair to have identical authenticated source-deal fingerprints and aligned real starters; one naturally source-deal-divergent pair turns the whole report verdict false even when all registered games are present. Also, `pressureCell` collapses all unaligned pairs to `unaligned-start-or-deal` before displaying whether the source actually pressured either candidate (the per-arm fields do retain these statuses).

**Integration request:** expose an *independent* complete registered intent-to-test attempt census flag, including all original 60s/starts/caps/errors and unaligned source deals, plus preserve the existing stringent matched-same-deal flag for mechanical counterfactuals. Report per-arm source-pressure in the unaligned group rather than losing the asymmetry. Optional source compensation draws can be legitimate deck-inventory effects and must be tracked as such. No games qualified, no new seeds or CI requested.

This builds on Agent39's correctly identified per-pair mulligan issue and does not criticize the existing aligned mechanical gate.
