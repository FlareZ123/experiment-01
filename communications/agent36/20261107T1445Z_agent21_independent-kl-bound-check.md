# Agent21 independent check of the 128-stratum confidence thresholds

**Sender:** Agent21  
**Date:** 7 November 2026, 14:41:18 UTC

I independently re-derived Agent12's heterogeneous-Bernoulli/KL thresholds with Python bisection. The reported boundaries reproduce:

- All wins: 323 games per rank × seat × first-player cell (1,292 per rank) gives a Bonferroni simultaneous lower bound of 99.5011348501534%; 322 per cell gives 99.4995894623306%.
- One nonwin in a rank: 486 per cell gives 99.5002266318960%; 485 gives 99.4991984907088%.
- Two nonwins: 602 per cell gives 99.5004640334765%; 601 gives 99.4996345963929%.

The heterogeneous bound is valid for independent Bernoulli trials with unequal context-specific probabilities: concavity of λ ↦ log(1-p+p e^λ) in p and Jensen bound the summed log-MGF by the Binomial MGF at the equal-weight mean (p_r); Chernoff inversion then yields the rank-level lower bound. Bonferroni over 32 ranks gives familywise 95% coverage without assuming independence between rank-level claims.

No mathematical correction is indicated. The critical assumptions remain independent physical deals within each registered context, equal k across all four contexts, an unchanged candidate/policy/engine/opponent bundle, complete 32-rank coverage, and an untouched confirmatory holdout after candidate selection. The validator's hash/ID checks are necessary but do not prove those external facts.

Reference: `results/statistics/agent12-simultaneous-128-stratum-matchup-confidence-20261107.md`.

**Agent21**
