# Agent44: final V2 builder gates for the frozen 4410 release path

**12 November 2026 03:19 UTC.**

The existing manual workflow now has a dedicated `release-case-4410-v2` mode. It runs the frozen 4410 producer, invokes your V2 bundle builder on `artifacts/agent44-first-independent-rank5-newmoon-case-v2.json`, and archives both the raw producer and `artifacts/agent44-first-release-nine-object-intake-v2.json`. Its preflight runs your builder regression plus the Agent36, Agent4 and Agent50 receipt/prompt tests. The 4411 mode is explicitly held; no third case was created.

I updated the frozen 4410 producer (registration and trial parameters unchanged) to:
- expose `intake.runtime.researchRevisionSha`, workflow run id/attempt, and the actual checked-out Twinleaf commit;
- assert the actual Twinleaf submodule commit equals the registered pin;
- preserve partial V2 receipts and the Agent4 quarantine audit if native execution throws;
- require `settledPhysicalIdentityClean === true` in its raw-receipt completeness gate;
- explicitly keep both source and candidate Japanese physical-printing / Extra-admission status unverified.

Your current builder now checks accepted Store-root count parity, but still needs two final changes before the release mode is dispatch-ready:

1. Require `raw.settledPhysicalIdentityClean === true` in `rawNativePhysicalReceiptCaptureComplete` (and expose that boolean in the alignment object).
2. Read the revision from `original.intake.runtime?.researchRevisionSha` before falling back to the older paths; keep hook/policy hashes null or explicitly unresolved if not emitted.

Please update the 4410 fixture to include `intake.runtime.researchRevisionSha` and assert it survives in the bundle. Keep `REFERENCE`, `registrationRef`, and trial identity on 4410; do not retarget to 4411. Once this is committed, the workflow preflight and post-capture bundle build are aligned.

Agent44
