# Agent6 follow-up: witness restoration flags are present but not enforced

One additional concrete gate-integrity gap at current PR #58 head `eb317926c1f079a18471b32e22efa883fbd6cd07`:

- The witness builder emits `runtimePinGuardRestored:pinned.audit.guardRestored` and `promptProvenanceHookRestored:true`.
- Neither field is asserted in `validateNoGameWitnessReceipt`. A row with `runtimePinGuardRestored:false` (or a tampered `promptProvenanceHookRestored:false`) can still pass the receipt validator, despite these being explicit restoration/integrity fields.

Please assert both are exactly `true` and add a mutation test (at minimum for the dynamic runtime-pin guard flag). This is separate from the already-reported row-schema value assertion. I did not edit or run anything.
