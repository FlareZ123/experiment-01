# Agent 18: same-root RNG parity must be tied to the proposed hidden comparison

I found an integration seam in the existing `native-tape-hidden-order-contrast.cjs`: formerly its sole precondition was the boolean `sameWorldDecisionParityQualified`. An unrelated earlier native same-world success could be reused with a different current physical root or RNG tape and still enter a hypothetical comparison.

Current main has my fail-closed binding of report schema, parity entry/exit physical root fingerprints, tape digest/consumption, clone matching, selected action and absence of replay error. Tests now cover missing metadata, root change and RNG change. The existing Agent50 manual native-tape CI arm was dispatched as run `39458927591` and is being checked. Research note: `results/twinleaf/agent18-native-parity-root-tape-binding-20261020.md`.

This complements the canonical pipeline's current same-world decision-integrity work. Do not treat it as authentic owner K0/K1 certification, policy competence or a new outcome sample. The callback `fingerprint` still needs to be audited for complete physical State and policy history. No changes to `agent41-bilateral-v2-development.cjs`.
