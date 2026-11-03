# Minimum all-win evidence for a 99.5% fixed-60 Aichi field mean

**Agent 11 | 3 November 2026 | mathematical design criterion, no games certified**

## Claim being tested

The project wants **one unchanged, legal paper Expanded 60-card deck** against 32 authenticated original Aichi Top 32 opponent printings, with a 99.5% game win rate. The statistic must be defined before collecting outcomes. An interpretable target is the arithmetic mean of the true game win probabilities across the **32 opponent ranks, both physical seats, and both starting orders**, all 128 cells weighted equally. Every game must be a complete independent *paper-qualified* match with one preregistered unchanged card 60, identical qualified decision policy, actual original-source 60 and match-time adjudication.

This note asks for the **smallest possible all-win sample** that can reject the null of field-mean win probability at most 99.5% at one-sided 5% significance under that fixed design. It does not propose an existing engine result qualifies.

## Exact proof, valid even with unequal matchup strengths

Let `p_i` be the unknown fixed true win probability of the registered candidate/policy in cell `i`, and play `n` independent, qualified games in each of `S` equally weighted cells. On the event all `S*n` games are wins,

`P(all wins | p_1,...,p_S) = product(p_i^n) <= ((sum p_i)/S)^(n*S)`

by arithmetic-geometric mean. This inequality remains valid when matchup probabilities differ. Thus under the composite null `(sum p_i)/S <= p0`, an all-win outcome has probability at most `p0^(n*S)`. At one-sided level `alpha`, the all-win lower confidence bound for the **equal-weight field average** is `L=alpha^(1/(n*S))`.

For target `p0=0.995`, `alpha=0.05`:

- The absolute mathematical minimum is **598** independently qualified all-win games (597 is insufficient), before adding balanced-cell constraints.
- With **32 ranks × two physical seats × two start orders = 128 cells**, uniform complete coverage requires **five independently qualified wins per cell**, **640 games and zero losses**. The lower bound is **99.53301063%**, strictly above the 99.5% threshold. Four wins per cell yield 512 games and a lower bound of only **99.41660444%**.
- If only ranks are distinct strata, 19 wins per rank gives 608 all-win games, but does not enforce either seat/order fairness. With 64 rank×seat strata, ten wins per cell gives 640 all-win games.
- A much stronger simultaneous **every-cell** guarantee of at least 99.5% via one-sided Bonferroni 95% familywise confidence would require **1,566 all-win games per each of 128 cells**, or **200,448 qualified wins**. This is a different hypothesis from the stated field-average objective.

The [source-locked zero-loss design calculator](../../scripts/agent11-fixed60-zero-loss-certification.cjs) and its [five-case executable tests](../../tests/agent11-fixed60-zero-loss-certification.test.cjs) assert the exact threshold, the balanced design, the stronger Bonferroni question, the AM-GM inequality, and the conservative handling of unequal sample sizes. A separate Python `math.log` calculation verified the boundary values to machine precision.

## If the frozen policy loses some games: a valid heterogeneous-field KL method

For any fixed, independently sampled, equal-cell design, the arithmetic mean of *unequal* true cell probabilities remains estimable with a conservative Bernoulli-KL upper-tail inequality. The derivation uses an exponential moment: for each `t≥0`, `product(1-p_i+p_i*exp(t))^n ≤ (1-pbar+pbar*exp(t))^(n*S)` by AM-GM. Optimizing over `t` bounds `P(sample win fraction ≥ q)` by `exp(−N*D(q || pbar))` whenever `q>pbar`, with `D(q||p)=q*ln(q/p)+(1−q)*ln((1−q)/(1−p))`. On observed wins `w` out of `N` qualified balanced games, invert `N*D(w/N||L)=ln(20)` on `L<w/N` to obtain a conservative one-sided 95% lower confidence bound. The formula specializes to the preceding exact all-win bound when `w=N`.

This permits a **prospectively planned loss budget**, avoiding selective post hoc game removal:

| Maximum observed losses | Minimum balanced games per rank×seat×order cell | Total qualified games at 128 equal cells | Statistical result if losses do not exceed allowance |
| --- | ---: | ---: | --- |
| 0 | 5 | **640** | One-sided 95% lower field mean at least 99.5% |
| 1 | 9 | **1,152** | Ditto, via conservative KL bound |
| 2 | 12 | **1,536** | Ditto |
| 3 | 15 | **1,920** | Ditto |

The [calculation module](../../scripts/agent11-fixed60-zero-loss-certification.cjs) exports `binaryKL`, `heterogeneousFieldLowerBound`, and `balancedGamesForLossBudget`, verified by [additional boundary tests](../../tests/agent11-fixed60-zero-loss-certification.test.cjs). These are *mathematically sufficient* sample sizes under declared assumptions, not sample-size promises or claims the current simulator can produce credible games at such volume. More than the allowed losses require a larger registered or conservatively analyzed study. The interpretation remains invalid for adaptive stopping or reusing earlier games to choose the candidate.

## Why this does not immediately establish a path to 99.5%

The 640-game condition is only a **best-case zero-loss threshold**. At a true average of exactly 99.5% with identical cell probabilities, observing 640 wins without one loss has probability just **4.04363249%**. Even if every cell really has a 99.9% win probability, the chance of that perfect sample is about **52.71236049%**. More matches and a nonzero-loss statistical method are necessary for realistic study power.

Balanced cells prevent 600 easy-matchup games from masquerading as evidence about all 32 ranks. If cell counts are unequal and all results wins, retaining only `min_i(n_i)` samples from each cell gives an immediately valid, conservative bound; extra wins in over-sampled easy opponents cannot raise it. For any actual loss, the all-win formulas cease to apply, and a prespecified valid heterogeneous-field confidence method or conservative per-cell bounds are required.

An independently shuffled card deal/seed, actual qualified strategy, correct source attack/payments, board state, opponent continuation, six Prizes, clock and terminal rules are indispensable. Replaying a fixed easy seed or picking successes retrospectively violates the independent prospective design. Sequentially monitoring the results, changing the candidate and reusing the same test set, or stopping when the all-win criterion happens to be reached would invalidate the stated 95% interpretation.

## Current research disposition

The repository currently has **29/32 authenticated exact original Aichi sixties**. Ranks **23, 25 and 28** are missing; their source cells cannot be filled with archetype proxies. The shared native development experiments have **zero competitively qualified paper games**. Therefore **0/640 qualified all-win games** are available, and no 99.5% field-strength conclusion is supported.

This result should be treated as a **preregistration and evidence standard for a future fixed-list release**, after source-list recovery and complete opponent-policy/engine-paper qualification. It does not rank existing fixed-sixty candidates, propose a new deck, or convert any existing native engine terminal into a competitive win.
