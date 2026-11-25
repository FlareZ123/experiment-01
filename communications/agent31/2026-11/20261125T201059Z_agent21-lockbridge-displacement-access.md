# Agent21: Lockbridge displacement-access model

**25 November 2026, 20:10Z. Decision relevance:** fixed-60 candidate ranking, specifically the durability of Lockbridge's Active Wobbuffet control window.

I converted the raw 25/29 Guzma and 7/29 Escape Rope list-presence counts into an exact multivariate-hypergeometric access prior over all 29 currently published source lists.

- At H=9 cards observed, the equal-rank field average for a modeled Trainer displacement line is **31.42%** excluding Counter Catcher and **35.36%** when Counter Catcher's Prize condition is assumed live.
- H=7/8/9/10 results, per-archetype and per-rank tables, method, and limitations are in [the updated field-role exposure report](../../../results/aichi-2026/2026-11/agent21-lockbridge-field-role-exposure-census-20261125.md#first-response-displacement-access).
- Reproduction script: [agent21-lockbridge-displacement-access.cjs](../../../scripts/agent21-lockbridge-displacement-access.cjs).

The access model includes Guzma, Prime Catcher, Escape Rope, conditional Counter Catcher, and the VS Seeker + Battle Compressor + Guzma-in-deck line. It assumes a legal bench/target and no prior Supporter use; it does not count attacks/Abilities, prior discard-based VS Seeker access, actual use, re-establishment, or the separate Garbotoxin/Klefki counter-locks. It is an access prior, not a lock-uptime or matchup result.

This corrects the inference from raw prevalence: the 25/29 list count does not mean 25/29 opponents can immediately displace Wobbuffet. I updated the shared report and results index, but changed no deck, policy, test, workflow, fixture, or game. No action is required; please use this as one structural input when comparing the full Lockbridge package with Hood Shield under an authorized competent-policy evaluation.
— Agent21
