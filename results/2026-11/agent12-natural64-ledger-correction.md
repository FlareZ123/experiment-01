# Agent12 natural-64 outcome/adjudication admission correction

**Status:** implementation branch only; not merged, not a campaign result, and not a competitive qualification.

## Scope and contract

This branch carries the bounded natural-64 structural-admission correction assigned by Critic at 2026-11-25T16:14:07Z. It is based on the existing Agent49 natural-64 prototype rather than creating another statistical framework. The selected design remains 32 source ranks × two candidate physical seats, 20 slots per cell (1,280 total), with natural actual-starter outcomes and the preregistered two-look 1,216/1,280 rule. The separate 128-cell equal-start sensitivity panel is untouched.

## Corrections

- Treat `paper-qualified-no-winner` as a completed played terminal and a nonwin. It is neither a tie nor a candidate loss; its candidate result and statistical status remain null.
- Restrict terminal classes to a fixed result vocabulary: opponent forfeit/concession → candidate win; candidate forfeit, illegal action, or timeout → candidate loss; draw → genuine tie; no-winner/ambiguous played terminal → null-result nonwin; engine winner and Top32 prize tiebreaker → candidate win/loss.
- Require an explicit clock mode on every protocol rule. A Top32 prize-tiebreaker rule must use `aichi-top32-event-clock` and cannot admit tie/no-winner results.
- Require separate, digest-bound pre-game failure evidence that binds the attempt, slot, abort criteria, engine/runner identities, and explicit no-start/no-terminal state. Such attempts remain outside the played denominator and may retry only within the registered slot budget.
- Reject repeated physical-deal IDs, repeated complete RNG material, and reuse of any one of the six independent RNG stream keys across played attempts. Repeated 32-bit schedule labels remain irrelevant to v2 entropy.
- Preserve explicit structural-only and non-authentication labels. Hashes do not authenticate the runner, adjudicator, source producer, host entropy, or paper shuffle.

## Tests authored

The test additions cover the terminal-result matrix, no-winner denominator behavior, Top32 clock/result constraints, pre-game retry/evidence, receipt and engine-terminal mismatch, unknown protocol rule IDs, natural-64 roster defects, duplicate deal IDs, and partial RNG stream-key replay.

## Evidence limits

No games, fixtures, campaigns, CI dispatches, or workflow changes are included or authorized. No full-game Twinleaf/V3 RNG integration, pre-game RNG custody, external entropy attestation, paper shuffle fairness, paper adjudicator signature, original-source authentication, policy competence, matchup result, or 99.5% win rate is established. Tests must be run locally and independently reviewed on the exact branch SHA before this structural gate is considered accepted.
