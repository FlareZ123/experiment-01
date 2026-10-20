# Agent 48: bind bilateral raw Store roots to the recorded source digest

**20 October 2026. Evidence class: read-only prospective intake integrity and pure Node 22 regression.** This change does not run a Pokémon game, alter a card effect or change any 60-card deck or decision policy.

## Failure mode

The source-ranked historical executables already calculate `rootActionLedgerSha256 = SHA256(JSON.stringify(rootActionLedger))`. The independent bilateral-v2 intake previously passed `row.rootActionLedger` directly to `attestBilateralRootClaims` without checking that its ordered JSON bytes matched the accompanying producer digest. The attestor checks the ledger's root ordinals, actors and turns, and explicitly delegates its external artifact integrity check. Thus a changed root transcript could remain self-consistent under the attestor and be promoted as raw-root-authenticated even with a stale producer hash.

This distinction matters for the intended **source-first pressure -> legal candidate response -> source return** gate. The tester must be able to distinguish a faithfully preserved Store-root transcript from a rewritten transcript that happens to have plausible actor/turn labels.

## Narrow change and regression

- `simulation/evaluation/bilateral-v2-evidence-gate.cjs` requires an actual array, the existing `actual-store-root-action-ledger-v1` protocol label, and a 64-character lowercase hexadecimal `rootActionLedgerSha256` whenever the archive supplies `rootActionLedger`. It compares the digest to SHA-256 of the exact ordered `JSON.stringify` representation used in both existing source producers. Missing or stale digests fail closed before root attestation. Legacy rows without a raw transcript keep their existing `actual-store-root-claims-unverified` veto.
- `tests/bilateral-v2-evidence-gate.test.cjs` now commits the synthetic root transcript digest in all existing native-root fixtures. It independently tests missing hash, changed-but-unrehashed action, recomputed digest, and malformed digest. Existing source/actor/turn spoofing regressions still exercise the downstream root attestor with intentionally recomputed digest so a hash check cannot disguise a missing semantic check.
- Git commits: [implementation](https://github.com/FlareZ123/experiment-01/commit/409bd7ff068f90df3cd068e3aea812de460e9b2c); [regression](https://github.com/FlareZ123/experiment-01/commit/ed8f3b118da723fc03310575c6c7b6738c4dcc1c).
- **Passing existing manual workflow:** [Aichi benchmark statistical tests, run 39370657660](https://github.com/FlareZ123/experiment-01/actions/runs/39370657660), head `f4b770c4ee9d553a3155597a975d8794e2f21567`; `test-benchmark` job and its **Reject fabricated bilateral v2 actual-first-turn evidence** step both passed. Node 22 pure-test path; the pinned Twinleaf submodule was **not built by this job**. The new digest check does not require it. No per-push workflow was introduced.

## What this does and does not certify

The check prevents accidental or uncoordinated substitution of a preserved transcript **relative to its recorded row digest**. A party controlling both transcript and row can recompute both, so genuine independent provenance still requires immutable registration, repository revision, archive-blob hash and external attestation. The check does not establish native Pokémon effects, source policy competence, information-set safety, paper legality, time-budget fidelity or competitive wins.

The canonical Agent41 historical runner already emits `rootActionLedgerSha256` but currently retains only bounded public root summaries in some response formats. Any future prospective bilateral-v2 intake that supplies the **complete** raw transcript must carry that producer digest unchanged and retain its artifact provenance. Absence of a raw ledger is a qualification veto, never a convenient workaround.

## Qualification impact

The integrity rule is now executable and CI-checked. It **does not** advance the number of qualified competitive games. The research baseline remains **29 of 32 exact opposing published 60s**, ranks 23/25/28 missing, and **zero competitively qualified games**. Next high-value work remains source-first genuine Initialization/Tool-Garbodor effects plus legal candidate response in the canonical runner and actor-observable common policy.
