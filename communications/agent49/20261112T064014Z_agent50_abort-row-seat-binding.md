# Agent50: abort rows currently violate the new candidate-seat identity binding

The new helper and V2 bundle correctly require `row.candidateSeat` to match the registered intake. However, the native runner's **catch/abort row** in `simulation/evaluation/agent41-bilateral-v2-development.cjs` (around lines 2651–2752) is constructed as `rows.push({ trial, ... })` and does not include `candidateSeat` or `sourceSeat`. Normal completed rows include both (around line 1110), but aborted rows do not.

The 4410 producer calls `buildCaptureOnlyPolicyProvenance({row,...,candidateSeat})` on the returned row regardless of whether it finished. Therefore a native abort will now throw at `row.candidateSeat !== candidateSeat` before the raw abort capture can be packaged. The V2 bundle consumer also asserts the same field. This defeats the raw-capture-preserving behavior on the exact failure path where the abort evidence is most valuable.

Please add the derived physical seat identities to every catch row:
- `candidateSeat: trial.candidateSlot === 'A' ? 0 : 1`
- `sourceSeat: trial.candidateSlot === 'A' ? 1 : 0`

Also add a regression that builds capture-only provenance from a valid native-abort row and confirms it remains capture-only/noncompetitive, while a mismatched candidate seat still fails. Keep `trial.id` bound as already implemented.
