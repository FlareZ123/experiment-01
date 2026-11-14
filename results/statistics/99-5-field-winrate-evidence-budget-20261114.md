# Evidence design for a 99.5% Aichi Top32 game win rate

**Status:** statistical design only. No deck has demonstrated this rate; no competitively paper-qualified games have been run.

## First define what “99.5% against the field” means

There are two materially different claims:

1. **Field macro-average:** the equal-weighted mean of the 32 fixed matchup win probabilities, \(\bar p=(1/32)\sum_{i=1}^{32}p_i\). This is the natural interpretation if each Top32 opponent is equally likely to be selected for a game. Matchup-level results remain mandatory diagnostics.
2. **Every matchup individually:** each of the 32 probabilities is at least 99.5%, with simultaneous confidence across all 32. This is much stronger than a 99.5% field macro-average.

Pre-register which claim is being tested. Do not switch between them after seeing results. A pooled result must never conceal the per-opponent outcomes.

## Recommended formal test for the field macro-average

Freeze the candidate 60, playing policy, all 32 exact opponent lists, simulator revision, and evaluation protocol. For each **independent holdout game**, select an opponent uniformly at random with replacement from the 32 and randomize candidate seat uniformly. This makes each game an independent Bernoulli draw from the defined equal-weighted field-and-seat mixture, with win probability \(\bar p\). The exact one-sided Clopper–Pearson interval then applies to the aggregate holdout sample.

For \(N\) formal games and \(k\) losses, the one-sided lower bound at tail probability \(\alpha\) is

\[
p_L = \operatorname{Beta}^{-1}(\alpha;\ N-k,\ k+1).
\]

The target is supported at one-sided 95% confidence when \(p_L\ge0.995\). The smallest total holdout samples for 0–3 losses are:

| Losses in the formal aggregate sample | Total holdout games needed (\(\alpha=0.05\)) |
|---:|---:|
| 0 | 598 |
| 1 | 947 |
| 2 | 1,258 |
| 3 | 1,549 |

This formal sample is uniform over the complete field, not selected from favorable opponents. It does **not** provide precise per-matchup estimates: at 598 games, the expected count is only 18.7 games per opponent. Run a separate, pre-specified diagnostic panel (for example, 30 games per opponent with 15 games in each seat position) to ensure every matchup is exercised and to expose obvious policy failures. Keep the diagnostic seeds separate from the formal holdout; do not pool a fixed-quota diagnostic panel into an ordinary binomial Clopper–Pearson interval. If a stratified sample is used for the formal claim instead, use a confidence procedure valid for that stratified design.

With the three exact lists still missing (ranks 23, 25, and 28), a uniform 32-opponent holdout cannot yet be constructed. A 29-opponent experiment is provisional and must not be labelled a full-Top32 result.

## Stronger alternative: certify every matchup separately

If the intended claim is that **each** opponent matchup has a win probability of at least 99.5%, use simultaneous one-sided 95% lower bounds. A simple conservative method is Bonferroni with \(\alpha_i=0.05/32\). For a single matchup with \(n\) games and \(k\) losses,

\[
p_{L,i} = \operatorname{Beta}^{-1}(0.05/32;\ n-k,\ k+1).
\]

The smallest per-matchup sample sizes for which the lower bound reaches 99.5% are:

| Losses in a matchup | Games needed in that matchup (\(\alpha=0.05/32\)) |
|---:|---:|
| 0 | 1,290 |
| 1 | 1,744 |
| 2 | 2,135 |
| 3 | 2,494 |

With zero losses, this is **1,290 games per opponent (41,280 total)**. The zero-loss lower bound is 0.9950036; 1,289 games falls just below the target. Balance seats within each matchup (645 candidate-first and 645 candidate-second in the zero-loss case).

This is a deliberately stronger standard than the field macro-average. It should not be presented as the necessary sample size for an aggregate 99.5% claim. Its power is also extremely low unless the true rates are almost perfect: with a true per-matchup rate of 99.9%, the chance of zero losses in 1,290 games is only 27.5% for one matchup, and the chance all 32 such tests pass is about \(1.2\times10^{-18}\).

## Power: confidence is not the probability of passing

For the recommended aggregate holdout, if the observed sample has zero losses, the one-sided 95% test passes at \(N=598\). Its probability of passing when the true field rate is \(p\) is \(p^{598}\):

| True field win rate | Probability of zero losses in 598 games |
|---:|---:|
| 99.5% | 5.0% |
| 99.9% | 55.0% |
| 99.95% | 74.2% |
| 99.99% | 94.2% |

Thus a 95% confidence procedure does **not** mean a deck whose true rate is exactly 99.5% has a 95% chance of demonstrating the target. With a zero-loss pass criterion, approximately 99.9627% true win rate is needed for 80% power at 598 games, and 99.9914% for 95% power. This is an intentionally severe target.

## Practical controls and limitations

1. **Freeze before holdout.** Freeze decklist, policy source/options, opponent lists, simulator pin, and runner revision before the evaluation seed set. Use separate development seeds; tuning against the holdout invalidates the nominal interval.
2. **Report every matchup.** Publish each opponent's wins, losses, draws, games, seat split, and interval, plus the equal-weighted macro-average. The formal aggregate interval does not replace matchup reporting.
3. **Keep draws separate.** If ties occur, report them separately and predefine whether the estimand is win probability, match-point expectation, or win/(win+loss) conditional rate. Do not silently count ties as wins.
4. **Preserve reproducibility.** Record candidate and opponent deck hashes, engine commit, research commit, policy hash/options, seed, seat, and raw outcome for every game.
5. **Do not confuse sampling precision with simulator validity.** These intervals quantify sampling uncertainty only. They do not correct unsupported cards, incorrect rules, weak opponent policies, hidden-information leakage, or selection bias. A paper-qualified engine/policy and the complete exact opponent field are prerequisites to interpreting the bound.

## Reproduction

For zero losses in a one-sided test, the standard-library calculation is:

~~~python
import math

def games_for_zero_losses(target=0.995, alpha=0.05):
    return math.ceil(math.log(alpha) / math.log(target))

print(games_for_zero_losses(alpha=0.05))       # 598 aggregate games
print(games_for_zero_losses(alpha=0.05 / 32))  # 1290 per matchup
~~~

For one or more losses, reproduce the exact beta quantile with SciPy:

~~~python
from scipy.stats import beta

def cp_lower_bound(games, losses, alpha):
    return beta.ppf(alpha, games - losses, losses + 1)
~~~

The aggregate test assumes the opponent and candidate seat are independently randomized uniformly on each formal game. The per-matchup table uses the familywise Bonferroni construction. These are different estimands and different designs.

This is a statistical design note, not a prediction that the 99.5% target is attainable and not a claim that any current candidate meets it.
