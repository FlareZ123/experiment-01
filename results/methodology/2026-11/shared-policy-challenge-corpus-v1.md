# Shared-policy challenge corpus v1

**Agent35 · 19 November 2026 · source-index artifact, not a policy or game result**

## Purpose

Convert the existing rank-specific policy suites into one compact, source-pinned challenge index that a single reusable, seat-symmetric policy/search implementation can consume. The index preserves the existing development, held-out, negative-control and blocked distinctions; it does not copy actor-view payloads or rewrite any source suite.

## Artifacts

- `shared-policy-challenge-corpus-v1.json` — 318 case references across 12 exact source-suite blobs.
- `simulation/evaluation/2026-11/shared-policy-challenge-corpus.cjs` — deterministic generator, Git-blob pin checks, case normalizer and exact source-case resolver.
- `tests/2026-11/shared-policy-challenge-corpus.test.cjs` — five focused tests for split normalization, actor-view non-copying, stable references, corpus regeneration and resolver rejection.

The generator also pins the Aichi policy-panel manifest. Each indexed case points to the original suite path, Git blob SHA-1, array name and zero-based array index. Stable case IDs are checked when present; 19 source records lack a stable ID and are addressed by their pinned array position.

## Current cohort

| Aichi source rank | Cases | Development | Held-out | Negative controls | Blocked |
|---:|---:|---:|---:|---:|---:|
| 2 | 19 | 15 | 4 | 0 | 0 |
| 3 | 68 | 49 | 8 | 11 | 0 |
| 4 | 38 | 26 | 9 | 3 | 0 |
| 5 | 30 | 30 | 0 | 0 | 0 |
| 6 | 35 | 32 | 3 | 0 | 0 |
| 7 | 24 | 12 | 4 | 8 | 0 |
| 8 | 28 | 18 | 10 | 0 | 0 |
| 10 | 8 | 6 | 0 | 0 | 2 |
| 11 | 17 | 13 | 4 | 0 | 0 |
| 12 | 12 | 8 | 4 | 0 | 0 |
| 19 | 8 | 8 | 0 | 0 | 0 |
| 31 | 31 | 15 | 8 | 8 | 0 |
| **Total** | **318** | **227** | **59** | **30** | **2** |

Evidence classes are preserved as authored: 210 `synthetic`, 39 `synthetic-actor-view`, 1 `native-staged`, 41 `unspecified`, 23 `none`, and 4 `synthetic-held-out-review`. These labels are not silently upgraded or collapsed.

## Data-quality findings

The index is deliberately honest about how incomplete the source cases remain:

- 199/318 records have an actor-view object or reference, but only **33/318** carry an explicit actor-view digest. The other 285 records must not be assumed to have a verified actor-only digest.
- 233/318 have a decision envelope; 85 do not.
- 201/318 have a cost ledger; 117 do not.
- 193/318 have prompt-coverage data; 125 do not.
- 200/318 have execution-evidence data; 118 do not.
- 299/318 have a stable case ID; 19 rely on their pinned array index.

**Structural completeness under the Agent2 suite-content minimum:** only **21/318** records contain all of: stable case ID, explicit actor-view digest, case-level source binding, decision envelope, cost ledger, prompt coverage, execution evidence, and a recognized evidence class. All 21 are development cases: 15 from rank 2 and 6 from rank 10. **No held-out, negative-control or blocked case meets this complete-field minimum.** This is a structural screen only; it does not establish that an actor-view digest is privacy-correct, a decision envelope is strategically valid, or a synthetic case is a competent opponent.

- Only one case is labelled `native-staged`; **no native games, completed matchups, policy competence attestation or competitive win-rate evidence** are established by this corpus.

Presence flags indicate structural presence only. They do not establish that an envelope is strategically sound, a cost ledger is complete, a prompt was actually executed, or an actor view excludes hidden information. The case resolver returns the original source record; the consuming harness must explicitly project only the actor-visible observation, legal frontier and permitted public history before invoking a policy.

## Scope and limits

Indexed ranks are 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 19 and 31. This is not a complete Top 32 panel. The rank-1 first-trace policy is not represented as a challenge suite here, and no candidate-side challenge suite is included. Ranks 23, 25 and 28 remain unavailable as exact original source lists.

The benchmark remains the owner-selected custom cross-format challenge: one English-language paper Expanded candidate against the unchanged original Aichi Japanese Extra field. The reference candidate in these suites is Hood Shield Shadow Rider v1 (fingerprint `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`), still a developmental challenger rather than a selected final 60. Twinleaf is pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Global status is unchanged: 29/32 source lists transcribed; 0/32 original physical opponents paper-admitted; zero competitively paper-qualified games; no selected final fixed 60; no demonstrated 99.5% win rate.

## Intended use after the registered first trace

1. Keep the current source-suite blobs frozen; update the generator's expected Git blob only when an intentional new suite version is reviewed.
2. Build one shared policy/search implementation that pilots either physical seat. Source rank and deck identity belong in the frozen source manifest, not in rank-specific runtime policy code.
3. Use the 227 development cases for controlled improvement only after verifying actor-view projection and case completeness. Keep the 59 held-out cases sealed from tuning.
4. Retain the 30 negative controls and 2 blocked cases as fail-closed regressions; do not convert blocked or unspecified evidence into passes.
5. Reconcile missing actor-view digests, decision envelopes, costs, prompt contracts and execution receipts against their original source suites before admitting a case to a competence review.
6. Compare both seats under the same policy architecture and frozen engine/deck/policy hashes. Keep self-play/training outcomes separate from held-out matchup results.

This artifact is a compact index and source resolver, not a second acceptance gate, policy implementation, CI workflow, or alternative game lane. The focused test file is authored but **has not been executed** in this invocation; no test or Actions pass is claimed.

— Agent35