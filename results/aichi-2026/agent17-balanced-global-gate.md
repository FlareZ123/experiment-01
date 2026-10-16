# Agent 17: fixed-horizon global 99.5% evidence gate

**16 October 2026.** This is a statistical planning and executable arithmetic result. There are no certified competitive match outcomes.

## What the test certifies

Let `p[r,s]` denote the win probability of one unchanged 60-card candidate against Aichi placement `r`, given independently randomized games in starting-seat stratum `s` (first or second). The relevant target under equal ranks and equal starting seats is

`P = sum(p[r,s], for 32 ranks and 2 seats) / 64.`

If every one of the 64 cells contains the same predeclared number `m` of independently randomized complete games, the aggregate wins `S` have a Poisson-binomial distribution with `N = 64m` Bernoulli trials. Their average success probability equals `P` even when the separate cell win probabilities differ. Under the null hypothesis `P <= 0.995`, Hoeffding's binomial comparison theorem gives

`Pr(S >= observed_wins) <= Pr(Bin(N, 0.995) >= observed_wins)`

provided `observed_wins - 1 >= N * 0.995`. The binomial upper-tail comparison is monotone in the mean, giving validity for all null probabilities. Outside that theorem's applicable upper-tail region the implementation conservatively reports p-value 1.

Reference: Tang and Tang, *The Poisson Binomial Distribution: Old & New*, Statistical Science 38(1), 2023, Theorem 2.1, https://doi.org/10.1214/22-STS852 and https://www.columbia.edu/~wt2319/PB.pdf .

## Sample budgets (hypothetical, one-sided 95%)

| Fixed games in each rank/seat cell | Total games | Maximum observed nonwins for significance | Binomial-bound p-value |
| ---: | ---: | ---: | ---: |
| 10 | 640 | 0 | 0.0404363249 |
| 15 | 960 | 1 | 0.0473574027 |
| 20 | 1,280 | 2 | 0.0459500438 |
| 33 | 2,112 | 5 | 0.0482562309 |

These are examples of favorable outcomes under a *predeclared fixed horizon*, not expected results or guidance for optional stopping. The threshold for 640 games with one nonwin fails (`p=0.1704828`). The 64-cell allocation guarantees a balanced opponent field and both first-turn positions. Draws and ties count as nonwins. Missing, unfinished or unsupported games never become wins.

## Relationship to existing research

- [Agent 17's 32-rank exact simultaneous intervals](evidence-protocol.md) remain useful for rank-specific uncertainty and honest missing-rank bounds. Their all-wins sufficient budget is 1,428 per placement, or 45,696 total.
- [Agent 5's 64-cell one-sided simultaneous bounds](../../scripts/matchup_evidence.py) separately quantify each seat/rank cell and are much more demanding if every lower interval must clear a strong aggregate threshold.
- [Agent 47's field-average proof](agent47-confidence-sample-gate.md) already showed a 608-game, 19-per-rank all-win gate without explicit seat-cell balancing. This implementation imposes **10 per cell = 640 total** and handles one or more nonwins with a theorem-backed global upper-tail test.
- The global result is deliberately insufficient to establish that every individual opponent can be beaten at 99.5%. An apparently strong aggregate still requires per-matchup reports and meaningful policy/engine inspection.

## Code, limitations and reproducibility

The new [calculator](../../scripts/aichi_balanced_global_gate.py) accepts `SeatRecord` rows from [the existing evidence module](../../scripts/matchup_evidence.py). It refuses incomplete 64-cell fields, unequal sample sizes, zero games, invalid counts or duplicates. Its target and confidence use exact rational comparisons at the theorem applicability boundary. [Six synthetic regressions](../../tests/test_aichi_balanced_global_gate.py) passed locally with SciPy and the identical `SeatRecord` interface; they are arithmetic tests rather than replay evidence.

Statistical validity assumes independent trials, fixed deck/printing identities, a fully specified and frozen evaluation policy, representative opponent policies, frozen analysis before confirmation, no adaptive stopping and reliable completed-game trace records. Full-game correctness is not certified; the engine has known defects. Exact source lists for ranks **23, 25 and 28** remain unavailable, so no present dataset meets the 64-cell requirement. Repeated attempts with new tuned candidate decks would require protection against multiple-testing/selection bias. This test must not be applied to the existing unqualified diagnostic games.

**Next step:** adapt the validator in `scripts/match_record_contract.py` to emit complete `SeatRecord` rows only after 64-cell provenance and replay qualification, then compare this global gate to the existing simultaneous marginal intervals.

## Integration with already validated raw match records

[Raw-game adapter](../../scripts/aichi_raw_global_gate.py) calls the existing [schema-v2 raw-game contract](../../scripts/match_record_contract.py) before calculating the global gate. It requires exact source-list publication for **all 32 ranks**, a batch-declared sampling horizon, exactly the same number of completed games in every one of the 64 actual starting-seat cells, zero incomplete/failure games and matching turn-order/trace/provenance evidence. Ties are counted as nonwins.

[Nine synthetic batch regressions](../../tests/test_aichi_raw_global_gate.py) check the passing 640-game arithmetic example and rejection of missing source rank, actual seat, horizon, mixed sample counts, policy stall or fraudulent first-turn attribution. The adapter is a structural/accounting preflight. Source authenticity, trace replay, algorithmic independence, representative opponents and policy competency must be separately qualified. A post hoc user-edited horizon field cannot demonstrate genuine preregistration.

[Manual GitHub Actions workflow](../../.github/workflows/aichi-global-field-gate.yml) runs both the original numerical tests and these raw-game controls. The initial numerical suite passed [workflow 38865672891](https://github.com/FlareZ123/experiment-01/actions/runs/38865672891); the extension requires a new manual CI dispatch.

**Extended CI confirmation:** 6 numerical tests and 9 synthetic raw-game tests passed [manual workflow run 38866332888](https://github.com/FlareZ123/experiment-01/actions/runs/38866332888). The previous run 38866258248 failed because one synthetic test deleted a single game while expecting a completely absent starting-seat cell; that test was corrected to remove the entire cell. No production evaluation logic changed in this correction.

## Exact-source identity seal for confirmatory raw batches

The extended raw adapter also accepts **32 externally verified per-rank deck fingerprints**. Its `source_inventory_digest()` hashes the ordered array of 32 rank/fingerprint pairs. A prospective batch must carry the same digest in `source_inventory_digest_sha256`, and **every raw game** must match its rank's expected `opponent_deck_sha256` value. This closes a previous structural gap in the raw schema: checking that a substituted opponent list stayed consistent across all games of a rank did not prove that it matched the actual published deck. A complete but source-substituted batch is now rejected.

For existing 29 lists, a fingerprint can be generated from the print-aware `canonicalCards` representation in [the published-field campaign builder](../../scripts/aichi-comparison-campaign.cjs). The upstream fingerprint convention must be frozen alongside the source. External source verification and hash-to-engine-deck attestation remain separate gates; the supplied map could itself be wrong or fraudulent. Since ranks 23, 25 and 28 still lack registered lists, a truthful 32-entry map cannot currently be assembled.

Three added synthetic controls reject an absent source-manifest stamp, a whole-rank opponent-deck substitution, and a source mapping omitting one rank. The complete suite now contains **12 synthetic raw-batch checks** plus six standalone statistical checks.
