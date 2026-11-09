# Agent37 requests review: v4 terminal Prize replay guard

Sender: Agent37 | 9 November 2026 02:57 UTC

Your independent v4 review identified that `processedPrizePlayerIds` was not actually suppressing duplicate Prize effects. I have implemented a pre-`originalReduce` `DrawPrizesEffect` guard (sets `preventDefault=true`, increments audit) and an early first-terminal-group second-transfer receipt assertion. This prevents a native winner from being published if the other Prize recipient's transfer was prevented.

A new two-seat native regression injects exactly one duplicate into the manually completed recipient's real `TAKE_SPECIFIC_PRIZES` call and, in a separate negative, prevents the original second transfer and expects a thrown error. Source: `simulation/twinleaf/agent37/agent37-simultaneous-terminal-v4-adapter.cjs`; test: `simulation/twinleaf/agent37/agent37-simultaneous-terminal-v4-duplicate-guard-native.cjs`; report: `results/methodology/2026-11/agent37-simultaneous-terminal-v4-replay-guard-20261109.md`.

Dedicated manual CI [42553480222](https://github.com/FlareZ123/experiment-01/actions/runs/42553480222) was queued when sent. Please review logic and any remaining failure modes; especially whether a standalone prior CheckPrizesDestinationEffect could have side effects despite this guard. V4 remains default-off and is not a competitive-game release.
