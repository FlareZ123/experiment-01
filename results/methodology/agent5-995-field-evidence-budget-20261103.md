# Statistical evidence budget for a fixed deck's 99.5% Aichi Top32 game-win claim

**Agent 5 | 3 November 2026 | mathematical calculation, no simulated games.** The target is intentionally extreme. This note quantifies the *minimum* validated game evidence that could support it under explicit sampling assumptions. It must never be interpreted as evidence that any existing list wins at that rate.

## One-sided 95% frequentist lower bound, all wins

For a fixed legal sixty and independent Bernoulli game outcomes with one fixed opponent distribution and a properly frozen decision policy, if all `N` preregistered, **paper-qualified completed** games are wins, the exact one-sided Clopper-Pearson lower confidence bound on true win probability is

\[
L_N=0.05^{1/N}.
\]

Testing the null `p <= 0.995` with all wins gives tail probability at most `0.995^N`. Hence an all-win sample needs at least

\[
N=\left\lceil\frac{\ln(0.05)}{\ln(0.995)}\right\rceil
=\mathbf{598}
\]

independent games before a one-sided 95% lower bound can reach 99.5%. Exactly 598 wins / 0 losses gives `L = 0.9950029413`; 500/500 gives only `L = 0.9940264485`, and 300/300 yields `L = 0.9900639181`.

For illustration only, if `N` IID valid Bernoulli games include observed losses, the analogous exact lower bound is `BetaInverse(0.05; wins, losses+1)`. To retain a bound of at least 0.995, at least **947 games with at most 1 loss**, **1258 with at most 2**, or **1549 with at most 3** would be needed. These are observations under a fixed model, without optional stopping, adaptive selection or posthoc omission.

## Explicitly balanced field: 32 different win probabilities

The prompt calls for one unchanged list across the complete Aichi 2026 Top32. For an illustrative **uniformly weighted 32-opponent average** `p_bar=(p1+...+p32)/32`, run exactly `m` independent games against **each** of the 32 fully authenticated original lists. When *all games* win, the probability of that event is

\[
P(\text{all win})=\prod_{i=1}^{32}p_i^m
\le
\left(\frac{\sum_{i=1}^{32}p_i}{32}\right)^{32m}
=\bar p^{32m},
\]

by arithmetic-geometric mean inequality. Therefore under `\bar p\le0.995` the all-win event is bounded by `0.995^{32m}`, even if per-opponent matchups differ. The smallest equal allocation whose all-win observation can cross one-sided 95% significance is **19 per opponent, 608 total** (tail bound `0.0474715152`, zero-loss lower average bound `0.9950849275`). These are **608 actually completed, rule-faithful, policy-frozen, independently initialized games**. An equal-rank schedule is just one defensible metagame weighting; another weighting requires its own predeclared estimator and valid uncertainty method.

Requiring every individual matchup to exceed 99.5% at *simultaneous* familywise 95% confidence is a much stronger and **not requested** condition. A simple conservative Bonferroni allocation of `0.05/32` per matchup would need **1290 zero-loss games per opponent, 41,280 in total**. The objective says **against the entire field**, which deserves per-matchup evidence, yet it does not automatically assert this simultaneous every-matchup statistical guarantee.

## Admission and simulation design consequence

- All statistics presume the **same single legal sixty** and frozen effective policy used unchanged, fully printed-paper-legal card text, real game resolution, competent original-list opponents, and unmanipulated random initialization. Engine action caps, symmetric native aborts, unresolved copied attacks, hidden-information leakage, insufficient game clocks, non-original proxies or unfinished games cannot be treated as wins.
- Historical training seeds, selected failing examples and adaptive card experiments belong in **development**, separate from a new held-out, preregistered final evaluation cohort. Selecting a deck based on success and reporting its training win rate introduces selection bias; the zero-loss calculation above then ceases to be an honest confidence statement about the selected result.
- Independent games against the same listed matchup are distinct draws; repeated A/B/A decisions from one physical source deal count as **one original source trajectory**, not multiple independent statistical trials. Matchup-level estimates, losses and exclusions should accompany any aggregate.
- Do not schedule 608 expensive Twinleaf matches yet. The repository currently has **29/32 authenticated opposing original sixties, zero paper-competitive qualified games and no selected fixed sixty**. First fix simulation/policy legality, source fidelity, missing three printed decks, matchup competence and clocks. Only then budget a meaningful prospective 99.5% validation.

The calculations are deterministic, derived from the exact binomial lower bound, the elementary AM-GM inequality, and `scipy.stats.beta.ppf` for illustrative positive-loss thresholds. They are **mathematical projections of evidence needs**, with no empirical strength claim.
