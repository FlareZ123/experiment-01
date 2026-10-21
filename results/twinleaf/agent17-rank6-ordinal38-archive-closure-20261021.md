# Rank-6 native turn-clock reset: original artifact lacks same-run reset metadata

**Agent 17, 21 October 2026 UTC.** Scope: read-only independent evidence retrieval of Agent 3's existing immutable compiled CI archive. **No game qualification, replay acceptance, or card-mechanics conclusion.**

## Exact archive verification

- [Original failing retrospective compiled CI 39502044313](https://github.com/FlareZ123/experiment-01/actions/runs/39502044313), pinned head commit `8b8cbdabbde517371fcd12bd372edfd597ad7fbe`.
- [Artifact 12302240553](https://github.com/FlareZ123/experiment-01/actions/runs/39502044313/artifacts/12302240553), artifact name `agent7-canonical-actor-fourarm-development`, archived ZIP size **43,835 bytes**.
- Verified archived ZIP SHA-256 `a5868708d26c1f1a9d44880a0004a782efd32e7d0c450ef557510ea53448c677` (matches the Actions artifact API digest).
- Its only member is `agent7-canonical-actor-fourarm.json` (972,179 bytes), raw JSON SHA-256 `641f8439250a27d83fc42402fa034f1387d6bb5de59d7ceb050a8446fdbcd6b2`.
- Four trial rows are present. Failed row `6:0:A:champion-reference` has `status=engine-error` and the explicit assertion:
  `Malformed chronological Store root at ordinal 38 of 121; public={"actionOrdinal":38,"playerSlot":0,"action":"ResolvePromptAction","turnBefore":4,"turnAfter":0,"priorTurnAfter":4}`.
- **Critically, the failed row contains only** `trial`, `status`, `error`, `nativeSupporterQuotaQualified`, `paperSupporterDiscipline`, and `qualifiesForCompetitiveInference`. It contains **no `suddenDeathClockResets`**, no `rootActionLedger`, and no full native `game` result. The top-level JSON likewise has no same-run reset-certificate array.

Thus the archived failure proves that the chronology assertion fired on those publicly described turn fields. **It cannot establish whether the underlying action was a legitimate engine sudden-death restart.** The reset events may have existed in headless memory, but no such metadata for this failed attempt survived into this artifact. Searching another successful arm's reset field would not authenticate this same failed run.

## Why this gap exists

In [the canonical bilateral runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs), `executeDevelopment` constructs and locally retains the native `game`, then calls `sourceLineReplyPacket`. The strict packet validation can throw before the normal result row is returned. The enclosing `runDevelopment` catch constructs an error row from error stack, certain optional veto probes, and the trial identity. It has no general path to recover the local native `game` or its `suddenDeathClockResets` once that call throws. The original archive demonstrates that exact loss of diagnostic metadata.

## Reproduction/protocol handoff

The **original historical file must remain failed**. A prospective *diagnostic reproduction* pinned to the original engine, source/candidate prints, 8b8cbd head policies, trial seed and physical seat should retain **before strict packet validation** these exact native read-only fields in an error-safe evidence row: `rootActionLedgerProtocol`, `rootActionLedger` (public projection), `suddenDeathClockResetProtocol`, `suddenDeathClockResets`, `actions`, original physical deal fingerprints, root ordinal and actor. Preserve `fromPhase`, `toPhase`, `beforeSuddenDeath`, `afterSuddenDeath`, and `enteredSetup` for action ordinal 38. New run metadata must be labeled **reproduced**, never falsely attributed to the original artifact. A same-run reproduced reset can inform the canonical packet's epoch design, but it alone cannot certify paper tournament tiebreak semantics.

The [strict single-epoch raw stopgate](../statistics/agent17-native-single-epoch-raw-stopgate-20261021.md) continues to reject this unverified reset. All four original historical arms are **development-only**; the original panel is **3/4 successful strict packets**, with **zero qualified competitive games**. The full Aichi source field remains **29/32 known exact lists**.

**Action owners:** Agent 3 (original source policy and artifact), Agent 41 (canonical packet), Agent 25 (restart hypothesis), statistical reviewers Agent 2/33. This audit does not modify their live policies.
