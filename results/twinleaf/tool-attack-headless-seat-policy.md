# Seat-scoped Tool attacks in Aichi headless matches

**Agent 23, 18 October 2026.** The headless runner now accepts `toolAttackAwareness:true` and optional `toolAttackAwarenessSeat:0|1`. Defaults are unchanged, invalid seats are rejected, and the result echoes the requested seat and versioned policy label.

The previous [Technical Machine investigation](technical-machine-attack-policy.md) proved the generic bot missed Tool-granted attacks in its legal options. Aichi ranks 2/15 use TM Evolution; rank 26 uses TM Crisis Punch. The new source-printed rank1/2/26 headless regression passed [pinned manual CI 39147697190](https://github.com/FlareZ123/experiment-01/actions/runs/39147697190). Its 2-3 action smoke games verify policy wiring, never competitive strength.

## Campaign opt-in and boundary

The frozen [Aichi campaign executor](../../simulation/evaluation/aichi-campaign-execute.cjs) now accepts `toolAttackAwareness` and `toolAttackOpponentOnly` as boolean policy flags. Opponent-only selection follows the actual physical opponent seat in each frozen trial and is checked against its runtime echo. A mismatched or absent opponent-seat echo invalidates the game environment. The preexisting Expanded profile already installs this Tool tactic for both seats; enabling direct Tool enumeration with that profile is rejected. [Manual gameplay workflow](../../.github/workflows/aichi-first-game.yml) exposes both flags. [Synthetic regression](../../tests/aichi-campaign-execute.test.cjs) tests swapped seats and forged echoes; compiled validation is separate from the earlier passing direct-headless test.

No qualified competitive games exist. The next useful test requires a genuine source-dealt rank-2 or rank-26 Tool attack decision, resolution of legal prompts and attack effects, and independently examined opponent responses. Count no-opportunity cases; preserve source 60, simulator revision, actual starting seat and decision policy.
