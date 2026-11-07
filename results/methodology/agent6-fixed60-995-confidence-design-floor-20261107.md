# Exact minimum evidence for a 99.5% fixed-60 field win-rate claim under a flawless holdout

**Agent 6 | 7 November 2026 | mathematical evidence standard.** This is a best-case sample-size lower floor for a frozen, paper-qualified deck/opponent-policy benchmark. It makes no claim that the 99.5% target is achievable, or that existing native games satisfy the assumptions. Reproducer: `simulation/evaluation/agent6-fixed60-zero-loss-evidence-floor.cjs`, with focused Node test `tests/agent6-fixed60-zero-loss-evidence-floor.test.cjs`.

## Assumptions and the exact test

Pre-register one **unchanged** candidate 60-card deck, all 32 authenticated original opponent 60s, a legitimate paper/clock decision policy, fixed evaluation rules, and opponent/deal/seat sampling. Each game must be a genuinely independent win/loss realization with fixed matchup-specific win probabilities. An engine error, action cap, invalid game or unfinished game cannot be counted as a win. Even a preregistered exclusion rule can bias the estimate if these failures correlate with the matchup's outcome. Preserve the full attempted denominator, report every censor, and use an independent, defensible censoring or worst-case analysis before claiming confidence. Do not select the candidate after looking at the holdout's results. No real study currently meets these qualifications.

Let `p_i` be the win probability against original opponent `i`, with **the same fixed 60** and the specified play/draw seat distribution. The desired **equal-weight field mean** is

\[
\bar p=\frac1{32}\sum_{i=1}^{32}p_i\,.
\]

If exactly `m` genuinely independent, qualifying games are played against **each** opponent and *all* `32m` games are won, the likelihood of this event is

\[
P(\text{all wins})=\prod_{i=1}^{32}p_i^{m}
\le\left(\frac1{32}\sum_{i=1}^{32}p_i\right)^{32m}
=\bar p^{32m}.
\]

The inequality is the arithmetic-geometric mean inequality. Therefore, under the composite null `H0: equal-weight field mean <= 0.995`, a flawless panel has one-sided p-value no more than `0.995^(32m)`. Inverting the all-wins event yields the conservative exact one-sided 95% lower bound

\[
L_{\rm field}=(0.05)^{1/(32m)}.
\]

This all-wins-only test is valid even when opponent win probabilities differ, under independent games and equal matchup sample counts. It does **not** license treating correlated reruns of one physical deal, linked RNG streams, repeated action roots, bot-aborted games, or unqualified Store terminals as independent trials.

## Structural feasibility: the field has only a 16-percentage-point total loss budget

For a uniform 32-deck benchmark, the 99.5% mean target is equivalent to

\[
\sum_{i=1}^{32}(1-p_i)\le 32(1-0.995)=0.16.
\]

This is a strict **total loss-probability budget across all 32 opponent matchups**. Even granting 100% wins against the other 31, **one matchup below 84%** makes the target impossible. Two 92% matchups, four 96% matchups or sixteen 99% matchups each exhaust the entire allowed deficit if every remaining matchup is perfect. An exactly symmetric 50/50 mirror alone caps the uniform aggregate at **98.4375%** (the current fixed-60 decision board already identifies this special case for the unchanged rank1 reference). These are deterministic necessary conditions, independent of sample size, simulator, card identity and hypothesis-testing method. Under a fair balanced-start mirror against a competitor using **the same exact 60 and equally competent symmetric policy**, the mirror win probability is at most 50% (ties cannot raise the win fraction). Consequently, no unchanged copy of any field entrant's exact 60 can satisfy the uniform 99.5% target under those symmetry assumptions, even with perfect wins elsewhere. This generalizes the explicitly documented rank1-reference example; it is a conditional symmetry argument, not an empirical matchup result.

This makes hard-counter coverage and worst-matchup improvement primary deck-selection objectives even before a qualified evaluation cohort exists. It does not estimate any actual matchup strength. Different opponent weights would change the budget allocation and need their own predeclared estimand.

## Numerical thresholds

| Evidentiary question (95% one-sided) | Minimum flawless qualified evidence | What it establishes under the assumptions |
| --- | ---: | --- |
| One fixed Bernoulli win probability of at least 99.5% | **598 independent wins, zero losses** | Exact single-probability lower bound `0.99500294` |
| Equal-weight mean against 32 opponents, balanced per opponent | **19 per opponent, 608 in total** | Exact field-mean lower bound `0.99508493`, without even physical-seat quotas |
| Equal-weight mean with **equal first/second seat counts** | **10 per seat per opponent, 640 in total** | Same composite-null approach across 64 opponent-seat contexts; lower bound `0.99533011` |
| Each of the 32 matchup means at least 99.5%, **simultaneously** with 95% confidence | **1,290 per opponent, 41,280 in total**, zero losses | Bonferroni lower bound `0.99500363` on every opponent, accounting for 32 simultaneous claims |
| Each of 64 individual opponent-seat win probabilities at least 99.5% simultaneously | **1,428 per opponent-seat context, 91,392 in total**, zero losses | Bonferroni across the 64 separate seat-specific parameters; stronger target than aggregate/each-opponent means |

For the 32-matchup **simultaneous** version, the all-wins one-sided lower bound for one matchup is `(alpha/32)^(1/m)` with `alpha=0.05`. Choosing `m=1290` is the first integer at which this is at least 0.995. The Bonferroni familywise guarantee does not depend on independence between the 32 intervals, although each individual interval needs appropriately sampled independent games.

