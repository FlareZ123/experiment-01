# Evidence budget for a 99.5% Aichi Top32 game win rate

**Status:** statistical design only. No deck has demonstrated this rate; no competitively paper-qualified games have been run.

## Question and estimand

For one **frozen 60-card candidate deck and frozen playing policy**, what per-opponent sample size is needed before a 99.5% game win probability is supported by a one-sided confidence bound?

Treat each of the 32 Aichi opponents as a fixed stratum. A game is one Bernoulli trial (win/loss); report draws separately and define any draw treatment before testing. The calculations below assume independent game seeds within each matchup, a fixed engine revision, and no policy/deck tuning on the evaluation sample.

A pooled win rate alone is insufficient: a favorable aggregate can conceal a weak matchup. Report every opponent's wins, losses, draws, seat split, and interval, plus the equal-weighted field macro-average.

## Exact one-sided Clopper–Pearson lower bound

Let \(n\) be games and \(k\) losses, so there are \(n-k\) wins. The exact one-sided lower confidence bound at tail probability \(\alpha\) is

\[
p_L = \operatorname{Beta}^{-1}(\alpha;\ n-k,\ k+1).
\]

For zero losses this simplifies to

\[
p_L = \alpha^{1/n}, \qquad
n_{\min} = \left\lceil \frac{\log(\alpha)}{\log(0.995)} \right\rceil.
\]

The threshold is met only when \(p_L \ge 0.995\). The table below gives the smallest total games per matchup for which the bound reaches 99.5%, for 0–3 observed losses. Values for \(k>0\) were computed using the exact beta quantile (SciPy 1.17.0).

| Losses in a matchup | One matchup, one-sided 95% (\(\alpha=0.05\)) | 32-matchup simultaneous one-sided 95% (Bonferroni \(\alpha=0.05/32\)) |
|---:|---:|---:|
| 0 | 598 | 1,290 |
| 1 | 947 | 1,744 |
| 2 | 1,258 | 2,135 |
| 3 | 1,549 | 2,494 |

For the zero-loss familywise case, \(n=1{,}290\) gives \(p_L=0.9950036\) per matchup; \(n=1{,}289\) falls just below the target. Across all 32 opponents this is **41,280 games**, with 645 games per opponent in each candidate-seat position. The Bonferroni construction gives at least 95% simultaneous coverage across all 32 one-sided lower bounds without assuming independence between matchup intervals.

For comparison, a two-sided 95% interval for one matchup with zero losses needs 736 games before its lower endpoint reaches 99.5%. The one-sided bound is the relevant test when the claim is specifically “at least 99.5%.”

## Practical implications

1. **Pre-register the claim.** Decide whether 99.5% means every matchup clears 99.5% (the conservative standard above) or only the equal-weighted 32-opponent macro-average. Do not change the interpretation after seeing results.
2. **Balance seats.** For 1,290 games per opponent, play 645 with the candidate first and 645 second. Record seat-specific outcomes as well.
3. **Freeze before holdout.** Freeze decklist, policy source/options, opponent lists, simulator pin, and runner revision before the evaluation seed set. Use separate development seeds; tuning against the holdout invalidates the nominal interval.
4. **Keep all 32 strata visible.** With only the 29 authenticated lists currently available, the zero-loss familywise plan would require 37,410 games for those 29, but ranks 23, 25, and 28 remain untested. This is not a full-Top32 result.
5. **Do not confuse sampling precision with simulator validity.** These intervals quantify binomial sampling uncertainty only. They do not correct unsupported cards, incorrect rules, weak opponent policies, hidden-information leakage, or selection bias. A paper-qualified engine/policy and a complete exact opponent field are prerequisites to interpreting the bound.
6. **Keep draws separate.** If ties occur, report them as their own outcome and predefine whether the target is win probability, match-point expectation, or a win/(win+loss) conditional rate. Do not silently count ties as wins.

## Reproduction

For zero losses, the sample-size calculation uses only the Python standard library:

~~~python
import math

def games_for_zero_losses(target=0.995, alpha=0.05):
    return math.ceil(math.log(alpha) / math.log(target))

print(games_for_zero_losses(alpha=0.05))       # 598
print(games_for_zero_losses(alpha=0.05 / 32))  # 1290
~~~

For \(k>0\), reproduce the table with:

~~~python
from scipy.stats import beta

def cp_lower_bound(n, losses, alpha):
    return beta.ppf(alpha, n - losses, losses + 1)
~~~

This is a conservative evidence budget, not a prediction that the 99.5% target is attainable and not a claim that any current candidate meets it.
