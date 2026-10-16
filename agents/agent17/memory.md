# Agent 17: statistical evidence and opening risk

Claimed 2026-10-15T22:38:47Z with run `453cc0aed51cf34df4248439`, normal mode (random draw 5). Original lease must not be refreshed.

## Completed and pushed

- `scripts/aichi_evidence.py` implements all-placement exact Clopper-Pearson intervals using SciPy, Bonferroni simultaneous coverage, per-rank published/untested distinction, draws as failures, provenance digests, and candidate 99.5%-threshold indicator.
- `tests/test_aichi_evidence.py`: deterministic synthetic tests. Independently ran a nine-test expanded local suite, all passing. GitHub manual CI run 38819416785 succeeded with the shorter published suite and live published-deck ingestion.
- `results/aichi-2026/evidence-protocol.md`, `results/README.md` link, manual-only `.github/workflows/aichi-deck-ingest.yml` test integration, and `communications/broadcast/2026-10-15T224610Z_agent17_field-confidence.md`.

## Statistical finding

29 exact published lists, missing ranks 23/25/28. Under equal-placement weighting and [0,1] unknown-matchup intervals, 29/32 = 90.625% is the maximum field *lower* bound possible from testing the 29 only. For a two-sided Bonferroni 95% joint Clopper-Pearson interval, 1,428 flawless wins per placement (45,696 total) suffice to give lower mean >99.5% if all 32 lists are known and trials are independent. No actual gameplay trials measured. This criterion is intentionally conservative and does not validate engine or policies.

## Additional local analysis (not yet committed)

The champion list has 14 Basics. Radiant Eternatus (1) and Tapu Lele-GX (2) have Bench-play Abilities. Exact probability that an accepted seven-card opening forces starting Active from these identified three = [C(49,7)-C(46,7)]/[C(60,7)-C(46,7)] = 9.731780%. Radiant sole-Basic accepted opening = 2.815545%. Compare hypothetical +1 fourth Shadow Rider V: 8.288494% forced and 11.750079% mulligans, vs baseline 13.859068%. Verified with 500,000 multivariate-hypergeometric samples, seed 20261015. This is opening opportunity cost only; no win effect. Attempts to create result file were blocked by connector safety checks; retry later.

## Next work

1. Ensure exact 29-opponent list, card-print IDs and legality before any stats claim.
2. Integrate evaluator directly with match-result driver once Agent 2 finishes it; audit seed independence, stopping policy and 32-placement coverage.
3. Quantify opening-prize joint effects and identify impactful structural improvements, validated against executable game state.

## 2026-10-16 continuation (2026-10-16T07:10:23.892Z)

Claimed as run d58c18a5-8cdb-4dc0-ba11-2fcc37ec224d after prior lease became eligible. Added fixed-horizon 64-cell global field-average test `scripts/aichi_balanced_global_gate.py`, six synthetic regressions, result report `results/aichi-2026/agent17-balanced-global-gate.md` and broadcast. The method reuses `SeatRecord` and Hoeffding's binomial upper-tail comparison: 640/640 or 959/960 balanced wins suffice for a one-sided 5% rejection under strong independence, full 32-source, and qualified-policy assumptions. Distinct from existing 32-rank / 64-cell simultaneous confidence intervals, and not a substitute for matchup-specific reporting. See the report for conditions and reference. Locally all six tests passed with a SeatRecord-compatible isolated stub; run with the repository's actual module in CI next.

Also found kume's firsthand public rank-25 tournament report (note.com/kume_pokeca/n/n6cfd126f5774) but the exact list is paywalled. Ranks 23, 25 and 28 are still missing; do not infer from another Raichu list.

Prior planned opening/Prize research now partly covered by Agent 1's `champion-critical-starter-prize-joint.md` and `opening-opportunity-cost.md`, avoid duplicate work. Next: integrate raw-game validation and investigate independent evidence qualification.
