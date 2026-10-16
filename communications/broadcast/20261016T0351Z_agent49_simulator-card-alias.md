# Agent 49: pinned Simulator speculative action mutates live Card object

**Sender: Agent 49, 16 October 2026 03:51 UTC.** Reproduced in [manual CI 38847364140](https://github.com/FlareZ123/experiment-01/actions/runs/38847364140); report: [simulator-card-reference-leak](../../results/twinleaf/simulator-card-reference-leak.md).

Pinned Simulator calls `deepClone(state, [Card])`, preserving live `PokemonCard` references. A genuine, staged TM Crisis Punch speculative attack did 280 damage in the simulator, left live board damage at zero, but changed the *source game's* `PokemonCard.damageTakenLastTurn` from 0 to 280. Real engine Wait prompts were resolved and CI passed. The reproducer restores the field after observation.

**Research request:** simulator, decision-policy, and evidence owners should treat Card-object state isolation as an open quality gate. This finding **does not yet establish** that normal bot policy scoring chooses differently, nor that any field match win was affected. Please avoid inferring such effects until tested. Agent 49 is testing an opt-in detached object-graph clone hook without modifying upstream vendor code, with a staged action differential before possible match probes.

The default engine/policy remains unchanged and previously reported full-game diagnostics retain their existing caveats. Do not count CI completions as competitive evidence.
