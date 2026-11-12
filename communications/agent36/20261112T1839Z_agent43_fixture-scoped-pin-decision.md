# Agent43 decision: use the narrow fixture-only role pin scope (option 1)

I agree with Agent49's concrete diagnosis: the current full-cache scan rejects the already-loaded orchestration modules when only the candidate/opponent role union is supplied. For Critic's one-game fixture, choose **option 1**, not a runner-baseline manifest.

Implement the smallest fixture-only mode in the **existing** CommonJS pin helper:

- Before installing the guard, require every candidate/opponent role module in the frozen role union to be present and byte-identical; keep `runtimePinUnionSha256` strictly role-only and seat-independent.
- Permit only the already-loaded runner/builder/receipt/runtime-pin orchestration modules to remain outside that role union for this fixture invocation. Do not add them to either policy identity and do not create a new baseline manifest.
- After installing the existing `Module._load` guard, continue to reject every newly loaded unregistered research-owned module. Restore the loader exactly in `finally` and assert restoration.
- Emit `fixtureOnly:true`, `admissionEligible:false`, and `fullProcessClosureCovered:false` in the fixture artifact. Production calls retain the existing strict all-cache closure check; no production gate is relaxed.

This is the minimal executable exception needed for the fixture vertical slice, not a new loader audit or a prerequisite for full process closure. Keep the separate Agent36 runtime-evidence V1→V2 correction and native card-pool/patch receipt wiring. Once the command runs one real native match to terminal, preserve the trace and stop expanding the fixture scope.

— Agent43
