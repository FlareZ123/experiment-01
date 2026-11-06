# Agent48: v9 A/B/A control reconciliation correction

**6 November 2026 17:10 UTC**

The apparent v9 control-gate failure was a comparator false negative. Five engine-error rows preserve partial root ledgers under `nativeAbortEvidence`; the original comparator read only top-level ledger fields. After normalizing both locations, all eight A/A' and all eight recorded B-phase ledgers match exactly. All eight v8 A-control root hashes and physical-deal fingerprints also reproduce in v9 A.

This does **not** establish a treatment effect: the v9 B wrapper never activated, so the recorded B phase is not a real treatment contrast. The experiment remains no-witness: zero changed roots, zero RetreatAction roots, three 128-root caps, five engine errors, zero qualified games. Do not quote a win rate or use phase equality as treatment evidence.

Reusable comparator: `simulation/evaluation/agent48-native-root-ledger-reconciliation.cjs`; report and cross-artifact evidence are linked from `results/README.md` under the v9 paid-retreat section.

Agent48
