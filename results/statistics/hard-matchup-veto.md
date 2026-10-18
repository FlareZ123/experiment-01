# Hard-matchup early falsification of the 99.5% fixed-deck target

**Agent 38, 18 October 2026. Status: conditional mathematical protocol and synthetic, fail-closed input checker. No Aichi competitive game has been qualified or played by this module.** The exact source 60s for ranks 23, 25 and 28 remain missing. This protocol can reject the aggregate target with evidence from a single *verified* opponent and does not require substituting those three missing lists.

## Necessary performance floors

Define the benchmark exactly as in the existing [equal-rank/equal-actual-start 64-cell protocol](anytime-field-aggregate.md): one unchanged candidate 60 and frozen, competent policies, with each of the 32 rank opponents receiving equal weight and the candidate's actual first and second starts each receiving half of that rank's weight.

Let `p[r,s]` denote the probability of a **win** (draws and unresolved matches count as nonwins) against rank `r` in actual-start cell `s`. Then

- `mu = sum(p[r,s])/64`, and the desired `mu >= 0.995`.
- Each of the 64 cell win probabilities must be **at least 0.68**, since even if the other 63 cells win with probability 1, `(63 + p[r,s])/64 >= 0.995` requires `p[r,s] >= 0.68`.
- Each *rank-average* `(p[r,first]+p[r,second])/2` must be **at least 0.84**, since even if all the other 31 rank-averages equal 1, `(31 + pRank)/32 >= 0.995` requires `pRank >= 0.84`.

These are **necessary**, weak thresholds for a very high aggregate. They do not say that attaining 68% in a cell or 84% against one rank is sufficient for the overall objective.

## One-shot, precommitted negative experiments

A fixed candidate-attempt index `i >= 1` gets a global false-positive budget of `alpha_i = 0.05/[i(i+1)]`. This is the existing attempt-family allocation used by the [global evidence protocol](../aichi-2026/agent17-balanced-global-gate.md). Within each attempt, divide alpha equally between 32 rank-average tests and 64 rank-by-seat tests. Bonferroni plus the telescoping series protect the 5% **familywise probability of falsely vetoing a genuinely target-capable candidate** across arbitrary attempts, conditional on valid, fresh tests.

Use either of these prespecified events against a *single* verified rank:

1. **Rank test:** independently sample `n/2` games with the candidate actually first and `n/2` actually second. The single rejection event is **zero wins in all n games**. Under a target-capable candidate, the probability of the event is at most `(1-0.84)^n = 0.16^n`. For any `pFirst,pSecond` with average at least 0.84, this follows from the AM-GM bound `[(1-pFirst)(1-pSecond)]^(n/2) <= [1-(pFirst+pSecond)/2]^n`; it does not assume identical win probabilities between starts.
2. **Rank-seat test:** independently sample `n` games in a fixed, independently verified actual-start cell. Zero wins have probability at most `(1-0.68)^n = 0.32^n` if the candidate could achieve the aggregate target.

Exact integer horizons are the smallest n (even n for rank tests) making the event probability no greater than the allocated per-test alpha. Predeclare **one fixed horizon and one specific rank/seat** before seeing confirmatory results; inspecting prefixes and retroactively choosing the most unfavorable span invalidates the fixed-event p-value. Prospectively choosing a hard matchup from earlier, disjoint exploratory evidence is allowed if all confirmatory games are fresh and the attempt budget is tracked across the swarm.

| Global frozen candidate attempt | Rank test: total games, balanced | Single rank-seat test: games | Per-rank / per-cell alpha |
| ---: | ---: | ---: | ---: |
| 1 | **6** (3 actual-first, 3 actual-second) | **8** | 0.000390625 / 0.0001953125 |
| 2 | 6 | 9 | 0.000130208333 / 0.000065104167 |
| 3 | 6 | 10 | 0.000065104167 / 0.000032552083 |
| 10 | 8 | 12 | 0.000007102273 / 0.000003551136 |

For attempt 1, a balanced **0/6** against one known hard matchup has null-event probability at most `0.16^6 = 0.000016777216`. A **0/8** in one actual seat cell has probability at most `0.32^8 = 0.0001099511627776`. Either can reject *that frozen candidate's 99.5% aggregate capability* at its familywise-budgeted threshold, provided all externally required qualification conditions hold. A 1-win result does not reject under this simple all-nonwin rule.

## Executable structural gate

- [Calculator and evidence checker](../../scripts/aichi-hard-matchup-veto.cjs) calculates the effort/alpha for a candidate-attempt index and validates a prospectively frozen trial batch. It requires exact planned game IDs, unique 32-bit seeds, frozen per-rank print-aware deck SHA-256 identifiers, both policy revisions, engine and ruleset revisions, rank/seat identities, finished qualified statuses, winner-to-candidate-slot consistency and actual turn-order plus draw-log proof.
- [Adversarial synthetic regressions](../../tests/aichi-hard-matchup-veto.test.cjs) cover both statistical thresholds, nonwin/tie treatment, rejection of incomplete horizons, duplicate games, changed printings/policies, unverified actual start order and malformed outcomes.
- Existing [manual-only benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml) runs these pure Node tests. It has no push trigger, and does not run full matches.

**Important limitation:** No self-reported `qualified-completed-game` flag or matching SHA proves that a real match occurred or was correctly played. Separately review registered seed provenance, timing under Aichi's official match clock, exact original source list and print mappings, independent replay, all card interactions, strong autonomous policies and independence from exploratory data. Overlapping paired-source games are not automatically independent. The checker deliberately describes its result as a **conditional statistical veto**, never a certified result. Do not count existing rank-11 lock-opening fixtures, forced counterfactuals or weak-bot winners as confirmatory losses.

## Research allocation

This makes a source-complete difficult rank, especially the four published Absol/Garbodor placements, a possible **fast falsification gate** for any frozen candidate while general engine and policy qualification proceeds. A confirmed hard-matchup veto could force a meaningful structural redesign before hundreds of favorable games are collected. A non-veto has no positive strength implication. The full-field 64-cell test is still necessary to demonstrate the 99.5% target, and the missing three opponent lists still block that test.
