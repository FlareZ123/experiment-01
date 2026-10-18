# Agent 50: genuine rank10 v4 tactical-score exposure census

**18 October 2026.** Diagnostic method and authenticated source opportunity discovery. No competitive games or win rates qualified.

## Why this census

A hidden-order comparison at a root decision that evaluates no tactical candidate scores cannot test speculative-score leakage. The earlier compiled source turn2/root15 comparison selected Double Dragon Energy without entering an intercepted `evaluateAction` call (0 vs 0 scores), while the archived turn28/root215 evaluated nine scores in both worlds. A source-authenticated opportunity census locates real choices where the bot does evaluate competing tactical actions.

## Exact frozen source

[Compiled manual hidden-information CI 39123026419](https://github.com/FlareZ123/experiment-01/actions/runs/39123026419) passed, head `d228baea035ec7508d30822834bed1d8e09350d2`. `pilot:10:0:champion-reference:B`, seed `4246551499`, current-v4 Double Dragon recovery. Engine seat A: exact rank10 Regidrago source 60; physical seat B: rank1 Shadow Rider source 60. Existing `runMatch` options are preserved. The wrapper accepts a policy call only when its State object is exactly the genuine root Store's State and its prompts are resolved. It captures each root bot's actual tactic `evaluateAction` returns, observes its own selected action, restores the instance methods and does not substitute any play. The instrumented completed source match matched its uninstrumented control: winner engine seat A, turn 16, root actions 169.

Source: [rank10-source-score-opportunity-scout.cjs](../../simulation/twinleaf/rank10-source-score-opportunity-scout.cjs). Synthetic source-root/spurious-State and exception-restoration tests: [rank10-source-score-opportunity-scout.test.cjs](../../tests/rank10-source-score-opportunity-scout.test.cjs), all passed in the same manual workflow.

## Direct observation

There were **64 genuine root policy callbacks**, and **40** of those made one or more intercepted tactical evaluations. Ranked salient examples:

| Root step | Turn, acting seat | Live chosen action | Tactical evaluations | Exposed categories |
| ---: | --- | --- | ---: | --- |
| 57 | Turn 5, B/202 | PassTurnAction | 12 | PlaySupporterTactic 2; PlayTrainerTactic 2; RetreatTactic 5; others 3 |
| 157 | Turn 15, B/202 | PassTurnAction | 16 | PlaySupporterTactic 1; PlayTrainerTactic 4; RetreatTactic 5; others 6 |
| 121 | Turn 12, A/101 | AttackAction: Retribution Strike | 13 | PlaySupporterTactic 1; PlayTrainerTactic 4; others 8 |
| 12 | Turn 1, B/202 | PassTurnAction | 8 | PlaySupporterTactic 1; PlayTrainerTactic 1; others 6 |

These are **evaluated candidate counts**, not distinct game moves, actions selected, or competent human decisions. The first source Supporter-scoring call was root12. Its being evaluated does not prove the Supporter can legally be played by the first player under paper rules.

Prospectively selected follow-up contrast roots before running the alternatives:

- **Root57**, turn5 champion seat B: an early state, two Supporter proposals actually scored and 12 overall candidate evaluations.
- **Root157**, turn15 champion seat B: the most scored candidates in this authenticated source game (16 evaluations).

The selection uses prior *score exposure counts* from the authentic unmodified source, not results of hidden-order reversals. A separate manual workflow compares cloned original/reversed unseen physical own-deck order at these exact actions, checking original-world/live action parity and preserving the untouched root State. Source-run score-level sensitivity is pending and must be reported independently. There is no implication that multiple sampled hidden worlds, internal-policy continuity, known deck membership, or a game win rate is established.

This observational census narrows research to actual scoring opportunities and demonstrates that the turn2 null-score comparison was vacuous. It remains a policy instrumentation diagnostic under Twinleaf's partial paper-rules implementation.
