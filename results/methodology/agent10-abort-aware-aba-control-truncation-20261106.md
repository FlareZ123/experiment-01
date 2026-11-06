# Agent10: abort-aware A/B/A replay comparator and control-horizon veto

**6 November 2026 | Independent research-owned, synthetic-regression evidence.** This is a methodological safeguard for the Aichi fixed-60 research objective. It makes no card-strength claim and certifies no paper-qualified game.

## Motivation: the historical v9 misclassification

The [historical v9 run](agent36-issue25-v9-paid-retreat-aba-128root-20261106.md) used three phases on eight frozen original contexts (24 native attempts). The [independent artifact audit](agent20-v9-paid-retreat-aba-audit-20261106.md) recovered the complete control ledgers: three ordinary top-level ledgers and five accepted prefixes under `nativeAbortEvidence.rootActionLedger`. All eight A/B/A histories match. The B root wrapper never installed, so there was **no treatment applied**. The original control comparator incorrectly required a top-level SHA even when the raw abort evidence preserved a complete pre-error prefix; the vacuous `treatmentDiff===null` clause also permitted a positive-looking first-divergence predicate without an actual B intervention.

The current blocker is general: a future 240-root comparator must distinguish *full bounded replay*, *matched error-censored prefixes*, *missing evidence*, *same-action no-witness*, and *a real treatment divergence*. A false completed-control label could turn deterministic prompt-quarantine errors into manufactured experiments.

## Reusable pure comparator

- [Independent CommonJS implementation](../../simulation/evaluation/agent10-abort-aware-aba-audit.cjs), version `agent10-abort-aware-aba-audit-v1`.
- [18 synthetic regression cases](../../tests/agent10-abort-aware-aba-audit.test.cjs); integrated into the existing Agent10 entrypoint of the **manual-only** statistics workflow, without a new workflow or continuous trigger.
- The implementation requires all original registered trial IDs in each A/B/A phase, exactly one source seat per trial, complete source/full physical-deal fingerprints and consistent starter/seat metadata.
- `evidenceLedger` accepts an ordinary top-level root ledger or an abort-preserved ledger. If both exist and disagree, it fails closed. A missing ledger remains missing, never an implicitly empty replay.
- A/A' equality of actual root objects and native outcome is recorded as `BOUNDED_ROOT_REPLAY` or `CENSORED_PREFIX_REPLAY`. The latter remains a partial, unqualified witness; a missing B ledger does not erase independently demonstrable A/A' replay.
- Live wrapper activation is **separately reported**. A requested mode or manifest flag does not prove that the live root-selection predicate installed the treatment; the comparator requires explicit `runtimeWrapperReceipt` values with `origin: 'live-scopedRoot-predicate'`. Even such a receipt is caller-supplied, so real native provenance requires independent acceptance testing.
- A non-null first A/B difference must be an actual `RetreatAction` of the registered **source** seat with a safe integer accepted-action ordinal. That is only a **candidate needing real root-Store physical custody**, never a qualified policy payoff.
- **Additional truncation veto:** a B action appearing only after the A ledger ended is `CONTROL_ENDED_BEFORE_DIVERGENCE`, even if B's next root happens to be a RetreatAction. That observable suffix cannot identify a causal first-root treatment difference when the control stopped at an engine error, root cap or other censoring boundary.

## Negative cases covered

The synthetic tests include the historical matched-abort shape, absent wrapper receipts, a recorded A/A/A inactive wrapper, an installed B with a null divergence, a B retreat by the wrong physical seat, a retreat with no accepted ordinal, a B-only extension beyond a capped control, a B-only extension beyond an abort, unequal physical openings and starter positions, an independently mismatched A' outcome, a divergent A' ledger, missing/contradictory ledgers, and duplicate/unregistered trials.

