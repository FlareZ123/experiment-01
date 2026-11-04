# 99.5% field objective: exact no-loss statistical floor for balanced Aichi Top 32 tests

Agent 8, 4 November 2026. **Pure mathematics and proposed certification design; zero competitively qualified matches currently exist.** This describes evidence necessary under an ideal model, not evidence that any deck reaches the objective.

## Estimand and assumptions

Let p_i be the true probability that the **same immutable fixed 60** wins a single correctly adjudicated paper Expanded game against original Top-32 rank i using a frozen, competent, symmetric pair of playing policies and a specified starting-seat mix. Define the equally weighted field game rate p̄=(p_1+...+p_32)/32. Opponents and selected deck are frozen before testing. For the derivation assume game results are independent conditional on their matching rank and seat, all original printing/mechanics/clock source tests pass, and simulations truly sample the claimed paper playing environment. These assumptions are demanding and currently unmet.

## Exact one-sided all-success test

If a preregistered trial first chooses the opponent rank uniformly and independently before each game, the aggregate game outcome is Bernoulli(p̄). Observing n wins with zero losses yields one-sided 95% binomial lower confidence limit L=(0.05)^(1/n). To exclude p̄≤0.995 with zero losses requires n≥ceil(log(0.05)/log(0.995))=**598** independent wins. At n=598, L=0.9950029413057535. This denominator gives no guaranteed coverage of every original opponent and is not an adequate standalone field protocol.

An exactly **balanced** field design fixes m independent games against each rank (n=32m), so every rank is represented. Under the composite null p̄≤0.995, the probability of *all* wins is product_i(p_i^m). By the arithmetic-geometric mean inequality product_i(p_i^m)≤p̄^(32m)≤0.995^(32m). The strongest possible null probability is achieved at p_i=p̄. Therefore an all-success one-sided 95% rejection is valid at m≥19 per rank: 608 total wins, with null probability at the boundary 0.04747151515758818; 18 per rank gives 0.05573070148010844 and is insufficient. A corresponding conservative lower limit for p̄ from 608/608 balanced wins is 0.9950849274554779.

If both physical starting seats must be represented **equally**, model 64 fixed rank-by-seat strata, 10 games per stratum, for **640/640** independently drawn wins as the first balanced-even zero-loss design meeting the gate. The 95% lower field-seat average then is 0.9953301063421702; boundary null probability is 0.040436324889279666. A single loss requires a different exact composite-null confidence procedure and generally more games. If the deck was selected by looking at these game results, the post-selection inference is invalid without separate preregistered holdout trials or selection adjustment.

## Limits of what such evidence would mean

- A 99.5% **aggregate** field game rate does not establish 99.5% in each matchup. Even 31 perfect ranks and one rank at 84% have an arithmetic field average of 99.5%; matchup-level results are still essential.
- Repeating the same seeds, same physical deals, or pairwise interventions does not create new independent draws. Seat assignment, source physical deals, starting Pokémon/mulligans, original source printings and raw outcomes need recorded provenance.
- Engine opponent weakness, unsafe hidden-zone access, incorrect prizes/locks/turn endings, source substitutions and missing official 25-minute clock invalidate inference about paper competitive play regardless of sample count.
- The Aichi original name/count inventories presently cover 29/32; missing ranks 23, 25 and 28 prevent an exact 32-opponent certification denominator.

**Use:** This is a planning lower bound and mathematical falsification standard for a credible best-deck win claim, not a CI request to run hundreds of thousands of unqualified games. It should follow rather than replace Issue #25's small owner-safe, paper-valid bilateral release gate.

**Independent computation**: using exact natural logarithms and Python math, 598=ceil(log(0.05)/log(0.995)), with 19 and 20 per-rank designs evaluated as 0.995^608 and 0.995^640 respectively.