At 18 per opponent (`576` total), the all-wins null probability `0.995^576 = 0.05573070` still exceeds 0.05; at 19 each (`608` total) it is `0.04747152`. A first/second-seat-balanced test uses 20 per opponent rather than 19, so the seat-weighted target is unambiguous.

## Conservatively validating nonzero losses with a heterogeneous-matchup Chernoff test

All-wins evidence is an optimistic benchmark. A realistic frozen candidate may lose, and a pooled ordinary binomial calculation can be misleading when opponent and seat win probabilities differ. The companion CJS code now exposes a **fixed-sample Chernoff upper-tail test** valid for *arbitrary independent opponent/seat Bernoulli probabilities with a predeclared equally represented mean*. For observed `N` independent games and `f` losses, `r = (N-f)/N`. Under the composite null `H0: mean true win probability <= p0 = .995`, for every `t>0`:

`E[exp(t*totalWins)] = product_j (1-p_j+p_j*exp(t)) <= (1-p0+p0*exp(t))^N`.

The first inequality uses concavity of `log(1-p+p*exp(t))` and the stipulated population mean; the second uses the null upper bound. Optimizing Markov's inequality gives the conservative one-sided upper-tail bound

`P(totalWins >= N*r | H0) <= exp(-N*D(r||p0))`,

where `D(r||p0) = r*ln(r/p0) + (1-r)*ln((1-r)/(1-p0))`, provided `r>p0`. For `r<=p0` use the trivial bound 1. **With zero losses this coincides with the exact all-wins bound.** For nonzero losses it is generally conservative, preserving validity without an unjustified identical-matchup assumption.

| Maximum observed losses in predeclared fixed panel | Smallest total `N` meeting 95% one-sided bound | Full opponent-and-seat-balanced `N` (multiple of 64) |
| ---: | ---: | ---: |
| 0 | 598 | 640 |
| 1 | 1,147 | 1,152 |
| 2 | 1,535 | 1,536 |
| 3 | 1,884 | 1,920 |
| 5 | 2,522 | 2,560 |
| 10 | 3,966 | 3,968 |

For example, a frozen *1,152-game* panel with **18 independent games per opponent-seat context**, **one loss** and 1,151 wins would have a conservative upper-bound p-value `0.04885335` against an equal-weight 99.5% field-mean null. The identity and count of each loss must remain available for matchup-specific reporting. If 1,152 games were **chosen after** examining the first 640 outcomes, a naive fixed-N p-value would be invalid; the sample size, policy, deck, opponent set, seat balance, stopping protocol and exclusions must be committed before the holdout begins.

This test estimates the uniform **field aggregate** only. It does not demonstrate any individual matchup exceeds 99.5%; that requires separate simultaneous confidence bounds. It also cannot compensate for an unauthenticated opponent 60, weak opponent, simulator errors, unmodeled game clocks, correlated reruns, or rules mismatches. The test's correctness is mathematical and conditional; actual paper-qualified sample count remains zero.

## Implications for the shared Aichi benchmark

1. **Zero qualified games** remain the current state. The numbers above are sample-size requirements in a hypothetical best-case no-loss holdout, not retrospective estimates. Any losses require more sophisticated confidence calculations and generally larger sample sizes.
2. The field's three missing authentic original 60s (ranks 23, 25, 28) prevent literal all-32 execution. No statistical adjustment can convert a substitute same-archetype list into the absent original.
3. Repeating 35 attacks in one stalled game, or running several policies against one original physical seed, is nowhere near 35 independent game wins. Starting seat, opponent competence, printed-paper effects, Prize variance and **stage-specific Japanese paper match timing/adjudication** need their own preregistered validity gates. The official [CL Aichi May 2026 Open League organizer rules](https://www.pokemon-card.com/info/005445.html) distinguish 25-minute Swiss with both players losing unresolved games from 25-minute Top32 elimination through semifinals and a **35-minute final** with explicit Prize-lead/extension rules. Agent27 independently documented these [event-specific rules](agent27-aichi-open-official-time-adjudication-20261107.md). A 99.5% benchmark must predeclare a consistent stage and count only paper-valid wins for that stage, preserving double losses and tiebreak extensions as observed outcomes.
4. The **most important immediate bottleneck is a single paper-faithful bilateral completed game** with meaningful action, counterplay and outcome. Calculating a large future sample target does not justify running tens of thousands of broken or unqualified native matches.
5. Any post hoc deck selection using the same test data invalidates the naive one-deck confidence statement. Freeze a separate, independent evaluation holdout after optimization and component debugging, then assess the selected single 60 without changing it.

## Reproduction and scope

The CJS library computes `minAllWins`, `balancedFieldFloor`, `allMatchupsFloor` and an exact one-sided all-wins lower bound. The focused pure test checks the 598, 608, 640 and 41,280 floors, fixed-sample Chernoff loss budgets, and invalid parameters. Calculations were independently cross-checked with Python's `math.log` and direct power expressions before codification. The exact committed CJS module and test sources were fetched and parsed/executed in a separate V8 runtime with a minimal compatible `node:assert/strict` and `node:test` shim; **all 8 test callbacks passed**. This verifies the committed arithmetic paths without a native Node test-runner receipt. No native Twinleaf run, card-play assertion, opponent source authentication or claim of achieved performance is contained in this result.

**Interpretation caution:** The prompt's 99.5% field target does not itself prescribe whether *equal-weight field mean*, a chosen metagame weight model, *every opponent mean*, or *each opponent-seat mean* is intended. These are distinct scientific questions, and the table gives mathematically different evidence requirements for them. The final research release should state the exact estimand in advance.
