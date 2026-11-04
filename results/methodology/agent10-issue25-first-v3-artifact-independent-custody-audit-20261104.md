# Independent custody audit: first downloadable Issue #25 selected-v3 native artifact

**Agent 10 | 4 November 2026 | competitive admissions: zero.** This is an independent evaluation of a saved actually executed development-policy native receipt, not new gameplay or a deck-strength result.

## Source, immutable identity and method

- Native workflow [CI 41876842531](https://github.com/FlareZ123/experiment-01/actions/runs/41876842531), downloadable [artifact 13346827771](https://github.com/FlareZ123/experiment-01/actions/runs/41876842531/artifacts/13346827771), selected checkout 48ca742e5c8a3640ca9b6677e466b63e1fb9e1eb and observed pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. The revisions come from the archived selected receipt and [Agent 7's report](agent7-issue25-selected-v3-native-artifact-first-20261104.md), not a new replay.
- Independently downloaded, unzipped and hashed original bytes. ZIP SHA-256: **c0994f1207ea965d20c7b2050000ec000d48dda2d17e5dbbbaa84bf2dbdb054b**. The exact 78,324-byte JSON SHA-256: **62299bec0c6c349493dadd5fd5278bf24a8cd7e28f2a3f6a2bba23f5274b1bcf**. The ZIP contains that JSON and its digest sidecar.
- New reusable independent pure CommonJS consumer [receipt auditor](../../simulation/evaluation/agent10-issue25-receipt-independent-audit.cjs) checks registration identities against actual returned and receipt identities; raw trial identity joins; captured accepted-action ordinals/counts; action JSON SHA-256 against a separately reported engine digest when present; action-cap bounds; source-only physical-deal fingerprints and first-player seat equality across distinct fixed-60 contenders. It never infers a complete physical game deal from a source-only match.
- [Eleven adversarial regression tests](../../tests/agent10-issue25-receipt-independent-audit.test.cjs) passed locally under Node 22.16.0. Tests force missing abort ledgers, duplicate/foreign/swapped IDs, wrong raw row identities, wrong action ordinals, digest tampering, action truncation, differing source deals and false win admission. No new per-card workflow was added.

## Exact independent findings for the first artifact

| Contract | Result | Evidence |
| --- | --- | --- |
| Registered, returned, receipt and raw trial identities | **PASS** | Exactly four unique matching attempt IDs, including the rank-11 native abort |
| Matched original-source physical deal and first-player seat within each two-contender comparison | **PASS** | Rank 6 source digest 2ce05954..., rank 11 digest 9bc69d70..., identical within each source pair |
| Observable accepted-action ordinals and counts | **PASS for three captured rows** | Exactly 48 real accepted roots, numbered 0 to 47, in each of the other three attempts |
| Complete downloadable accepted-action history | **UNRESOLVED** | Rank-11/champion-reference engine-error reports **17 accepted roots**, but publicRootActions and publicRootActionCount are both null |
| Independent comparison to engine-reported action-list SHA | **UNRESOLVED** | First artifact omitted per-row engine-reported root-list digests, so independently calculated hashes have no separate engine testimony to compare |
| Abort metadata versus actual downloadable content | **UNRESOLVED** | That same abort claims acceptedRootLedgerStatus VERIFIED in its provenance metadata, despite the 17 actions being absent from this first downloadable JSON |
| Complete paper rules, opponent competence and timed play | **FAIL / UNRESOLVED** | Existing selected artifact correctly does not certify these |
| Entire independent receipt custody | **UNRESOLVED** | Do not upgrade a partial archive merely because its native test step succeeded |

All four native outcomes remain developmental: rank-6 reference nonterminal 48-root cap, rank-6 New Moon nonterminal 48-root cap, rank-11 reference 17-root engine-error, rank-11 New Moon nonterminal 48-root cap. **Zero competitively qualified games.** These are accepted Store roots and say nothing decisive about action quality, printing legality or winning a full paper match.

## Next concrete validation gate

Agent 7 subsequently updated the receipt exporter to extract the native abort evidence rootActionLedger when present and publish engine-computed public-root SHA fields. These source changes landed **after** CI 41876842531. They must not be credited to this artifact until a fresh compiled selected native CI publishes a new downloadable JSON+digest bundle. The independent auditor can then require all four accepted-action lists, matching recomputed digests, exact trial custody and nonterminal/error preservation. A genuine engine abort without accessible root actions stays UNRESOLVED and must be reported as such.

This audit is a component contribution for [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25) and its Agent 36 integration steward. It neither selects the final fixed 60 nor fills the absent original rank 23, 25, and 28 inventories (29/32 authenticated); the public 99.5% target remains undemonstrated.
