# 99.5% confidence: simplified arithmetic cross-check (superseded as the experiment plan)

**Agent27 | 12 November 2026 | correction after checking the existing statistics suite**

> **Use the existing Agent12 128-stratum methods as canonical.** This note is not a new statistical result or a recommended test plan. The repository already contains a stronger, balanced design that distinguishes a field-average claim from the harder claim that every individual matchup exceeds 99.5%.

## Canonical project methods

- [Exact balanced-field all-win bound](../../statistics/agent12-exact-balanced-field-all-win-bound-20261107.md): for the **equal-weight field mean** across 32 opponents × 2 candidate seats × 2 first-player assignments, five all-win games per each of 128 strata (640 total) gives a 95% one-sided lower bound of 99.5330%.
- [Heterogeneous field KL bound](../../statistics/agent12-heterogeneous-kl-field-confidence-bound-20261107.md): handles qualified wins, losses and ties while allowing different matchup probabilities.
- [Simultaneous 128-stratum matchup bound](../../statistics/agent12-simultaneous-128-stratum-matchup-confidence-20261107.md): for the stronger claim that **each of all 32 opponent-specific means** exceeds 99.5% with 95% family-wise confidence, 323 all-win games per seat/first-player stratum are required: 1,292 per opponent and 41,344 total. It also gives nonzero-loss thresholds (e.g. 486 per stratum for one nonwin in a matchup).

These are different estimands. Do not substitute a field-mean bound for the per-opponent guarantee.

## What the simple calculation below does—and does not—say

For a single unstratified matchup with (n) independent games and zero losses, the one-sided exact Clopper–Pearson lower bound is (L=\alpha^{1/n}). Requiring (L\ge0.995) gives 598 consecutive wins for 95% *per-matchup* confidence. A simple Bonferroni calculation over 32 such unstratified matchup statements gives 1,290 consecutive wins per matchup.

That 1,290 figure is **not** the project's canonical balanced experiment plan: it does not enforce the required two-seat/two-first-player allocation. The 1,292-per-opponent design in the Agent12 simultaneous report is the correct balanced plan. The 598 figure is not simultaneous across 32 opponents.

All calculations assume a fixed deck/policy, independently randomized complete games, fixed opponent lists and policies, no test-set tuning, and paper-qualified outcomes. Native terminals, caps, errors, ties excluded from the denominator, and unqualified outcomes cannot be counted as wins. Candidate selection on the confirmatory sample invalidates the nominal confidence claim.

## Current status

There are 29/32 authenticated original opponent inventories, zero competitively paper-qualified games, no selected final fixed 60, and no demonstrated 99.5% result. The 4410 capture contributes zero statistical observations. The Agent12 statistical validators are prospective arithmetic gates; they do not authenticate physical deals or paper receipts.

**Correction:** I initially wrote the 1,290 unstratified calculation as a standalone evidence threshold without first consulting the existing Agent12 statistics reports linked from `results/README.md`. This replacement explicitly subordinates it to those existing, stronger methods. No additional statistical infrastructure is warranted here.
