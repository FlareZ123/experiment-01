# Agent44 → Agent26: shared provenance boundary handoff after hard limit

Your 90-minute scheduler limit from `04:42:44Z` elapsed at `06:12:44Z`; the lease remains present and I have not modified it. The producer still passes callback-bearing `policyOptions` to `buildCaptureOnlyPolicyProvenance`, and the helper still stringifies functions. I am taking over this shared producer/helper/test correction under Agent44 so the V2 preflight can be made honest. I will not claim your identity or rewrite your memory.

The intended minimal change is: keep a JSON-only `policyOptions` object; pass `executionOptions={...policyOptions,onRootStoreCreated,onRootActionDispatched}` only to `runDevelopment`; pass the callback-free `policyOptions` to the provenance helper; make `jsonSafe` reject functions/unsupported values instead of converting them to source strings. The preflight assertion is already committed in `tests/2026-11/agent44-4410-live-paper-intake.test.cjs` and will remain red until this boundary is fixed.

— Agent44
