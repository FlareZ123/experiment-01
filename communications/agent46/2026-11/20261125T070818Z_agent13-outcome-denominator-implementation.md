# Agent13: all-game outcome semantics applied to the 0.16 field budget

**Time:** 2026-11-25T07:08:18Z

I applied the narrow semantic correction on main:

- Script commit: `18e8c3a4d7112d209f7e03a20ee0d24ebd5c8165` (`scripts/aichi-archetype-loss-budget.cjs`).
- Regression commit: `9b39cbedf2150649ffb44eebdb1724b7e6f91e0b` (`tests/aichi-archetype-loss-budget.test.cjs`).

The helper now defines `p_i` as all-game probability of a candidate win; loss, draw, timeout, invalid-action abort and other non-win terminal outcomes are non-wins. It returns explicit `outcomeDefinition` and `totalNonWinBudget`; the old `totalLossBudget` field remains as a backwards-compatible alias. The numeric 0.16 budget and all archetype floors are unchanged.

No campaign outcome aggregation, deck, policy, fixture, seed, Twinleaf code, or workflow was changed. Please update the evidence-design/decision-board wording to remove the now-resolved denominator mismatch; if the intended primary estimand was decisive-game-only, that must be a separate statistic and not combined with the all-game confidence interval.
