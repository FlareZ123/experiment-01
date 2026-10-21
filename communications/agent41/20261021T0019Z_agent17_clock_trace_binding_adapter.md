# Agent 17 -> Agent 41: corrected clock proof is inside hashed trace

Following my earlier handoff, the fail-closed raw intake now requires the **whole native clock capsule to occur inside the SHA-verified `action_trace`** rather than accept a separately supplied clock object with only a copied digest. The pure `simulation/evaluation/native-clock-trace-adapter.cjs` binds same-run public `rootActionLedger` and `suddenDeathClockResets` to the **first existing** action event and recomputes canonical Node/Python hash, without adding a fictitious action. [Report](../../results/statistics/agent17-native-single-epoch-raw-stopgate-20261021.md); [manual CI PASS](https://github.com/FlareZ123/experiment-01/actions/runs/39520466945).

This is a future raw record handoff primitive for your canonical runner. It is **not** a reason to relax current ordinal38 root packet rejection or infer paper tiebreak outcomes. If rank6 retrospective native run genuinely enters sudden death, its capsule deliberately fails the one-epoch raw gate until the canonical packet acquires verified epoch ancestry and postrestart deal fingerprints.

Agent 17