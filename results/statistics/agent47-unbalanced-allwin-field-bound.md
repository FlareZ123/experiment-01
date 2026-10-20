# Unequal rank allocation and zero-loss field inference (conditional design result)

**Agent 47, 20 October 2026.** This is a mathematical planning calculation, not observed gameplay, a legal deck, a candidate ranking or a 99.5% win-rate claim. The repository continues to have **29/32** exact source lists and **zero competitively qualified full games**. The common two-player decision-policy and paper-rules gates have priority over further hypothetical sample-volume optimization.

## Question and established method

The [existing 64-cell confidence protocol](field-evidence.md) gives conservative simultaneous exact intervals; the [balanced aggregate e-process](anytime-field-aggregate.md) supports a different confirmatory sequence with **64 rank × seat cells per full round**. This note examines a narrower *fixed-sample, all-wins-only* question: how strongly can an **unbalanced rank allocation** support the *equally weighted 32-rank mean*, rather than its trial-weighted mean?

Assume a **predeclared, nonadaptively fixed** count `n_r` of independent Bernoulli trials at each rank, a single frozen candidate and playing environment, and a stable per-rank game-win probability `p_r`. Actual first/second turn effects can only be folded into `p_r` if each game independently receives an authenticated fair 50/50 turn-order randomization. Otherwise apply a separate 64-cell model. Assume that every registered trial **wins**, with no omissions, errors or censoring. These assumptions currently fail as a description of any qualified repository campaign.

The probability of observing all wins for a given vector of true probabilities is `L(p)=product_r p_r^{n_r}`. For a one-sided `1-alpha` lower confidence bound based exclusively on the all-win event, exclude vectors with `L(p)<alpha`; the event could arise at most `alpha` of the time under a parameter in the excluded set. Any result containing a nonwin would return the trivial lower bound 0 under this deliberately limited confidence procedure.

The sharp lower bound on the **unweighted** mean is

```text
minimize (sum_r p_r)/32
subject to sum_r n_r * log(p_r) >= log(alpha)
           0 <= p_r <= 1
```

By the convex Kuhn–Tucker conditions, at the boundary `p_r=min(1,lambda*n_r)` whenever `n_r>0`, with `p_r=0` if `n_r=0`. Choose the unique positive multiplier satisfying `sum_r n_r log(min(1,lambda*n_r))=log(alpha)`. This is a *parameter lower envelope*, not a per-rank estimate or posterior. The implementation uses a deterministic bisection for this multiplier: [field-zero-loss-confidence.cjs](../../simulation/evaluation/field-zero-loss-confidence.cjs). The file is committed but **was not yet executed in an official Node test run**, so these numerical values are independently reproduced below using Python rather than represented as CI-verified JavaScript.

## One-sided 95% design examples (alpha = 0.05, conditional on no losses)

| Predeclared rank counts | Total hypothetical perfect games | 95% lower bound on 32-rank mean |
| --- | ---: | ---: |
| All 32 ranks × 18 | 576 | **99.481258%**, below 99.5% |
| All 32 ranks × 19 | 608 | **99.508493%**, above 99.5% |
| Only 29 ranks × 19, three ranks untested | 551 | **90.133618%** |
| Only one rank × 600, 31 untested | 600 | **3.109436%** |
| One rank × 1, another × 10,000, 30 untested | 10,001 | **3.28125%** |

These examples are exact to rounding under the stated model. They illustrate why a 600-game perfect-wins tally mostly against one opponent has virtually no bearing on the uniform 32-rank objective. Missing source ranks can never be silently assigned the success probability of a related archetype. The **608 all-win** balanced sufficient condition is already known in [the existing aggregate-evidence research](anytime-field-aggregate.md); the additional contribution here is the exact partial-coverage and unequal-count boundary. The other protocols are superior when actual starting seats need independent control, nonzero losses occur, or repeated observation demands an anytime-valid e-process.

## Proof limits, verification status and operational recommendation

For any true field mean below the calculated bound, the all-win event has probability below `alpha`, since this optimization finds the minimum field mean compatible with `L>=alpha`. This is a fixed-horizon one-sided test inversion. The code uses 32 explicit rank counts; there is no authentication of decklists, game outcomes, opponent actions, RNG independence or source provenance. Python recomputation against the same likelihood equation confirmed all five table cases and the saturated two-rank example; the already existing field evidence methods were cross-checked for overlap before publication. The separate intended Node test-file creation was blocked by a repository-tool safety check, and therefore there is **no repository test or CI success to cite for this new module**.

**Use this only to reject overconfident interpretations of lopsided exploratory samples.** Keep the actual field project focused on fixing the frozen two-player owner-information-safe policy, authenticated early source pressure and a legal reply, paper Supporter quota and game-clock correctness, followed by paired prospective full-source evaluations. Do not spend simulation budget merely to make the numbers in this table look good.
