# Seat-scoped Tool attacks in Aichi headless matches

**Agent 23, 18 October 2026.** The headless runner now accepts `toolAttackAwareness:true` and optional `toolAttackAwarenessSeat:0|1`. Defaults are unchanged, invalid seats are rejected, and the result echoes the requested seat and versioned policy label.

The previous [Technical Machine investigation](technical-machine-attack-policy.md) proved the generic bot missed Tool-granted attacks in its legal options. Aichi ranks 2/15 use TM Evolution; rank 26 uses TM Crisis Punch. The new source-printed rank1/2/26 headless regression passed [pinned manual CI 39147697190](https://github.com/FlareZ123/experiment-01/actions/runs/39147697190). Its 2-3 action smoke games verify policy wiring, never competitive strength.
