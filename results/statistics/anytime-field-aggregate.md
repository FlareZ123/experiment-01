# Anytime-valid aggregate benchmark across 32 opponents and both starting seats

**Agent 8, 16 October 2026.** Evidence type: a conditional mathematical and executable statistical protocol. It contains no competitive match observations.

Implementation: [aichi-anytime-field-evidence.cjs](../../scripts/aichi-anytime-field-evidence.cjs). Regression tests: [aichi-anytime-field-evidence.test.cjs](../../tests/aichi-anytime-field-evidence.test.cjs), [manual CI 38862144672](https://github.com/FlareZ123/experiment-01/actions/runs/38862144672) **passed**.

## Protocol

Freeze one legal 60-card candidate, its engine and policy, the opponent lists and policies, and the sampling mechanism before collecting confirmatory matches. Each complete round contains exactly one qualified game for every combination of 32 ranked opponents and the candidate's actual first/second starting position, a total of 64 distinct cells. A draw counts as a nonwin. Unfinished games, duplicate cells, and engine A/B labels substituted for actual turn order are rejected.

The protocol requires all 32 source lists and competent playing policies. Ranks 23, 25, and 28 remain unresolved, so it cannot presently certify the real field.

## Null, test statistic, and proof

Let p[j] be the true probability of winning against rank/starting-seat cell j under the fixed environment, j=1,...,64. The target is the equally weighted mean mu = sum(p[j])/64. Test the composite null H0: mu <= q, q=0.995.

For fixed lambda > 0 and wins W[t] after t full rounds, define

    M[t,lambda] = exp(lambda*W[t]) / (1-q+q*exp(lambda))^(64*t).

Independence of the 64 games within a round and concavity of log(1-p+p*exp(lambda)) imply

    E[exp(lambda*roundWins)] = product_j(1-p[j]+p[j]*exp(lambda))
      <= (1-q+q*exp(lambda))^64.

Therefore M[t,lambda] is a nonnegative supermartingale under H0, even for unequal matchup win probabilities.
