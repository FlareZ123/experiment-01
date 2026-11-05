# Agent 8: exact statistical evidence budget for the 99.5% Aichi Top32 target

**5 November 2026 | mathematical design bounds; no games simulated or competitively qualified.**

The primary deliverable is one *fixed* playable paper Expanded 60-card list attaining a 99.5% game-win rate over all 32 original Aichi Open League 2026 opponents. Even if that list is discovered, proving near-perfection requires a carefully specified test, not a promising native Store action or historical winning streak.

## Two materially different target interpretations

**(A) Uniformly averaged 32-opponent field performance**: the single fixed contender faces each of the **32 original decks** equally often. Let `p_i` be the probability that a fully paper-qualified, independent game is won against opponent `i` under the fixed opponent, shuffle, turn-order and clock/adjudication policies. Let `pbar = (p_1+...+p_32)/32` be the equal-field win probability. This interpretation permits some bad matchups compensated by very high win rates in others.

**(B) At least 99.5% against *every one* of the 32 opponents**: `p_i >= .995` simultaneously for all `i`. This is a stronger research requirement than (A), and demands much larger direct per-matchup evidence.

No empirical input currently meets either. All 32 exact sources and a stable, paper-qualified bilateral game policy are prerequisites, and three original 60s (ranks 23, 25, 28) are still unverified.

## Exact one-sided all-win thresholds at 95% confidence

For a prespecified IID fixed Bernoulli stream with true win probability `p <= .995`, observing all `n` games won has probability at most `(.995)^n`. The smallest sample with this chance at most `0.05` is

`n = ceil(log(0.05)/log(0.995)) = 598`.

The boundaries are `(.995)^597 = 0.05016250374880243 > 0.05` and `(.995)^598 = 0.04991169123005841 <= 0.05`. Inverting the one-sided exact binomial test for 598 successes in 598 trials gives lower confidence bound `0.05^(1/598) ≈ 0.9950029413057535`. This is a *conditional evidence budget*, not a demonstration that any available deck can attain it.

**A fixed equally stratified 32-rank design** avoids silently mixing favorable source ranks. Run `k` fully qualified, independent games per source, with a prespecified seat/first-player protocol. The probability all `32k` games are wins equals `prod_i p_i^k`. By arithmetic-geometric mean, for any fixed collection `p_i` with uniform-field mean `pbar <= .995`:

`prod_i p_i^k <= pbar^(32k) <= .995^(32k)`.

Thus the smallest balanced whole number is **19 games per rank, 608 games total**, all wins, with conservative worst-case null probability bound `(.995)^608 = 0.04747151515758818`. This tests the *aggregate uniform-field mean* under independent fixed games. It does **not** establish each individual matchup succeeds 99.5% of the time. An unbalanced voluntary schedule invalidates this 608-game AM-GM argument without an adjusted design-specific proof.

**For a simultaneous all-32 per-matchup guarantee**, allocate one-sided familywise 5% via Bonferroni (`alpha_i=.05/32=.0015625`). The exact all-win requirement per matchup is **1,290 successes from 1,290 independent games** because `(.995)^1289 = 0.001562971580220333 > .05/32`, while `(.995)^1290 = 0.0015551567223192314 <= .05/32`. Across the 32 original ranks that requires **41,280 fully qualified wins and zero losses**. Bonferroni requires no independence between different opponent-specific confidence statements, but each matchup's sampling model still needs proper validity.

| Fixed design / inferential claim | Minimum total **zero-loss** fully qualified games | Qualification |
| --- | ---: | --- |
| Prespecified IID random 32-rank mixture, uniform selection | **598** | One-sided bound on mixture probability, no individual rank guarantee |
| Fixed **exact 19-per-opponent** schedule | **608** | One-sided bound on uniformly weighted 32-rank average from AM-GM |
| Simultaneous 99.5% lower bound for **every** original opponent | **41,280** | 1,290 per rank, Bonferroni familywise 95% gate |

The last row should not be mistaken for a necessary sample size to *play* a strong deck. These are extreme, zero-loss confidence requirements at a chosen evidence threshold, not sample-size requirements to compare more realistic candidates or perform exploratory optimization. If any loss occurs, different exact-binomial inversion and larger samples are needed; the present functions intentionally address only the all-win case.

## Reproducibility

The independent code [`agent8-zero-loss-field-certification.cjs`](../../simulation/evaluation/agent8-zero-loss-field-certification.cjs) implements these formulas and labels the aggregate versus simultaneous interpretations. Five [pure numeric/adversarial regression cases](../../tests/agent8-zero-loss-field-certification.test.cjs) assert the 598/608/1290/41280 boundaries and that no design implies eligibility for post-hoc chosen deck selection. The calculations above were independently verified in local Python `math.log`, `math.ceil`, and direct powers on 5 November 2026; **the committed JavaScript tests have not yet run in the repository's CI**.

## Nonstatistical vetoes and policy-selection risks

- All original **32 exact printed source sixty lists** are required for the named fixed-field claim. Rank23/25/28 remain missing. Testing 29 and relabeling the denominator as 32 would be fabrication.
- A released game must finish under a faithful paper rules engine, realistic owner-information-safe candidate and opponent decision policies, printed payments, Prizes, official paper clock/ties, and a defensible shuffle/first-player model. The native Store's action acceptance or a false-positive victory is not a qualifying match.
- The deck, model, game policy and analysis plan must be **selected and frozen before** the held-out evaluation. Picking the best deck *after observing the same 608 games* invalidates the nominal 5% test. Adaptive seed selection, repeated peeking and optional stopping likewise require an explicitly corrected testing design.
- Opponent policies may be poor or unable to exploit the source decks. A high simulated win probability against those policies cannot be upgraded to strong human tournament performance.
- The calculation says only **what an all-win streak would signify under its assumptions**. It predicts neither attainable results nor the economic feasibility of 608 versus 41,280 genuine full games.

**Current project verdict:** zero competitively qualified games; 29/32 original complete rosters; no selected best fixed 60. 99.5% remains an unachieved objective.

**22:20 UTC verification addendum:** The exact committed mathematical CJS source and five exact committed regression-test source bytes were fetched back from GitHub, evaluated in a restricted V8 harness with synchronous Node-style test/assert stubs, and **5/5 assertions passed**. This tests the committed source's algorithm and regressions against the real values; it is not Node's native test runner and not a CI or game-engine execution.
