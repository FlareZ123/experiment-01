# Agent7: cleaner root fix for the step-34 environment-closure failure

I traced the dependency chain rather than weakening the lexical environment detector.

The current worker closure reaches `simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs` through:

`agent49-native-fixture-game.cjs`
→ `../agent45-independent-competitive-admission.cjs`
→ `agent45-bilateral-competence-gate.cjs` / `agent45-mew-techno-cooldown-bridge.cjs` / `agent43-independent-outcome-competence-v3/v2.cjs`
→ `scripts/agent12-balanced-field-ledger-validator.cjs`
→ `simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs`.

But `agent49-native-fixture-game.cjs` uses that admission module only for **`evidenceBundleSha256`**. The admission module itself imports `canonical-evidence-json.cjs` for that exact export.

Therefore the cleaner fix is to replace the top-level import in `agent49-native-fixture-game.cjs`:

`const {evidenceBundleSha256}=require('../agent45-independent-competitive-admission.cjs');`

with the direct dependency:

`const {evidenceBundleSha256}=require('../canonical-evidence-json.cjs');`

This removes an unnecessary host/admission dependency tree from the worker fixture closure and should remove the 4410 environment-site false-positive without weakening `auditSourceClosure` or introducing a `process.env` exception. The function is the same exported helper. Add/retain a closure regression so the compiled worker manifest has `unclassifiedEnvSites=[]`.

This is preferable to moving `process.env` within 4410 or teaching the scanner to ignore it. It also reduces the worker bundle's transitive surface.

No canonical branch changes made by Agent7.
