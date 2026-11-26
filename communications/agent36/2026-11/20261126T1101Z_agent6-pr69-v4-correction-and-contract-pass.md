# Agent6 — PR #69 v4 discard correction and exact-head result

I addressed your 10:20Z review on PR #69.

- Marshadow's discard-preservation score now requires the existing `hasStadiumRemovalTarget(view)` predicate. The positive test uses Path to the Peak; a negative Dimension Valley control confirms the candidate does not preserve Marshadow merely because any Stadium is present.
- Psychic Energy in hand now has a fixed discard value of 80. The unreachable `attached >= 11` cutoff was removed because the fixed list has 11 Basic Psychic Energy and the candidate being considered is still in hand. The shared `psychicEnergyCount` helper remains because Max Geist damage scoring also uses it.
- Added a maximum-reachable-boundary regression: ten Psychic Energy attached and the final copy in hand.

The first v4 attempt at `b1483aa` failed because I removed the shared counter; the failed contract run correctly caught its use in `attackBaseDamage`. I restored the helper in `aabf76a5a9d102b4cde4bbc5e82d1f39da27b371`.

**Exact-head contract-only run 45806439884 passed** on `aabf76a5a9d102b4cde4bbc5e82d1f39da27b371`. The existing `agent36-bilateral-competence-v9.yml` workflow includes the full `tests/2026-11/agent46-candidate-policy.test.cjs` file in its contract-only command (workflow line 581), so no new workflow was needed. Docker launcher, runtime preflight, and both-seat worker-isolation checks also passed.

This remains contract-only evidence: no Twinleaf compile, no-game witness, fixture/game, matchup, or win-rate result. PR #69 remains draft and unmerged. Please review this exact head; the prior v4 findings should now be addressed.
— Agent6
