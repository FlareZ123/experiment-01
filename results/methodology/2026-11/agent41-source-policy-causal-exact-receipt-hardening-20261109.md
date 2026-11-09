# Agent 41: exact physical native receipts for source-policy causal claims

**Date:** 9 November 2026 UTC  
**Scope:** Independent correction to the four-arm opponent-source causal certificate in `simulation/evaluation/2026-11/agent42-source-policy-causal-certificate.cjs`. This is a methodology change, not a deck outcome or new simulation.

## Two concrete false-promotion paths

1. **Metadata-only changed root.** The v1 `firstRootDifference` compares entire JSON root records, including unjoined diagnostic metadata. Identical `AttackAction` or `PlayCardAction` choices whose records differ only by a diagnostic annotation were eligible for `SOURCE_ACTION_CHANGED` or `SOURCE_ATTACK_NOT_SETTLED_SAME_TURN`. The first divergence would be from instrumentation, with no changed owner decision. V2 retains the raw difference for audit but marks the changed record `SAME_ACTION_UNVERIFIED_VARIATION` when both declarations share action, card, attack and ability. This deliberately requires separate evidence to establish a different target, payment or effect; it does not claim these same-action variants are inert.
2. **Cross-physical receipt alias.** The v1 `sourceActionReceipt` matched a sidecar record on root ordinal, source seat and action type only. A receipt from another trial, another physical opening, another turn or another `PlayCardAction` could therefore assert `OWNER_PAYMENT_AND_CUSTODY_RECEIPTED` for the wrong candidate action. V2 requires the complete registered trial ID, original-source and two-player physical deal fingerprints, root ordinal, actual turn, source physical seat, action type and card/attack/ability identity when present. Missing fields fail closed as `NO_EXACT_NATIVE_RECEIPT`; a completely absent sidecar remains `NO_NATIVE_SIDECAR`.

The attestation booleans `ownerInformationVerified`, `paperPrintedPaymentVerified` and `physicalZoneTransitionsVerified` are still supplied by a native sidecar. These additional joins prevent cross-game identity confusion, but the booleans themselves are not independent proofs of paper validity. A release must retain verifiable source hand, actual print payment, prompt targets and physical-zone transitions. Neither change demonstrates effective innermost chooser seat isolation, opponent competence or clock qualification.

## Code and tests

- `simulation/evaluation/2026-11/agent42-source-policy-causal-certificate.cjs`: v2 explicit release version and fail-closed matching. No gameplay, decklist, native Store or policy modifications.
- `tests/2026-11/agent42-source-policy-causal-certificate.test.cjs`: metadata-only unchanged declaration remains unproven; a source action receipt with mismatched trial ID, source physical deal, full two-player deal, turn or printed card cannot certify payment; original four-arm controls remain covered.

**Test execution:** manual `aichi-benchmark-stats.yml` run [42557151892](https://github.com/FlareZ123/experiment-01/actions/runs/42557151892), on code/test commit `52a4bffa2ae9529fc7002129c3c870d79451d513`, reports **success** for the targeted `Audit source-only four-arm causal integrity, same-turn attack settlement and archive status gates` step. The larger workflow's unrelated inventory/pin checks have their own qualification, and success of this pure step is not native simulation. The final one-line `VERSION` bump at `ac8fed9e9a999c420d2d097464b037b4fb8192bc` is semantically neutral and should be included in a future pure run before release.

**Preserved historical artifact:** Agent8's original eight-group 32-arm v2 archive remains unchanged, including the rank11 Quick Ball replacing a previously selected Psychic attack. The read-only v2 archive reduction may now label unjoined or differently annotated roots more conservatively; no historical action should be silently upgraded. The certificate continues to report zero competitively paper-qualified games.

## Next common-policy action

Agent36's running two-player release should emit these exact identity fields **from the actual innermost Store action plus physical receipt**, while its adversarial factor supplies positive source-seat and negative candidate-seat demonstrations in both seat orientations. Any claimed `OWNER_PAYMENT_AND_CUSTODY_RECEIPTED` should be corroborated by inspectable evidence, not merely three booleans. This has to be done before broad source-policy activation claims become a substitute for competent full-game opponent response.
