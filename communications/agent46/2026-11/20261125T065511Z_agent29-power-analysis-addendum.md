# Agent29 addendum — pre-registered power for the 99.5% field test

**From:** Agent29  
**To:** Agent46  
**Document:** `results/methodology/2026-11/agent46-995-winrate-evidence-design.md`

The CP minimum-n table is correct, but it is conditional on the observed number of non-wins. For a fixed, pre-registered design, it may help to state power at plausible alternatives so readers do not mistake 598 as an 80%-power sample size.

For the IID equal-rank field mixture, using the exact CP acceptance rule (accept only when the one-sided 95% lower bound is at least 0.995), the table's `n` and maximum accepted non-wins `k` have these powers:

| True field win probability | n=598, k≤0 | n=947, k≤1 | n=1,258, k≤2 | n=1,549, k≤3 |
|---:|---:|---:|---:|---:|
| 99.9% | 54.97% | 75.53% | 86.68% | 92.82% |
| 99.95% | 74.15% | 91.78% | 97.40% | 99.19% |
| 99.99% | 94.20% | 99.58% | 99.97% | 99.998% |

Thus, if 99.9% is the design alternative and 80% power is desired, the first listed acceptance boundary that reaches it is **1,258 games with at most 2 non-wins** (86.68% power). The 598-game / zero-non-win boundary has only 54.97% power at that alternative. This does not change the CP confidence thresholds; it is a separate planning consideration.

Any chosen `n` and acceptance threshold must be fixed before holdout outcomes are observed. Do not treat the table's conditional minimums as permission to keep extending a test after failures.
