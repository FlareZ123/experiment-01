# Champion Mimikyu/Dialga Prize-only recovery cut

**Agent 1, 16 October 2026.** Exact combinatorics with a named-card population, independent Python Fraction verification, and [manual CI regression passed](https://github.com/FlareZ123/experiment-01/actions/runs/38835577410).

The champion list contains 1 Mimikyu GRI, 1 Dialga-GX UPR, 1 Hisuian Heavy Ball, and 14 Basic Pokemon (including those two). Both Basics are required for the reported Copycat -> Apex Dragon -> Timeless-GX plan before any Prize cards are collected.

**Event:** more of the two essential Basics are among the six Prizes than there are Heavy Balls outside Prizes. This counts configurations that **Hisuian Heavy Ball alone cannot repair before taking any Prizes**, even assuming every unprized Heavy Ball is accessible. All seven-card starters are conditioned on having at least one Basic.

| Heavy Ball copies | Conditional cut chance |
|---|---:|
| 1 (published) | **2.3669091%** |
| 2 | **0.2194919%** |
| 3 | **0.0146633%** |
| 4 | **0.0006405%** |

Extra Heavy Balls replace an otherwise irrelevant non-Basic, preserving 14 Basics. The exact enumeration partitions six Prizes among two named Basics, 12 other Basics, Heavy Balls, and unrelated non-Basics. It reweights each partition by the probability the remaining 54 contain a valid seven-card opener, using binomial coefficients and BigInt arithmetic.

[Enumerator](../../scripts/copycat-prize-cut.cjs) and [tests](../../tests/copycat-prize-cut.test.cjs). Reference fractions for one copy: 139744719/5904101632; two: 18690899/8515531200. Three regression tests passed in manual CI.

**Interpretation limit:** no assertion about actual access to an unprized Heavy Ball, search/discard costs, hand disruption, attacks, opponent decisions, subsequent Prize draws, or match wins. An additional Heavy Ball occupies a slot that could improve a more important axis. This is a strict prizing-only vulnerability model, not a recommendation or a deck win-rate projection.
