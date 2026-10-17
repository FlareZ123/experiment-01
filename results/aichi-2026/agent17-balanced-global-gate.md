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

## Reproducible source-deck fingerprint producer

[The independent source-map producer](../../scripts/aichi-source-fingerprint-map.cjs) reads the **print-aware** Aichi manifest and the authoritative 32-rank field CSV. It reuses the exact `canonicalCards()` and SHA-256 convention already used by [the fixed campaign builder](../../scripts/aichi-comparison-campaign.cjs). Source card-row order is intentionally immaterial, while a changed printing changes the deck fingerprint. The producer checks rank, player and archetype attribution, rejects inconsistent membership, and emits the same ordered rank/fingerprint-pair manifest seal that the Python raw adapter consumes once every rank is documented.

On the actual source set it outputs **29 hashes** and `missingRanks=[23,25,28]`, with `sourceInventoryDigestSha256=null`. It deliberately cannot create a 32-rank seal from partial evidence. For a future full inventory, transform the 32 emitted `ranked[].sourceDeckSha256` values into an integer-keyed map when calling the Python evaluator. Exact name/set/number/language identity is necessary for this mapping, although it still does not certify source-to-engine substitutions or authentic gameplay.

[Five Node regressions](../../tests/aichi_source_fingerprint_map.test.cjs) verify the present 29-rank boundary, row-order invariance, changed-printing detection, and structural rejection behavior. A **clearly synthetic** full32 fixture tests the hash-seal cross-language byte convention; it does not supply the missing tournament lists. The manual statistics workflow also runs this pure source checker.

## Multiple candidate attempts: prospectively budget the experiment family

A global p-value such as 0.04044 is valid for **one frozen fixed-horizon confirmatory candidate** at 5%. Testing many independently tuned candidates and announcing the first that passes inflates the probability of a false positive. Agent 8's anytime e-process allows repeated looks **inside one fixed candidate's test**; it does not grant unlimited candidate selection across the swarm.

The new [exact alpha-spending helper](../../scripts/aichi_familywise_evidence.py) assigns confirmatory attempt `i=1,2,3,...` a one-sided significance budget

`alpha_i = 0.05 / (i*(i+1)).`

The telescoping identity `sum_{i=1}^infinity 1/(i*(i+1)) = 1` gives `sum alpha_i = 0.05`. Union-bound familywise control holds for arbitrarily many candidate attempts if each p-value remains valid conditional on the earlier experimental history. Pre-register each new candidate and index in Git history, use **fresh independent confirmatory games**, and freeze deck, policies, field, seed generation, stopping horizon and analysis before sampling. Overlapping or reused trials selected for good outcomes violate the conditional validity requirement.

| Consecutive candidate test | Allocated one-sided alpha | First multiple of 64 with all wins that passes |
| ---: | ---: | ---: |
| 1 | 0.025 | 768 games (12 per rank/seat cell) |
| 2 | 0.0083333333 | 960 games (15 per cell) |
| 3 | 0.0041666667 | 1,152 games (18 per cell) |
| 5 | 0.0016666667 | 1,280 games (20 per cell) |
| 10 | 0.0004545455 | 1,536 games (24 per cell) |
| 50 | 0.0000196078 | 2,176 games (34 per cell) |

This scheme is a prospective option, not a retrospective correction of existing diagnostic data. If the actual family of hypotheses or a fixed candidate's sampling plan is different, the spending mechanism must be declared before observations. The current missing source lists and policy defects still block any real certification. [Five exact-number synthetic regressions](../../tests/test_aichi_familywise_evidence.py) test the allocations, budget identity and outcome thresholds.

## 17 October 2026: power and finite-CI budget sensitivity

For planning once qualified full-match data exist, the fixed-horizon global gate has sharply different *power* at the same true aggregate rate as it starts allowing one or more nonwins. Under the **illustrative and stronger assumption of identically distributed independent trials with true probability 0.999 in every rank/seat cell**, direct binomial-tail calculation gives:

| Fixed games/cell | Total games | Largest nonwins still significant at one-sided 5% | Power at true 99.9% | Power at true 99.95% |
| ---: | ---: | ---: | ---: | ---: |
| 10 | 640 | 0 | 52.7124% | 72.6091% |
| 15 | 960 | 1 | 75.0477% | 91.5838% |
| 20 | 1,280 | 2 | 86.1775% | 97.2786% |
| 33 | 2,112 | 5 | 97.9108% | 99.9218% |

These are **prospective planning probabilities** under the assumed true rates, not observations, deck projections or match-win measurements. A 640-all-win design has only about 52.7% chance to reject the 99.5% null even at an iid true 99.9% rate. Unequal matchup probabilities can change power; for example, at the same equal-cell aggregate of 99.9%, a model with 63 perfect cells and one 93.6% cell yields 51.6129% all-win power at 640 games, versus 52.7124% for iid 99.9%. Both scenarios still require faithful independent games and all 32 opponent registrations before such planning can be used.

## 17 October 2026: action-trace requirement for arithmetic promotion

A structural boundary was missing: `evaluate_raw_batch` correctly records `digest_only_completed_games` and `all_completed_traces_verified`, but the higher-level `evaluate_balanced_raw_batch` previously ignored these fields. Thus a **synthetic** full-32, 640/640 winning batch could report `statistical_threshold_met: true` despite containing only unverifiable opaque `trace_sha256` strings and no supplied action traces. This is an evidentiary classification defect, independent of the already-known simulator and opponent-policy shortcomings.

The adapter now rejects any completed record without a nonempty supplied `action_trace` whose canonical SHA-256 matches the record's `trace_sha256`. The 640-game synthetic fixture uses explicitly artificial one-event, correctly hashed traces; two new regressions reject a missing trace and tampered trace content. The lower-level match-record API still accepts digest-only diagnostic games, retaining its existing diagnostic scope.

**Limits:** Trace/hash agreement proves content integrity for the supplied trace only. It cannot certify authentic engine recording, trace completeness, genuine full-state replay, independent random deals or competent choices. The Aichi source field still lacks ranks 23, 25 and 28. The current count of independently qualified competitive games remains zero.

## Candidate identity and globally disjoint sampling checks (16 October)

The adapter now requires a **second external deck fingerprint**, `expected_candidate_deck_sha256`, in addition to the full 32-rank source map. That fingerprint must match `batch.candidate_deck_sha256` exactly, so an otherwise complete batch cannot silently use a different candidate. This is a structural cross-check between a preregistered candidate card inventory and a batch-provided digest; a subsequent replay/engine-deck attestation is still necessary to prove the cards played.

The gate also refuses a repeated numerical RNG seed **anywhere** in the 64-cell dataset, rather than only in the same rank/seat cell. All 640 synthetic control games now have distinct globally assigned seeds. Unique values are **necessary but insufficient** for real independence; reuse of the same underlying RNG streams, correlated policy random sources, shared environment, and adaptively selected runs can still violate the Poisson-binomial test assumptions. Those require audit at the event-trace and RNG-implementation layer.

Three additional regressions test candidate mismatch, malformed exogenous candidate fingerprint, and reused global seed. The extended [manual CI 38869044557](https://github.com/FlareZ123/experiment-01/actions/runs/38869044557) passed the global evidence suite after the stricter requirements.
