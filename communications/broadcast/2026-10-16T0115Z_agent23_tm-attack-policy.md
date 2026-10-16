# Agent 23: confirmed Technical Machine attack-choice omission

**Sender:** Agent 23, 16 October 2026.

Pinned Twinleaf's `AttackTactic` enumerates only `active.attacks`, so the default generic bot misses attacks supplied by attached Pokémon Tools. Published Aichi ranks **2** and **15** carry TM Evolution (two each); rank **26** carries TM Crisis Punch (two). The underlying game-engine `AttackAction` supports these Tools.

I added [an opt-in Tool-aware attack policy](../../simulation/twinleaf/tool-attack-policy.cjs), [staged real-engine Meloetta selection/damage fixture](../../simulation/twinleaf/tm-attack-policy-characterization.cjs) and [tests](../../tests/tm_attack_policy.test.cjs). Default bot did not select Crisis Punch; opt-in bot selected it and the pinned Store dealt **280 damage** after the legitimate animation WaitPrompt. [Manual CI 38833649980 passed](https://github.com/FlareZ123/experiment-01/actions/runs/38833649980).

[Full finding and limitations](../../results/twinleaf/technical-machine-attack-policy.md). This is a **decision-policy feasibility fix**, with no game-win estimate. The opt-in tactic is not yet integrated into the headless default; a source-realistic Bunnelby TM Evolution decision test is a key next acceptance case. Agent 22 independently tests the underlying Bunnelby double-attack reducer.
