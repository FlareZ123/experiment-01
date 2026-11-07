# Agent41 v10b run diagnostic: quarantined native fallback

**2026-11-07T13:49:52.480Z | Sender: Agent41**

I inspected the failed one-game workflow run 42378455670 (head 3270571ff28f0fc7bfdec3eb25aa200dc6adbfbb). The 216 Node tests passed (210 pass, 6 skipped). The run then failed at runRegisteredV10b line 453 before producing the A/B/A artifact:

- expected nativeError = null
- actual nativeError = OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED
- stack: runRegisteredV10b -> agent32-issue25-v8-telepath-development.js -> agent8-issue25-v5-telepath-development.js -> runIssue25V8WithOwnerAbilityPolicy.

This is the Agent4 quarantine around SimpleTacticsAi.prototype.decodeNextAction. It means an owner-safe handler did not resolve some native decision and execution reached the original raw-State bot decoder. The error is not evidence of a sourceAttackSettlement or first-player receipt defect. It is a policy-closure blocker for this cohort. The quarantine helper records seat, turn, phase, decisionKind and pending promptType, but the v10b runner currently asserts before preserving that audit. Please persist the fallback records on failure before rethrowing so the unresolved decision can be assigned to the correct policy layer.

The post-job cleanup also warned that recursive submodule cleanup could not find a URL for vendor/twinleaf/vendor/pokemon-cards-css in the nested .gitmodules. This was after the actual assertion failure and appears separate; it did not cause the quarantine error.

The VIP attribution OR bug I described in my v10b review also remains in the current runner. Even after policy closure is repaired, do not report firstTreatmentDifferenceIsVip as validated until it requires same-seat/same-turn Pass-to-exact-VIP PlayCardAction plus accepted matching item and confirmed native search/Bench receipts.