**Validation status:** All 18 synthetic cases executed successfully in an isolated JavaScript harness at authoring time. The initial manual [statistics CI dispatch 42298421370](https://github.com/FlareZ123/experiment-01/actions/runs/42298421370) checked out the earlier 17-test revision; its job outcome is recorded separately after completion. The final control-horizon veto and 18th test require a later CI checkout for actual Node verification. No native Twinleaf match is invoked by these fixtures.

## Integration boundary and next action

This comparator is independent and **does not modify the historical frozen v9 runner, archived outcomes or fixed opponent lists**. Agent36/Agent41 should consider its fail-closed distinctions when implementing a separately preregistered v10 report, preferably after confirming actual runtime activation, the five remaining original-policy prompt paths, and root-Store/action-ordinal custody. Reconcile the eight historical error-preserved prefixes as a documentation control; do not pretend they are eight completed games.

A positive source RetreatAction first-root divergence still requires exact same-Store Energy payment, target promotion, settled attack, Prize, meaningful opponent response and source return. Neither this comparator nor the historical v9 audit establishes that chain.

**Research status at this checkpoint:** developmental v8 baseline, no selected final fixed 60, 29/32 authenticated original card-name/count inventories (ranks 23, 25 and 28 missing), zero qualified competitive games and no demonstrated 99.5% field win rate.

## 6 November 21:47 UTC integration revision: actual adapter receipts and error coverage

The shared `simulation/evaluation/agent41-bilateral-v2-development.cjs` now emits genuine per-row `twoUnitPaidRetreatRootOptIn`, `twoUnitPaidRetreatRootV2OptIn`, `twoUnitPaidRetreatRootOptionPassed`, and `twoUnitPaidRetreatRootWrapperSelected` fields from its live `paidRetreatRootWrapperActivationReceipt` branch and attaches them to native returned/aborted rows. This pure comparator now consumes those **actual existing row fields** directly in addition to its independent optional `runtimeWrapperReceipt` interface. The registered A/B/A acceptance pattern is `false/true/false` for opt-in, validated option passed, and wrapper selected, with each phase's individual trial receipts required to agree. Missing, conflicting, or incomplete native data fails closed. This is an auditable branch-selection receipt and does **not** prove the selector was invoked on a positive native opportunity. A deterministic native positive canary remains necessary for the v10 treatment.

A separate review corrected a second false-completeness risk: a returned top-level accepted-root ledger can accompany a native error or quarantined status. The adapter now labels those rows `CENSORED_PREFIX_REPLAY` even if the ledger is top-level. Starter is restricted to seat0/seat1, and candidate-seat metadata must complement the registered source seat. Errors differing between A and A' invalidate control replay.

**28 synthetic regression tests** now cover these extra cases and pass the isolated V8 runtime harness; earlier 17-case and 18-case versions also passed the named Agent10 CI step. Both older overall runs failed at an unrelated immutable-policy-pinning check, which must not be misreported as a failure of the specific comparator tests. A 28-case Node workflow checkout should be recorded separately, with both individual-step and overall statuses. No competitive game qualified.


## 6 November 22:18 UTC: actual v9 compact/raw archive envelope support

I downloaded the immutable historical [v9 archive 13519261081](https://github.com/FlareZ123/experiment-01/actions/runs/42246115429/artifacts/13519261081) and inspected its real exported schema. Each phase contains **both** a compact `phase.rows` physical custody summary and an unabridged `phase.rawDevelopment.rows` native action/abort record. Five aborted raw rows store `sourceSeat: null` and `candidateSeat: null`, while the matching compact rows preserve the exact physical seats, source/full deal digests and starter. Taking either alone loses evidence.

The comparator now carefully reconciles these **same-ID** layers through `byTrial`: it copies missing custody fields from the compact summary, rejects any raw-versus-compact contradiction, and rejects missing/duplicate trial identities. New public pure `auditArchive(archive)` constructs the registered source-seat frame from the native envelope and invokes the unchanged fail-closed A/B/A audit. It does not silently promote any row to a qualified game. The actual historical v9 lacked new per-row live-wrapper receipts, so this helper properly calls treatment activation **ACTIVATION_UNVERIFIED**, even though a separate source-code inspection in the steward report already establishes the historical wrapper never installed.

Four new regression tests model the **real schema**: eight original IDs with five raw abort-preserved root ledgers and three top-level bounded root histories; compact-summary custody fallback; contradictory raw/compact metadata; missing compact row; missing registration. All **32 synthetic cases** executed successfully in the isolated V8 JavaScript harness (source and test edits `3c23b954` and `87355eda`). The actual 5.8MB immutable v9 archive was **schema-inspected, not dynamically executed** against the new comparator in this run. Manual Node CI [42302541327](https://github.com/FlareZ123/experiment-01/actions/runs/42302541327) separately passed the named Agent10 test step; the overall statistics workflow retained Agent16's unrelated four-unreviewed-key policy-inventory failure. Preserve the full historical archive digest in the Agent36/Agent20 reports.

