# Aggregate field certification by complete 64-cell e-process blocks

**Agent 9, 19 October 2026.** Mathematical result and locally executed unit tests, with a pure-Python reference implementation. **No new played games and no inferred competitive win rate.** This is an optional statistical confirmation design for a future fully qualified, frozen single 60-card deck.

## Relationship to existing implementation (discovered during independent review)

The repository already implements the central complete-64-cell, independent-trial anytime calculation in [`scripts/aichi-anytime-field-evidence.cjs`](../../scripts/aichi-anytime-field-evidence.cjs), with a zero-loss component mixed with finite exponential factors. Its own evidence ledger validates far more game provenance than the Python reference here. [`scripts/aichi-correlated-round-evidence.cjs`](../../scripts/aichi-correlated-round-evidence.cjs) also provides a different, more conservative process that permits arbitrary within-round correlation under a conditional round-average null. The correlated model does not support the 640-game all-win inference.

**This report is an independent proof and cross-language reference for the independent-trial special case, rather than a newly discovered certification protocol or replacement for the existing JavaScript qualification gate.** On 640 hypothetical all-win records, the preexisting JavaScript mixture has e-value about `24.13948111`, while the pure `q=1` Python component gives `24.73023952`; both cross the 20-fold 95% threshold. On 576 perfect outcomes, each remains below that threshold.

For actual campaign ingestion, retain the stronger existing JavaScript checks and the distinction between independent-game and correlated-round assumptions. The Python code intentionally does not inspect `candidateDeckSha256`, legal-engine winner metadata or native first-turn draw logs; it accepts upstream claims of qualified outcomes. Its primary value is an independently testable mathematical oracle and a straightforward heterogeneous-cell proof.

## Research question

The earlier [per-cell evidence model](field-evidence.md) uses a Bonferroni 64-cell one-sided simultaneous construction. Its all-win stress test requires 1,428 games for each opponent-rank/true-start cell, 91,392 games altogether. That construction gives simultaneously valid individual-cell bounds. The requested **equal-placement and equal-start field aggregate**, however, can be tested directly under an explicitly fixed balanced sampling design.

Define the 64 cell probabilities `p[r,s]`, where `r=1..32` and `s` is the candidate's *actual* first or second turn. The target parameter is `P = sum(p[r,s])/64`. We wish to reject `H0: P <= p0=0.995` at overall alpha 0.05, with optional monitoring.

## Fully prospective protocol

Before any confirmatory games, freeze exactly one candidate 60, all **32 exact** opposing 60s, the simulator and its applied research hooks, both player policies, outcome definition, seeding and first-turn protocol. Set a single alternative `q` with `p0 < q <= 1`, and a confidence level. Run complete **64-game blocks**, containing one independent randomized game for every `(rank, actual-start)` combination. Complete every game and classify win versus nonwin. An unfinished or timed-out game is a nonwin under the proposed deliberately conservative scoring convention. If an actual start cannot be guaranteed, the block is invalid.

Every source game must be independent of all others, including across rank/start cells in the same block, and each cell probability must remain fixed across blocks. Seed IDs cannot be reused; distinct IDs alone are insufficient proof of independent RNG streams. Opponent AI may only use owner-available information. Choose the single final 60 and parameter `q` without inspecting this confirmatory sample.

Only update or stop for inference **at completed 64-game block boundaries**. Do not replace failed games or reassign cells. Preserve exact per-game evidence and provenance. Mechanical/legality/policy and paper time-control qualifications remain separate.

## Why the composite-mean test is valid

Let `X_i=1` for a win and `0` for any nonwin in a specified cell, and define its evidence factor

```
Z_i = (q/p0)^X_i * ((1-q)/(1-p0))^(1-X_i).
```

For a cell with true win probability `p_i`, its expected factor is

```
g(p_i) = p_i * q/p0 + (1-p_i) * (1-q)/(1-p0).
```

For `q > p0`, `g` is nonnegative, affine and increasing, and `g(p0)=1`. For a complete 64-cell block, conditional independence and the arithmetic-geometric mean inequality yield

```
E[product_i Z_i | previous blocks]
  = product_i g(p_i)
  <= ((sum_i g(p_i))/64)^64
  = g(P)^64
  <= 1        under H0: P <= p0.
```

The product of the block factors across completed blocks is therefore a **nonnegative supermartingale at block boundaries**. Ville's inequality bounds the probability of its ever crossing `1/alpha` under `H0` by `alpha`, even if a researcher stops at the first crossing. The conclusion concerns the fixed, equal-weighted **average**; it does not provide 64 individual opponent/start lower bounds.

This uses **independent Bernoulli trials within every block and stable probabilities conditional on previous blocks**, not the claim that all 64 cells are identically distributed. An adaptive AI upgrade between blocks, common random streams creating within-block correlation, or selection of a deck after inspecting confirmatory outcomes invalidates the derivation.

## Numerical boundary

With `q=1`, any nonwin gives this particular evidence process factor zero. Ten perfect 64-cell blocks (640 wins, 0 nonwins) give `E = 0.995^(-640) = 24.7302395244`, exceeding the 20-fold evidence threshold. Nine perfect blocks give `E = 17.9434310612`, below threshold.

| Prespecified evidence design | All-win hypothetical confirmation threshold |
| --- | ---: |
| Existing 64-cell simultaneous Clopper-Pearson/Bonferroni lower bounds | 91,392 games (1,428 per cell) |
| This 64-cell balanced, field-aggregate e-process, `q=1` | **640 games (10 per cell)** |
| Same balanced e-process, `q=.999` | 768 games (12 per cell) |

The reduction arises from **a different statistical question**, field aggregate rather than simultaneous claims for every matchup. A perfect 640-game run is a very demanding event. These counts are planning boundaries, not forecasts or claims of genuine Pokémon wins. Other choices of `q<1` allow the evidence statistic to recover from nonwins at the expense of weaker perfect-run evidence.

## Executable reference and verification

- Implementation: [`scripts/aichi_balanced_e_process.py`](../../scripts/aichi_balanced_e_process.py), exporting `Trial`, `assess_balanced_blocks` and `flawless_blocks_needed`.
- Tests: [`tests/test_aichi_balanced_e_process.py`](../../tests/test_aichi_balanced_e_process.py). **6/6 tests passed locally in Python 3** after correcting a real `0 * -inf = nan` edge case for `q=1`. Tests cover the 576/640 all-win threshold, recovery under `q=.999`, a heterogeneous null example, incomplete/duplicate rank-start cells, repeated seed IDs and malformed inputs. No GitHub Actions CI result is claimed.
- The assessor reports an **anytime p-value upper certificate** from the historical maximum log evidence at completed boundaries and a first threshold-crossing block. Its label `target_demonstrated_statistically` is valid only under the documented design assumptions. It is not independent verification that any submitted win was correctly adjudicated.

## Research significance and current blockers

This design makes credible **aggregate** testing more computationally tractable after game mechanics, decision policies and source opponents are qualified. It should **not** be used to accelerate the current unqualified generic-bot simulations into win-rate claims.

The exact 60-card lists for ranks **23, 25 and 28** remain unknown, so the complete 64-cell confirmatory design cannot currently be run. The repository has **zero independently competitive-qualified Aichi games**, and no evidence that any candidate achieves 99.5%. The existing per-matchup model remains valuable for identifying concentrated weaknesses and showing matchup-level performance; this aggregate test should complement that diagnostic programme after a final list has been frozen.
