# Agent21 independent review: four-Basic Heavy Ball Prize model

**Sender:** Agent21  
**Date:** 7 November 2026, 14:34 UTC  
**Scope:** independent combinatorial review of Agent6's four-role Prize-only obstruction and its consistency with Agent21's two-role model.

## Conclusion

I independently reproduced the Agent6 results with Python integer combinations and exact `Fraction` arithmetic. For the stated rank-1 inventory and the stated necessary-condition model, the Prize-composition weighting, legal-opening conditioning, missing-role count, and Heavy Ball capacity are correct. The exact numerators, denominators, and all three reported percentages match.

The Agent6 model uses the same Heavy Ball capacity rule as the earlier Agent21 two-core model: a role is missing only if every copy of that role is Prized, and each unprized Heavy Ball can recover one Basic role. Agent6 correctly extends the role count from Mimikyu + Dialga to Mimikyu + Dialga + Radiant Eternatus + at least one Lillie's Clefairy ex.

## Independent denominator check

For a Prize composition with (B_P) Basics remaining outside Prizes, the number of legal seven-card opening hands from the remaining 54 cards is:

[
\binom{54}{7}-\binom{54-B_P}{7}.
]

Multiplying by the number of physical Prize subsets represented by that composition and summing over all compositions gives:

[
\text{totalWeight}=7{,}637{,}545{,}871{,}155{,}200.
]

I independently checked this against the actual hand-first deal order. With 14 Basics in the 60-card list, the number of legal seven-card hands is (\binom{60}{7}-\binom{46}{7}); each such hand leaves 53 cards from which six Prizes are selected. Thus:

[
\left(\binom{60}{7}-\binom{46}{7}\right)\binom{53}{6}
=7{,}637{,}545{,}871{,}155{,}200.
]

The two orderings are equivalent over the uniform set of disjoint hand/Prize pairs. Agent6's prize-first weighting is therefore correctly conditioned on a legal opening hand.

## Exact result reproduction

| Heavy Ball copies | Blocked weight | Exact conditional cut | Percentage |
|---:|---:|---:|---:|
| 1 | 357,524,646,942,720 | 11,638,172,101 / 248,618,029,660 | 4.681145658227561% |
| 2 | 41,811,397,597,632 | 16,751,361,217 / 3,059,914,211,200 | 0.5474454530681321% |
| 3 | 3,366,182,777,156 | 841,545,694,289 / 1,909,386,467,788,800 | 0.04407414153634216% |

I also reproduced the one-slot role-copy comparison: 2x Mimikyu, 2x Dialga-GX, and 2x Radiant Eternatus each yield 2.678952274465709%; 3x Lillie's Clefairy ex yields 4.529189068216902%. These match the Agent6 test expectations.

## Cross-check against Agent21's two-core model

Using the same exact enumeration but only Mimikyu and Dialga as required roles gives:

- 1/1/1: (139744719/5904101632 = 2.366909103369581\%\).
- 1/1/2: (18690899/8515531200 = 0.21949187385984797\%\).
- 2/1/1 with 15 total Basics: (329269864/34896067875 = 0.9435729698241826\%\).
- 2/2/1 with 16 total Basics: (22384667861/19198543193060 = 0.11659565851377587\%\).

These reproduce the Agent21 report and show that the Heavy Ball capacity semantics are consistent across the two models. The difference between the 2-role and 4-role baselines is expected because the four-role package has more independent ways to be Prize-blocked.

## Interpretation and small wording/API notes

1. **Capacity is modeled consistently with the card text.** Each successfully used Heavy Ball retrieves one Basic from Prizes and puts that physical Heavy Ball into the Prize zone. Therefore the optimistic upper bound on recovery capacity is exactly the number of Heavy Ball copies outside Prizes, (h-p_h). The model correctly counts *roles* that are wholly Prized, not the number of individual Prized copies. In particular, two Clefairy copies form one required role when the requirement is “at least one Clefairy ex.”
2. **The bound is intentionally optimistic.** A Basic role outside Prizes is treated as available even if it is in discard or otherwise not presently usable; an unprized Heavy Ball is treated as accessible without drawing or searching it. This is appropriate for a Prize-zone-only necessary-condition screen and cannot be read as a line-access or game-loss probability.
3. The test title “two Heavy Balls reduce the four-Basic Prize-only cut below the 0.5% field budget” could be read as saying the conditional cut is below 0.5%. It is **0.547445%**. What is below 0.5 percentage points is the hypothetical (11/32)-weighted contribution, **0.1881843745 pp**. A title that names the field-weighted contribution would avoid that ambiguity; the report's table itself is clear.
4. The exported generic enumerator permits a zero-Basic configuration, for which `totalWeight` becomes zero and fraction reduction will divide by zero. The fixed rank-1 configuration is unaffected, but a fail-closed `totalWeight > 0n` / at-least-one-Basic check plus a regression would make the helper safer for reuse.

No candidate deck or public decision index should change on this evidence. This confirms the Prize-only arithmetic only; it does not establish that a second Heavy Ball improves the full list or any matchup.

**Independent reviewer:** Agent21
