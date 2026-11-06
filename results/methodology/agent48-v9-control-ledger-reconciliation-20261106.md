# Agent48: v9 A/B/A control ledgers are exact after abort-evidence normalization

**Date:** 6 November 2026  
**Scope:** Independent post-hoc audit of the archived v9 A/B/A run. This is a ledger-reconciliation result, not a new game sample.

## Executive finding

The v9 run's reported control-replay failure is a **false negative in the comparison layer**. The native artifact contains all eight A, B, and A' root ledgers. Three normal/capped rows store the ledger at top level; five engine-error rows store it under `nativeAbortEvidence`. Once both locations are read, every A/A' pair and every A/B pair is element-for-element identical.

- A/A' root ledgers exact: **8/8**.
- A/B root ledgers exact: **8/8**.
- A/B/A physical openings matched: **8/8**.
- Independently recomputed JSON-ledger SHA-256 digests matched stored digests: **8/8**.
- First divergent root ordinal: **none**.
- Treatment root changes: **0**.
- Treatment RetreatAction roots: **0**.
- Competitively qualified games: **0**.

This does not promote the treatment or qualify the games. Five attempts still terminate in the same bot-decoder engine error, three reach the 128-root cap, and no attempt finishes a game.

## Provenance and method

Source: GitHub Actions workflow run [42246115429](https://github.com/FlareZ123/experiment-01/actions/runs/42246115429), artifact **13519261081**, file `agent36-issue25-common-v9-paid-retreat-aba.json`.

The downloaded JSON payload is 5,846,374 bytes with SHA-256:

`f91552274c354e54226b315ff3ca9e39ddfa7dc3cf3096b2ea863a0d3d602bc4`

The artifact records repository commit `7ea8479c6acda71916aade2f28f73065a50b7c88`, Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and the registered phases `A-v8-control`, `B-common-paid-retreat`, and `A-repeat-control`.

For every trial ID, I joined the three raw rows by exact registered ID and resolved the root ledger as follows:

1. Use top-level `rootActionLedger` when it is an array.
2. Otherwise use `nativeAbortEvidence.rootActionLedger` when it is an array.
3. Resolve the corresponding top-level or nested SHA-256.
4. Recompute SHA-256 over compact JSON serialization equivalent to Node's `JSON.stringify`.
5. Compare the full arrays element by element for A/A' and A/B.
6. Compare source-deal fingerprint, full physical-deal fingerprint, starter seat, and physical source/candidate seats across all three phases.

All eight stored digests matched independently recomputed digests. No root entry differed.

## Trial-level results

| Registered trial | Seed | Accepted roots | Ledger location | A/A' | A/B |
| --- | ---: | ---: | --- | --- | --- |
| `6:210:B:champion-reference` | 2950430245 | 128 | top-level | Exact | Exact |
| `6:210:B:new-moon-lockbreaker-v1` | 2950430245 | 118 | `nativeAbortEvidence` | Exact | Exact |
| `11:211:A:champion-reference` | 517355142 | 128 | top-level | Exact | Exact |
| `11:211:A:new-moon-lockbreaker-v1` | 517355142 | 88 | `nativeAbortEvidence` | Exact | Exact |
| `1:212:B:champion-reference` | 1084952875 | 98 | `nativeAbortEvidence` | Exact | Exact |
| `1:212:B:new-moon-lockbreaker-v1` | 1084952875 | 128 | top-level | Exact | Exact |
| `3:213:A:champion-reference` | 948758444 | 106 | `nativeAbortEvidence` | Exact | Exact |
| `3:213:A:new-moon-lockbreaker-v1` | 948758444 | 93 | `nativeAbortEvidence` | Exact | Exact |

The five engine-error rows preserve 118, 88, 98, 106, and 93 accepted roots respectively. They are partial histories ending at an engine failure, not zero-root attempts and not completed games.

The machine-readable trial summary, including every verified digest and physical-deal fingerprint, is [agent48-v9-control-ledger-reconciliation-20261106.json](agent48-v9-control-ledger-reconciliation-20261106.json).

## Exact v8 physical-deal anchor

The v8 artifact's rank-6 champion control is reproduced exactly in the v9 A/B/A artifact:

| Field | v8 anchor | v9 A / B / A' |
| --- | --- | --- |
| Trial | `6:210:B:champion-reference` | Same |
| Seed | `2950430245` | Same |
| Source-deal fingerprint | `1606c4857b466c2b715c6e70460e02623f6a4201517c1046bdbfc75fe23a7c65` | Same in all phases |
| Full physical-deal fingerprint | `edfdea7fe22ed1aba7e3058770ce3c2da43c93c6364fc5b5bf69c5f4442daa20` | Same in all phases |
| Source deck fingerprint | `b50e4cf27c449653cf9c61e4e830b7a3d61f9b1c7e42a7dfd2d781a1c6e6895a` | Same |
| Candidate deck fingerprint | `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311` | Same |
| Actual starter seat | 0 | 0 |
| 128-root ledger SHA-256 | `8d2fb306028df25f4068f3961afba309df560fff0854377bbe91dcab38698d63` | Same in all phases |

The original v8 physical deal and complete 128-root prefix are preserved. This is a stronger anchor than comparing only seed values.

## Why the v9 control gate reported failure

In `simulation/evaluation/agent36-issue25-common-v9-paid-retreat-aba.cjs`:

- `firstRootDifference(a,b)` reads only `a.rootActionLedger` and `b.rootActionLedger`, substituting `[]` when the top-level field is absent.
- `controlsRepeatedExactly` requires a string top-level `rootActionLedgerSha256` for both rows.

The five engine-error rows have neither top-level field. Their complete partial ledgers and matching hashes are nested under `nativeAbortEvidence`. The top-level-only comparator therefore reports a failed control gate even though the evidence required to compare those rows is present and exact.

There are two distinct defects in the comparison semantics:

1. **Evidence location is not normalized.** The abort archive is ignored.
2. **Missing and equal are conflated.** The current first-difference helper returns `null` for two missing top-level arrays because it compares two substituted empty arrays. A null result cannot prove equality when no ledger was loaded.

The native test correctly failed closed on its declared top-level predicate. Its failure does not demonstrate random-stream nondeterminism or a divergent A/A control.

## Interpretation

The v9 artifact was produced without forwarding the two opt-in RNG-isolation flags through the bilateral adapter, so the default shared-stream protocol applied. Despite that, the archived A/B/A root histories are exactly repeatable for all eight registered contexts. This artifact provides **no evidence that shared PRNG state caused the reported A/A failure**.

RNG isolation remains useful for future causal comparisons: policy decisions and physical shuffle/game-event randomness should be independently controllable and explicitly recorded. It should be treated as a prospective experimental factor, not as the explanation for this particular false-negative gate. A separate fresh-process replay can add evidence, but it is not needed to resolve the existing artifact's comparison failure.

The paid-retreat treatment remains **no witness**. The treatment and both controls have identical root histories within the 128-root horizon; no RetreatAction was reached. The known root131 line remains outside this cap. There are still zero competitive games and no deck-strength inference.

## Successor requirements

A v10 or later comparator should:

- extract top-level or nested abort ledgers using one shared helper;
- return explicit `EXACT`, `DIFFERENT`, `DIGEST_MISMATCH`, or `UNAVAILABLE` states;
- never treat absent arrays as empty arrays;
- independently recompute stored ledger digests;
- report the first divergent ordinal only when both ledgers are present;
- preserve the distinction between an engine-error partial history, a root cap, and a completed game.

A reusable implementation is available at [agent48-native-root-ledger-reconciliation.cjs](../../simulation/evaluation/agent48-native-root-ledger-reconciliation.cjs), with regression coverage in [agent48-native-root-ledger-reconciliation.test.cjs](../../tests/agent48-native-root-ledger-reconciliation.test.cjs). The test is included in the manually dispatched Twinleaf RNG audit workflow.

**Conclusion:** correct the v9 interpretation to **8/8 exact A/A' root histories and 8/8 exact A/B root histories, with five engine errors and three root caps**. Keep the v9 treatment unqualified. The immediate blocker is comparator normalization, not a demonstrated RNG replay failure.
