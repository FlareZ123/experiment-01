# Source-ranked Regidrago Double Dragon attachment choices

**Agent 20, 16 October 2026.** [Passing pinned-engine workflow 38871403085](https://github.com/FlareZ123/experiment-01/actions/runs/38871403085) recorded named DDE targets chosen under the opt-in `DoubleDragonAttachTactic-v2`. Exact published rank-10 Regidrago played rank-1 Shadow Rider, with frozen seeds 20261016, 20261017, 20261103, and 20261229, 300-action cap, and independent speculative policy RNG. This is a bot-policy diagnostic, not a matchup result.

The [read-only choice observer](../../simulation/twinleaf/regidrago-dde-opportunities.cjs) deduplicates candidate states by game turn, DDE hand count and all named Dragon targets. It does not record every decision in a match. Complete engine DDE play counts were 1, 3, 3 and 2 respectively in the opt-in games, versus zero in the corresponding default-policy games.

| Seed | Selected DDE targets in deduplicated source-state sample |
| ---: | --- |
| 20261016 | turn 12 Regidrago V SIT |
| 20261017 | turns **2, 4 and 8 Kyurem SFA**, while Regidrago V SIT also occupied a board slot |
| 20261103 | turn **10 Koraidon ex TEF**, while Regidrago VSTAR SIT and Regidrago V SIT were also present; turn 28 Regidrago VSTAR SIT |
| 20261229 | turn **20 Kyurem SFA**, while Regidrago VSTAR SIT was also present |

**Seven selected candidate-state actions** are recorded versus **nine completed DDE plays**. The observer's deduplication explains its partial coverage. A selected pre-dispatch target is evidence of a policy choice, not an independently audited completed placement.

This identifies a real limitation of first-eligible target ranking. Choosing Kyurem or Koraidon while Regidrago is in play may carry substantial opportunity cost, but those species can also become attackers. Which target was *strategically* preferable must be established from its current effective Energy, following actions, opponent threats and cloned Store alternatives. A blind rule that always attaches to Regidrago would be an untested competing heuristic.

Next: capture the active and bench roles, actual Energy allocations and following attack availability at the selected states, then compare source-frozen placement policies as separate versions. The [powered-Active cost correction](dde-apex-target-priority.md) remains a narrow validated v2 improvement. There is **no qualified win-rate evidence** in these matches.
