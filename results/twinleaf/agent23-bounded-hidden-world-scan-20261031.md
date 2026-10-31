# Bounded detached opponent-hidden-world sensitivity at authentic owner roots

**Agent 23 | 31 October 2026 | development diagnostic, not a win-rate result**

## Question

The existing postgame owner-root hidden-hand diagnostic compared one authentic
original-Store decision against **one** physical exchange between the
opponent's concealed hand and deck. Four historical roots returned 0/4
conditional action reversals in the earlier archived study
([previous report](agent23-live-opponent-hidden-postgame.md)). That is a
negative finding for those **four selected exchanges only**. A policy may
depend on an alternate concealed card missed by the first chosen exchange.

The release gate is still the common **both-seat**, owner-information-safe
action chooser, with native effects and opponent replies. This is one
conditional information-boundary diagnostic contributing to that gate; it does
not certify the complete chooser.

## Implemented experiment

- [Bounded scanner](../../simulation/twinleaf/agent23-bounded-hidden-world-scan.cjs)
  evaluates a configurable default of **16** distinct opponent-hand/deck
  **one-card exchanges** at an actual previously captured root. The scanner
  selects differing card printings, prioritizes different hidden card-kind
  pairs, then spreads the remaining budget across physical hand and deck
  positions. It records total eligible / actually tested / complete
  one-exchange coverage.
- Each alternative is a **fresh, detached clone** of the true original
  postgame root. The real Store is never the test input to a second policy
  decision. Exact physical hidden card-instance inventory and hand/deck
  sizes are conserved; live source graph integrity is checked.
- The policy is a fresh identical bot for every candidate world and uses
  the **same seeded RNG factory**. A final original-world replay checks
  chosen-action and tactic-score equivalence, guarding against cumulative
  simulator globals and drifting RNG. Unsafe detached aliases fail before
  any hidden-card exchange.
- Outcome reporting distinguishes **action reversal**, **score-only
  sensitivity**, and **no difference in tested worlds**. It retains the
  first divergent action/score diagnostic without calling it a game result.
- [Pure regressions](../../tests/agent23-bounded-hidden-world-scan.test.cjs)
  construct a counterexample in which the old single exchange misses a
  strategically distinct second card but two exchanges expose the action
  difference. They also check incomplete budgets, physically distinct same
  printings, clone aliases, baseline drift, and hand/deck position coverage.
- The [existing four-arm historical runner](../../simulation/evaluation/agent23-bilateral-opponent-hand-postgame.cjs)
  selects this scanner only with environment variable
  **AGENT23_BOUNDED_HIDDEN_SCAN_DEV=true**. The preexisting default
  one-exchange procedure is unchanged. The [existing manual CI
  workflow](../../.github/workflows/rank11-hidden-opponent-hand.yml)
  exposes the new flag through the boolean input
  **agent23_bounded_hidden_worlds**.

## Evaluation status and provenance

First opt-in manual compiled job:
[Actions run 41157577980](https://github.com/FlareZ123/experiment-01/actions/runs/41157577980),
starting from commit **5923c9e90f660cf300b49afd868b5b6d3ac7b300** on
31 October. Its original pure regression stage passed; the four native
historical replays were still running when this note was first written.
Further hardening (alias fail-closed, score-only census, position
stratification) was committed **after that job's pinned head** and needs
separate validation.

The intended trial denominator remains **four** already selected
historical rank-6/rank-11 source-dealt roots. Those roots are a diagnostic
testbed with an unqualified bot and do not supply an independent opponent
sample or competent-game win counts. Preserve any replay errors and action
caps.

## Fundamental limits

Even testing every *single-card* exchange fails to cover two-card or
higher-order counterfactuals. Swaps are chosen using the actual concealed
card identities **after play** and are consequently not samples from a
verified historical information-set posterior. The experiment does not
authenticate whether previously revealed opponent cards would make some
alternate worlds impossible.

A repeatable postgame action sensitivity finding is therefore a
**conditional hidden-data policy warning**. A stable bounded result is
neither proof of information-set safety nor proof of a good or bad TCG
decision. Printed card legality, strategic strength, time-control handling
and complete native resolution are independent gates.

**Field benchmark remains 29/32 authenticated opponent sixties, zero
competitively qualified games, no validated 99.5% fixed-deck win rate.**
