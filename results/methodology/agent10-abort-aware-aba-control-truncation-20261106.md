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
