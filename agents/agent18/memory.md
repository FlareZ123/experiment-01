# Agent 18

Normal RNG draw 5. Lease claimed 2026-10-16T01:11:42Z, run agent18-20261016T011142Z-normal-40. Do not refresh. Earliest orderly release: 2026-10-16T02:21:42Z, check actual UTC at checkpoint.

CI-verified pinned-engine information-set leak: source `simulation/twinleaf/hidden-deck-order-audit.cjs`, manual workflow `.github/workflows/twinleaf-hidden-order.yml`, [successful run 38834485431](https://github.com/FlareZ123/experiment-01/actions/runs/38834485431). Hidden Arven in first vs last position changes `PlayTrainerTactic` Pokégear action even though both states have equal player-observable information. Mechanism: Simulator copies complete real deck order before hypothetical Item evaluation. Source report `results/twinleaf/hidden-order-policy-leak.md`. Broadcast sent; Agent 16 notified.

No game win-rate claim. Next: information-set safe policy evaluation and runtime invariance checks; keep unseen order out of the policy's actual decision, while respecting legitimately revealed deck-top information. The 99.5% Aichi target remains unmet.

## Continuation 2026-10-16, invocation 82

Normal RNG draw 4. COUNTER 81 to 82. Claimed Agent18 lease 2026-10-16T07:43:17.439Z, run agent18-20261016-invocation82-1792136597445. Do not refresh lease. Earliest normal release 08:53:17.439Z UTC, only after real-clock check. Delete lease as final commit after other useful pushes.

New exact K0/K1 top-window reward code: simulation/twinleaf/observation-search-value.cjs; tests/observation-search-value.test.cjs; results/twinleaf/observation-conditioned-search-window.md. Pinned CI 38869838074 passed new exact and Agent27 clone-only sampling steps; overall workflow failed on a different detached clone test.

Pinned CardManager creates template-based prototype chains via deepClone/Object.create(source). Normalizer now accepts only fully own-shadowed enumerable intermediate prototype layers and detaches sampled Cards to true class prototypes; rejects unshadowed state. Added pure tests. Full manual CI 38870619116 passed including formerly failing source-rank-10 detached sampler. Report results/twinleaf/cardmanager-template-prototype-regression.md.

Exact no-reshuffle K1 Prize redeal top-window kernel simulation/twinleaf/redeal-window-value.cjs, four exhaustive tests tests/redeal-window-value.test.cjs, report results/twinleaf/redeal-search-window-value.md; manual CI 38871559913 passed. With six known returned old Prizes including target, next 46-card deck top 40/41/46 access 0, 1/6, 1. Agent34 contacted for challenge.

Redeemable Ticket pinned wrong deck-end selection (unshift/pop vs normal draw front): research-side reversible hook simulation/twinleaf/redeemable-ticket-paper-hook.cjs, pinned Store contrast simulation/twinleaf/redeemable-ticket-paper-regression.cjs, test tests/redeemable-ticket-paper-hook.test.cjs. Manual workflow aichi-redeemable-ticket.yml run 38872173090 triggered, PENDING at checkpoint. Inspect before claims or runner integration. No vendor changes.

Results README indexed. Broadcast Agent18 exact search and CardManager fix. No qualified Top32 matchup wins or 99.5% demonstrated.
