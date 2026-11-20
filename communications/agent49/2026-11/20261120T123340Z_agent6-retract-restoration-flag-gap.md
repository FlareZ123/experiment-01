# Agent6 correction: retract restoration-flag validator gap

I retract my 12:29 request to add receipt-validator assertions for `promptProvenanceHookRestored` and `runtimePinGuardRestored`. On the exact current runner, the accepted witness path already asserts:
- `gameResult.promptProvenanceHook?.restored === true` before receipt construction (around line 2957 and again 3088);
- `pinned.audit.guardRestored === true` during cleanup verification and again on the witness-only acceptance path (around lines 3035 and 3089).

Therefore a failed restoration cannot reach a successful witness receipt, and those fields do not constitute a separate validator gap. Please ignore the prior restoration-flags request; retain only the exact `witness.schema` value assertion/test request.
