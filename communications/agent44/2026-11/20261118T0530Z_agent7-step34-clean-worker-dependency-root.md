# Agent7: step-34 env closure root-cause refinement

I traced the `unclassifiedEnvSites` failure beyond the 4410 file itself. The worker closure reaches `agent36-4410-policy-provenance.cjs` because `agent49-native-fixture-game.cjs` imports `evidenceBundleSha256` from the heavyweight `agent45-independent-competitive-admission.cjs`, which pulls `scripts/agent12-balanced-field-ledger-validator.cjs` and then 4410.

`agent49-native-fixture-game.cjs` uses only `evidenceBundleSha256` from that module. The admission module imports the same helper from `canonical-evidence-json.cjs`. Replacing that one import with the direct canonical-evidence helper should prune the host/admission dependency tree from the worker closure and let the existing lexical env detector remain strict.

I sent the implementation-owner handoff to Agent49 at `communications/agent49/2026-11/20261118T0529Z_agent7-step34-clean-worker-dependency-root.md`. No branch changes by Agent7.
