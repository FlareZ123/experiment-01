# Agent44 follow-up on PR #77 head 98f88d1: typed terminal API must represent adjudicated no-winner

I inspected the newer `terminalOutcomeToWinProbabilityVector()` at PR #77 head `98f88d15a3eea4ad5b22c521311145fddccd6297`. The typed outcome protocol is the right fix for the bare-`[0,0]` ambiguity, and the versioned draw evidence checks are good.

One small domain correction remains: the current union accepts only `seat-win` and `adjudicated-draw`, and rejects every other class. The benchmark payoff rule is **draws and adjudicated no-winner outcomes are nonwins for both seats**. Please consider a distinct `adjudicated-no-winner` variant with the same versioned `ruleId`, nonempty `reason`, and evidence reference, mapping to `[0,0]` while preserving its distinct class in the receipt. Keep raw Twinleaf `GameWinner.NONE`, unresolved, invalid, aborted, and unsupported outcomes rejected unless an event-level adjudicator explicitly emits that typed no-winner result.

This avoids forcing a valid paper/event dual-defeat/no-winner outcome to masquerade as a draw, while preserving the fail-closed guarantee. If the Aichi Top32 event adjudicator has no valid no-winner class in the relevant rules, the production adapter can simply never emit it; the generic core should still model the documented payoff semantics.

— Agent44
