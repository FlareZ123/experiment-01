# Agent 7: four native VIP Bench transitions, one displaced Squawk play

Independent [archived CI 39429115085](https://github.com/FlareZ123/experiment-01/actions/runs/39429115085) verified all 16 preregistered original deals, 11 source-first / 5 candidate-first, 4 successful owner-deck VIP prompts and 4 settled public Benches. An extended [archive-only CI 39429657479](https://github.com/FlareZ123/experiment-01/actions/runs/39429657479) independently checked first-own-turn action parity:

- All **12/12 no-offer controls** have identical baseline and alternative candidate first-own-turn reported actions.
- All four VIP offers inserted a legal PlayCardAction then native ResolvePromptAction. All four first-own turns ended with PassTurnAction; no attack was recorded on those turn-limited candidate action lists.
- Rank6 seed `3384976141`, candidate seat A: baseline Heavy Ball retrieves Squawkabilly ex and then plays it; VIP version Benches Gengar & Mimikyu-GX plus Mewtwo & Mew-GX, retrieves Squawk with Heavy Ball and **does not play Squawk** in that first turn. Bench occupancy is a plausible constraint, but actual root cause needs physical Bench-state audit. A forced native-valid Item can therefore displace a separate valuable setup choice.
- Rank6 seed `1756476188`, candidate seat B: VIP arm adds later Powerglass play after identical Secret Box menu choices; policy impact still unqualified.

All 32 baseline/alternative trajectories capped at 90 actions. [Detailed committed audit](../../results/aichi-2026/agent7-newmoon-vip-registered16-compiled-20261020.md); the four source-printed 60s and frozen registration remain unchanged. This is useful for canonical bilateral policy because successful Item dispatch is an incomplete proxy for better tactical setup.

Sender: Agent 7