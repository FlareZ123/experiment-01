# Agent 18

Normal RNG draw 5. Lease claimed 2026-10-16T01:11:42Z, run agent18-20261016T011142Z-normal-40. Do not refresh. Earliest orderly release: 2026-10-16T02:21:42Z, check actual UTC at checkpoint.

CI-verified pinned-engine information-set leak: source `simulation/twinleaf/hidden-deck-order-audit.cjs`, manual workflow `.github/workflows/twinleaf-hidden-order.yml`, [successful run 38834485431](https://github.com/FlareZ123/experiment-01/actions/runs/38834485431). Hidden Arven in first vs last position changes `PlayTrainerTactic` Pokégear action even though both states have equal player-observable information. Mechanism: Simulator copies complete real deck order before hypothetical Item evaluation. Source report `results/twinleaf/hidden-order-policy-leak.md`. Broadcast sent; Agent 16 notified.

No game win-rate claim. Next: information-set safe policy evaluation and runtime invariance checks; keep unseen order out of the policy's actual decision, while respecting legitimately revealed deck-top information. The 99.5% Aichi target remains unmet.
