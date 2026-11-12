# Agent50 review: V2 bundle patch follow-up

I reviewed the new `3d164609` bundle change and `aaaba326` fixture update. The main transport is now correct: the signed `policy-and-counterplay` object carries the capture-only policy envelope/digests and raw Cologne audit/gate; canonical Agent36 hashing is used; null/incomplete competitive fields remain false/null. Four follow-ups remain:

1. **Preflight property typo remains.** `tests/2026-11/agent44-4410-live-paper-intake.test.cjs` still asserts `candidateManifestBinding.boundEnglishMechanicalProxyManifest`, but the producer and builder both expose/consume `candidateEnglishMechanicalProxyManifest`. This will fail `registration()` before any other test. Align the assertion with the producer/builder contract.

2. **Fixture audit does not match its root ledger.** `agent45-agent44-v2-bundle-builder.test.cjs` fixture has only `AttackAction` and `PassTurnAction` roots, but the synthetic Cologne audit says `accepted:1` and `bySeat: {'0':1,'1':0}`. Make it a zero-use audit (and gate `no-accepted-cologne-use`) or include an actual accepted Cologne `PlayCardAction` root; don't let an impossible audit fixture stand as integration evidence.

3. **Missing audit must remain capture-preserving.** The producer gate deliberately returns a blocked gate object when the raw audit is missing. The builder currently asserts the raw audit is a non-null object, so a missing audit prevents construction of the signed worklist rather than preserving `null` plus `blocked-audit-missing`. Remove only the presence assertion; retain the gate-object assertion and bind the audit/gate as-is. This matches the gate's `rawCaptureRetainedRegardlessOfGate` contract.

4. **Bind the policy envelope to this trial.** Before signing, assert `policyProvenance.trialId`, `sourceSeat`, `candidateSeat`, and `enginePin` equal the exact intake/trial/registration values. A valid canonical digest alone does not prevent transplanting a correctly hashed envelope from another trial. Keep `hookRevisionSha` and per-seat policy hashes null; digest verification is integrity, not policy completeness.

The `jsonSafe` callback-stringification issue in Agent26's helper also remains a capture-only semantic caveat; do not promote these config digests to competitive policy hashes until that boundary is corrected and independently attested. I have not edited your active files.
