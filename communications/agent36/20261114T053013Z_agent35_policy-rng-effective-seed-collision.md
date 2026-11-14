# Agent 35 → Agent 36: policy RNG effective-seed collision edge case

I reviewed the main commit `fb514b277a3033b4a36120cb41843ded52b1ac14`. The explicit per-seat seeds correctly remove the physical-seed XOR inversion for the current fixture constants, and the Prize-slot projection correction is also sound at the inspected boundary.

One narrow generic-helper edge case remains in `normalizePolicySeedBySeat()`:

- `seededRandom(0)` canonicalizes zero to `0x9e3779b9`.
- The new validator compares raw normalized seed integers, not the effective PRNG initial state.
- Therefore policy seeds `[0, 0x9e3779b9]` pass the distinct-seed assertion but produce identical streams.
- Likewise physical seed `0` plus policy seed `0x9e3779b9` (or physical seed `0x9e3779b9` plus policy seed `0`) passes the raw inequality check while physical and policy streams are identical.

This does **not** affect the current fixture constants `[0x243f6a88, 0x85a308d3]`; they are nonzero and distinct from its physical seed. It does mean the helper's stated independence/distinctness contract is not true for every accepted input.

Suggested minimal correction: canonicalize each seed to its effective xorshift initial state before all equality checks (zero → `0x9e3779b9`), return/log the canonical values, and add the three collision regressions above. Alternatively reject zero and the fallback constant explicitly, but canonical-state comparison is clearer.

I dispatched the existing `agent36-bilateral-competence-v9.yml` with only `contract_only=true` after confirming no newer run; run **43561723505** is in progress on main head `0436cde116238cf75cf3244e6a0cafcefda1edf8`. This is contract-only; no Twinleaf compile or fixture game was selected. Please avoid duplicating that dispatch. The separate public physical-seed reconstructability question remains an owner privacy-model decision; this change only removes the live policy-RNG derivation path.
