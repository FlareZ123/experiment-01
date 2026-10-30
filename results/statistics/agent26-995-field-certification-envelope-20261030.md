# Agent 26: exact 99.5% certification envelope and unrecovered-field sensitivity

**30 October 2026 | Evidence class: exact statistical derivation plus public-field partial identification.** This is a conditional planning calculation. It is **not** a gameplay simulation, deck recommendation, empirical win estimate, or claim of qualified competitive wins.

## Reproducible question

The research target is one unchanged 60-card paper Expanded list achieving 99.5% game wins against the full Aichi Open League 2026 Top 32. With **29/32** authentic opposing sixties recovered and **0 competitively qualified native games**, what would clean *all-win* evidence need to look like under two distinguishable interpretations?

1. **Uniform-field aggregate win probability**: opponents are drawn independently and uniformly from the complete 32-place benchmark. This is a single Bernoulli parameter only if the field mixture, playing policies, protocol and match clock are frozen.
2. **99.5% against each opposing rank simultaneously**: all 32 individual opponent win probabilities must meet the target. This is much stronger than an aggregate claim.

For **n independent, identically distributed, uncensored and fully qualified wins with zero losses**, the exact one-sided Clopper-Pearson lower 95% confidence bound is

\[
L(n,\alpha)=\alpha^{1/n},\qquad \alpha=0.05.
\]

To guarantee simultaneous coverage of 32 matchup-specific lower bounds at familywise error at most 5%, applying the conservative Bonferroni correction gives

\[
L_{32}(n)=\left(\frac{0.05}{32}\right)^{1/n}.
\]

The minimum per-hypothesis sample is the **smallest positive integer n** with \(L(n,\alpha)\ge 0.995\). The helper calculates the threshold with natural logarithms and checks both sides of the integer boundary. No normal approximation is used.

| Hypothetical evidence interpretation | Qualified, independent all-win games required | Exact lower bound |
| --- | ---: | ---: |
| One fixed, uniformly sampled **aggregate** parameter | **598 total** | 0.9950029413057535 |
| **Each** of 32 matchups simultaneously, conservative Bonferroni familywise 95% | **1,290 per rank**, **41,280 total** | 0.9950036335121679 for every rank |

The predecessor counts 597 and 1,289 respectively fall strictly below the 0.995 threshold. These are **minimum clean zero-loss sample sizes for these specific interpretations**, not promises that a deck will win each sample, nor substitutes for paper fidelity, competence and clock verification. In particular, the source-dealt paired candidate arms in the current research share seeds and cannot simply be treated as 32 independent competitive matches.

Even if *all* 32 currently published development attempts had been qualified wins against a suitable uniform 32-rank sample (they were neither), a single-binomial 95% lower bound would be **0.9106318010137352**, far below 0.995. The actual preregistered 32-arm scout covered only ranks 6 and 11, retained 20 native terminals and 12 caps, and had zero qualified matches; thus **none** of these hypothetical bounds can be applied to the observed raw engine winners.

## Missing originals: sharp logical envelope for an evenly weighted field

Suppose each of the 32 ranks has equal benchmark weight, \(k\) fully measured per-opponent win probabilities share average \(p_K\), and the remaining \(32-k\) are completely unknown in [0,1]. Ignoring sampling uncertainty solely to isolate missing-coverage uncertainty, the aggregate is bounded by:

\[
\frac{k p_K}{32}\ \le\ p_{\rm field}\ \le\
\frac{k p_K+32-k}{32}.
\]

At the current **29/32** exact source-60 coverage, even the *optimistic hypothetical* \(p_K=1\) permits an aggregate of anything from **29/32 = 90.625%** to **100%**, depending on the three unseen opponents. To reach 99.5% while all 29 known matchups were genuinely perfect, the three missing ranks would need mean probability at least

\[
\frac{32(0.995)-29}{3} = 0.9466666666666667.
\]

This is a **logical identification bound**, not a Clopper-Pearson confidence interval, and does not claim that any known matchup is actually won. Ranks **23, 25 and 28** must remain uncovered in the certified original-60 denominator. The rank-28 replica photo and rank-25 public strategy discussion cannot be silently substituted as confirmed original print-exact lists.

## Reproduction and interpretation

- Pure calculator: [scripts/agent26-field-certification-envelope.cjs](../../scripts/agent26-field-certification-envelope.cjs).
- Regression tests: [tests/agent26-field-certification-envelope.test.cjs](../../tests/agent26-field-certification-envelope.test.cjs). They cover exact thresholds, predecessor failures, 32-opponent logical envelope and invalid arguments.
- Values independently calculated with Python \`math\` and \`scipy.stats.beta\` (the beta distribution corroborated the boundary behavior), and the JavaScript log-based calculations were exercised in the available runtime. No engine compilation or GitHub Actions run was performed for these new tests as of this report.
- This report uses the original 29/32 source coverage already recorded by the [fixed-field index](../aichi-2026/README.md) and the [32-arm native policy scout](../aichi-2026/agent41-prospective-canonical-scout-native-20261029.md). It adds no new opponent list or simulation outcome.

**Implication for the next release:** invest computational effort first in the already requested two-player common-policy, owner-information and exact source-pressure qualification. A small prospective matrix is useful for falsifying and triaging candidates but cannot, by itself, establish 99.5%. After the policy is validated, use opponent-complete precommitted sampling with independent units and explicit unresolved-game treatment. The 99.5% target remains unproven.


## Relationship to existing statistical evidence

**Independent implementation and cross-check, not a newly discovered threshold.** The prior [field-evidence standard](field-evidence.md) already derived the **598** (single-parameter), **1,290** (32-rank), and **1,428** (64 rank-by-start cells) all-win thresholds, and the [field evidence protocol](../aichi-2026/evidence-protocol.md) already recorded the **29/32** missing-opponent ceiling. The new value here is a small, separately testable **JavaScript** implementation of the exact threshold and sharp missing-mass envelope; it corroborates the existing Python implementation. The 32-rank row is a deliberately weaker aggregation than the existing 64 rank/start strata. Existing alternative [complete-round and anytime-valid methods](README.md) have different dependence and stopping assumptions, so they must not be compared as interchangeable certificates.

**CI verification:** the new test is imported by the already existing manual benchmark suite, with [Aichi benchmark statistical tests run 40993317349](https://github.com/FlareZ123/experiment-01/actions/runs/40993317349) **SUCCESS** at commit \`6700af6fe85e57dc9f30cd64e5893d787b2138cc\` (30 October 2026, 02:44 UTC). This validates the pure calculations only. No simulator game or card legality test is claimed.

**Label correction:** the existing methods refer to the 1,290-per-rank number as a sufficient *all-win, rank-specific* certificate. In a fixed equal-weight field, an average 99.5% claim need not require each individual rank to exceed 99.5%. Also, 598 assumes one homogeneous aggregate Bernoulli experiment; stratified 32/64-cell or complete-round protocols demand their own valid tests.
