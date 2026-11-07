# Agent41 independent review: Aichi clock disposition and no-call evidence

**Review time:** 7 November 2026, 19:31 UTC  
**Reviewed Agent27 source head:** `54caddd5992ecaedd649195a4f452344bbf5bbf9`  
**Workflow:** [42402221617](https://github.com/FlareZ123/experiment-01/actions/runs/42402221617), overall success.

## Verdict

Agent27's event-specific clock adjudicator is appropriately scoped as a **conditional, read-only classifier for an actual official end call and any resulting knockout extension/tiebreaker**. The per-attempt distinction between a genuine no-call game and a missing clock receipt is necessary and must remain in the broader complete-game attempt validator.

I independently checked the current module, both Agent27 test files, and the benchmark workflow against commit `54caddd5992ecaedd649195a4f452344bbf5bbf9`; all four are byte-identical to the successful run revision. The dedicated clock/evidence job and broader benchmark job passed, including **59/59 clock/evidence tests**. This validates the current conditional rule and packet-shape logic. It does not validate the new per-attempt `clockDisposition` schema, which is still a recommendation in the report and communication rather than an implemented field in the public attempt classifiers I inspected.

## Required per-attempt contract

Keep these fields separate:

- `paperReceiptId`: reference to the complete, independently reviewed paper game record and relevant paper-state/action evidence.
- `clockDisposition`: explicit classification of what happened with the official clock.
- `clockReceiptId`: nullable reference to one actual official-call packet.
- `adjudicationProtocolSha`: immutable digest binding the exact Aichi event-rule source/snapshot, schema version, and Agent27 adjudication module revision.

Recommended dispositions:

| Disposition | Required evidence | Admission |
|---|---|---|
| `no-official-call` | `clockReceiptId: null`; nonempty `paperReceiptId`; complete paper record and independent review establishing a natural terminal game result before any official end call | Non-admitting until the paper record and no-call claim are authenticated |
| `official-call` | Nonempty, unique `clockReceiptId` resolving to exactly one full stage-specific `timeCallPacket`; separate `paperReceiptId` | Call `auditTimeCallPacket`; if it enters extension, require the complete independently reviewed extension ledger and call `auditExtensionLedger` |
| `disputed` | Preserve the disputed call/record and review status, whether or not a packet is available | Non-admitting |
| `unverified` | Preserve missing, malformed, or unauthenticated clock evidence explicitly | Non-admitting |
| `capped` | Preserve the native action/root cap as a cap; do not infer a tournament time call | Non-admitting |
| `engine-only` | Preserve a native engine terminal without a complete paper/clock record | Non-admitting |

### The no-call distinction is essential

A null `clockReceiptId` is ambiguous. It can mean a legitimate game ended naturally before the clock was called, or that a timed game occurred and the required clock packet was omitted. Those are materially different evidence states.

Therefore `no-official-call` must require a positive, independently reviewed paper receipt that establishes all of the following:
1. the paper game record is complete through its natural terminal result;
2. the game ended naturally before any official end call;
3. the record/review covers the interval in which a call would have been recorded, rather than simply failing to contain a call event;
4. the paper winner/tie and any relevant final board/Prize state are independently validated.

If the record is incomplete or the reviewer cannot establish that termination preceded any call, use `unverified`, not `no-official-call`. A null clock ID must never manufacture a no-call finding.

### The official-call path is a different conditional branch

For `official-call`, require a nonempty `clockReceiptId` that resolves to exactly one registered packet. Reject duplicate IDs, unresolved IDs, and stage mismatches. The packet must contain the complete stage-specific data required by `auditTimeCallPacket`: official clock, stage/pairing, original starter, call-time turn owner, ordered final-turn sequence, and independently reviewed paper state, plus the prescribed turn-completion fields. The attempt's registered stage must equal the packet stage.

If the packet result enters a knockout extension, the attempt must also resolve a separate complete extension-ledger receipt and pass `auditExtensionLedger`. Do not silently treat a missing extension ledger as a completed timed result.

The structural validator should enforce presence, uniqueness, conditional shape, referential integrity, and the frozen protocol hash. It must not claim that source URLs, judge records, independent review, or the completeness of a paper transcript have been authenticated. Those remain external review obligations.

## Current implementation gap

- `simulation/evaluation/agent27-aichi-open-time-adjudication.cjs` deliberately handles only actual official calls and extension/tiebreaker classification. Its `auditTimeCallPacket` requires `officialEndCallObserved:true`, six nonempty source references, independent paper review, and the prescribed final-turn shape. Its `auditExtensionLedger` requires a source reference, independent-review claim, contiguous sequence, Prize continuity, transition references, and a terminal state. It does not authenticate any reference, which is correctly disclosed.
- `simulation/evaluation/agent41-native-attempt-disposition.cjs` still has a single boolean `officialClockAndGameAdjudicated` source-chain phase. That boolean cannot distinguish a valid pre-call natural terminal from a missing clock receipt.
- `simulation/evaluation/native-attempt-disposition.cjs` classifies native terminal/cap/abort/missing rows only; it has no paper or clock receipt fields.
- The inspected public campaign/evidence-envelope code also does not yet expose the proposed per-attempt `clockDisposition`, `clockReceiptId`, and separate `paperReceiptId` contract.

Thus the recommendation in Agent27's methodology report is sound, but it is not yet implemented in the current public attempt-classification layer. Keep the distinction explicit until the broader validator lands.

## Required regression cases

Add tests to the complete-game attempt validator for:
1. valid `no-official-call` with a complete, independently reviewed natural paper terminal;
2. null `clockReceiptId` with missing/incomplete paper evidence, which must remain `unverified`;
3. `no-official-call` whose paper receipt shows an official call, which must be rejected;
4. missing disposition plus null ID, which must not be inferred as no-call;
5. `official-call` with null, unresolved, duplicate, or wrong-stage `clockReceiptId`;
6. complete official-call packet that passes `auditTimeCallPacket`;
7. knockout extension without a complete ledger, which remains non-admitting;
8. extension with a broken sequence, Prize chain, post-terminal row, or zero-Prize state lacking an independently proved normal win/tie;
9. `disputed`, `unverified`, `capped`, and `engine-only` rows, all retained in the registered denominator and all non-admitting;
10. mismatched or absent `adjudicationProtocolSha`.

## Qualification boundary

Run 42402221617 passed the 59/59 clock/evidence tests on the exact current Agent27 module and test files. The module's own return values remain `competitiveAdmission:false` and `externalIndependentReviewRequired:true`. No real Aichi end-call packet, complete paper match, extension transcript, timed game, or competitive game is certified by that CI run. The current benchmark still has zero competitively qualified games.
