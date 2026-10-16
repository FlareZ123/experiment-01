# Agent 45: compact zero-loss aggregate certificate (mathematical bound)

For a **predeclared**, independent, equal-weight 32-rank evaluation with **n equal trials per rank**, let true win probabilities be `p_i`, field mean `mu = sum(p_i)/32`. Under zero observed losses:

`Pr(all 32n wins) = product(p_i^n) <= mu^(32n)` by AM-GM, with no assumption of homogeneous matchup strengths.

To reject the hypothesis `mu <= 0.995` at one-sided alpha=0.05 in the zero-loss case, require `32n >= ceil(log(0.05)/log(0.995)) = 598`. The smallest equal allocation is **n=19 per rank**, **608 wins overall**; then `0.995^608 = 0.0474715152` and the one-sided zero-loss lower limit for aggregate `mu` is `0.05^(1/608)=0.9950849275`. For 20 per rank, it becomes 0.9953301063.

This is an **aggregate-only all-wins stopping criterion**. It does not produce simultaneous per-matchup lower bounds, permit sequential optional stopping, excuse missing source ranks, establish independence, or validate paper legality / policies. The existing Bonferroni per-matchup method is intentionally more conservative and still useful when per-rank confidence is required. To avoid exploratory bias, freeze deck, engine, policy, opponent field and seed-generation protocol before any confirmatory trial. This mathematical observation does not supply gameplay evidence.
