# Independent-seed inference for the rank-1/5/11/30 zero-Energy Float Stone study

**Agent 31 | 6 November 2026 | independent statistical audit | no new games | no deck or policy change**

## Decision-relevant finding

[Agent14's preregistered native study](../aichi-2026/agent14-prospective-crossrank-zero-energy-strand-20261106.md) observed **zero actual zero-Energy rescue selections** in **32 matched control/treatment pairs** / **64 native attempts**. These came from **16 independent registered source-seed groups**, each containing **two distinct fixed contender lists** on the same source seed. The original-source panel was **ranks 1, 5, 11 and 30**, both physical candidate seats, two independent source seeds per rank/seat cell.

The correct conservative randomization unit for a statement about cross-contender *opportunity existence* is a **source-seed group**. The same seed reused against two different contenders can generate different physical openings and different playing trajectories, but it does not create an independent second random seed. Treating 32 contender pairs as 32 independent Bernoulli trials gives a falsely narrow uncertainty statement unless cross-contender independence is independently demonstrated.

Under the explicit, conditional assumptions below, **zero observed groups among 16 yields a one-sided 95% upper bound of 17.07497230%** on the *eight-cell equally weighted native-within-horizon probability that at least one of the two contenders triggers this exact conservative selector*. A 95% individual bound from only the **four source seeds per original rank** is **52.71291955%**, and the four individual rank bounds are *not* simultaneous 95% bounds.

These bounds constrain only this registered simulation, opportunity definition and source panel. They do **not** estimate candidate win-rate effect, all-turn theoretical legal opportunity, all-32-opponent prevalence, or paper-match prevalence. The actual source outcome remains 0/16 registered groups with a selector intent, 0/32 first action divergences, and zero competitively qualified games.

## Precise event and sampling model

For each of the eight fixed strata (s), defined by original rank (×) actual physical contender seat, take the two prospectively generated independent random seeds (j=1,2). Define:

- (Y_{s,j}=1) if **at least one** of the unchanged champion-reference and new-moon-lockbreaker-v1 contender arms would select the exact default-off zero-Energy Float Stone rescue at any accepted native decision before engine terminal or the 260-root censor under the registered base policy and engine.
- (Y_{s,j}=0) otherwise, as seen in the archived full native runs. All 16 observed (Y) are zero.
- (p_s=P(Y_{s,j}=1)), with stationarity within a rank/physical-seat stratum under identical pinned engine, policy, opening RNG protocol and action horizon.
- (̅p=(1/8)∑_{s=1}^{8}p_s), the equally weighted native-within-horizon panel opportunity probability.

Assume that the registered source seeds are independent across groups and that the observable output is deterministic under each seed and the frozen research configuration. Different (p_s) across the eight strata are permitted. The two contender arms **within** a seed group may be arbitrarily dependent.

Then the exact probability of the observed all-zero event is:

[
P(0	ext{ groups with rescue})=prod_{s=1}^{8}(1-p_s)^2
leqleft(1-rac{sum_{s=1}^{8}p_s}{8}ight)^{16}
=(1-ar p)^{16}.
]

The inequality follows from the arithmetic-geometric mean inequality applied to the eight values (1-p_s). Thus if the true equally weighted panel mean were (ar pgeq q), the probability of 16 independent group-level zeros would be at most ((1-q)^{16}). Taking ((1-q)^{16}=0.05) gives:

[
q_{0.95}=1-0.05^{1/16}=0.1707497230.
]

This is a **valid conservative upper confidence limit even with differing rank/seat event probabilities**, given exactly two independent seeds per stratum and the assumptions stated above. Equality in the probability bound occurs when all eight (p_s) are equal. It is an inference about *some candidate opportunity before the recorded censor*, not the chance of a qualified game win.

## Numerical sensitivity

| Correct independent source-seed groups | Native control/treatment attempts with two contenders | 95% one-sided upper limit if no selections |
|---:|---:|---:|
| 4 within a single rank | 16 | 52.71292% |
| **16 observed across eight strata** | **64** | **17.07497%** |
| 32 balanced across eight strata | 128 | 8.93682% |
| 64 balanced across eight strata | 256 | 4.57297% |
| 304 balanced across eight strata | 1216 | 0.98060% |

The last three rows are **hypothetical all-zero outcomes**, not experiments conducted. Their native-attempt counts count two contenders and two A/B phases per independent source seed group. Repeats should be balanced across strata for this exact equal-weight proof to carry over unchanged. For a common opportunity probability of 5%, the probability of observing zero events among 16 independent groups would still be (0.95^{16}=44.01266687%); at 10% it would be (0.90^{16}=18.53020189%). Therefore this negative sample does not sharply distinguish small but material opportunity rates.

A single rank's four group-level zeros give (1-0.05^{1/4}=52.71291955%) as an **individual** upper limit. Multiple rank-specific claims require multiplicity control and have even looser simultaneous bounds.

## Explicit limits, source and next decision

1. **Censoring matters.** Eleven of the 32 baseline native attempts reached the 260-action limit. A no-selection before the cap is not evidence that the selector could never become eligible later.
2. **Current policy matters.** The event includes exactly the conservative immediate-KO selector reachable through the frozen native actor path, not every potentially useful free retreat or future-turn resource route. It is possible for non-rescue mobility to have value in excluded states.
3. **Panel selection matters.** Four original ranks do not identify the opportunity frequency among 32 opponents; no statistical extension to the other 28 ranks is justified without a sampling/transport argument.
4. **The simulator matters.** The repository has known paper-rule and opponent-policy gaps and no validated match clock. Native action-count and Prize outcomes are not qualified game results.
5. **Opportunity is different from success.** An unexecuted legal line or a two-Prize native KO is not a demonstrated improvement in final game-winning probability. The original rank11 post hoc successful two-Prize root still lost under all A/B/A native arms, and cannot be used to compute a competitive effect size.

**Practical decision:** Retain the demonstrated exact-root capability and the negative selected-policy result in their separate evidence categories. There is currently no statistical basis to spend a fixed 60-card slot or replace the shared v8 policy on the strength of a universal zero-Energy Float Stone rescue hypothesis. A larger experiment should be motivated by a materially broader *resource-to-attack plus post-gust survival* strategy, with source-side recipient and meaningful opponent response, instead of simply increasing native game counts for the already narrow selector.

**Reproduction:** Calculate (1-alpha^{1/n}) with (alpha=0.05) and (n=4,16,32,64,304). The 16 independent registrations, rank/seat assignment, native raw outcomes, exact code revision, root limits and archive hashes are in [Agent14's prospectively registered report](../aichi-2026/agent14-prospective-crossrank-zero-energy-strand-20261106.md), its [immutable registration](../aichi-2026/registrations/agent14-prospective-zero-energy-strand-crossrank-20261106.json) (Git blob `212b9f0756529746e6a1b0e9008b27a914bbb951`), and [CI 42290236249](https://github.com/FlareZ123/experiment-01/actions/runs/42290236249). The earlier single-root positive is separately documented in [Agent14's native tactical report](../aichi-2026/agent14-native-zero-energy-strand-paid-ko-20261106.md). No new native or paper games were run for this statistical audit.
