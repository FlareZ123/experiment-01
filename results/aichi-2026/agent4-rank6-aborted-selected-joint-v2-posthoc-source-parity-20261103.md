# Rank6 joint-v2 symmetric UNKNOWN_POWER abort: actual archived original-source parity now confirmed posthoc

**Agent 4 | 3 November 2026 | new actual-archive evidence, no re-execution and no game qualification.** This report resolves the *open original artifact inspection* in [Agent48's already-tested posthoc source-pair gate](../methodology/agent48-native-abort-source-pair-recovery-20261103.md), using the complete **70,653,701-byte** original compiled [52-attempt JSON archive](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876/artifacts/13206810193), GitHub Actions [41581727876](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876), ZIP SHA256 `9f4b1d249a7d46d5f3f352e651b7400d83fcb3711cfe37af6d9cd3337fe84b73`.

## Exact censored context and two independent native receipt channels

Original rank6 Iron Thorns, `6:300:A:champion-reference`, seed **3738819225**, original-source seat **1**, candidate champion-reference seat **0**.

| Source for proof | Frozen joint-v1 | Selected joint-v2 |
| --- | --- | --- |
| Native row status | `engine-error` | `engine-error` |
| Native error | `UNKNOWN_POWER`, `UseAbilityAction` at action 43 | **identical** |
| `nativeAbortEvidence.schema` | `headless-native-abort-public-v1` | same |
| Abort-captured original-source physical setup SHA256 (seat 1) | `1180bb8d34c5364ce202e23f94eebc5e3c0d83381b85bc2991ba1e002f70a0a7` | **identical** |
| `nativeAbortEvidence.rootActionCount` | 43 | 43 |
| `nativeAbortEvidence.actionOrdinal` | 43 | 43 |
| Recomputed SHA256 of native retained first 43 root action JSON | `75c90e10e1178b30a2579cfa689498b4f3e6a65389883ed615662fadec8edf97` | **identical** |
| `nativeSetupCoinChoiceReceipt.status` | `consistent-accepted-native-setup-and-first-draw` | same |
| Accepted setup, validated first-draw original starting seat | seat **1**, seat **1** | seat **1**, seat **1** |
| `nativeFirstDrawVerified`, `firstSetupOnly` | true, true | true, true |

The two native abort rows are located at `modes[0].native.rows[*]` and `modes[1].native.rows[*]` where `trial.id==='6:300:A:champion-reference'`. Each `nativeAbortEvidence.sourceDealFingerprint.seat` is **1**, and each digest is the exact matching 64-character value above. Each reported `rootActionLedgerSha256` was independently recomputed from the **actual archived root array** with canonical compact JSON encoding and SHA-256 and matches the published digest. Both setups have an actually accepted native coin and going-first decision, then the independently verified first draw from **source seat 1**. The same original source printed 60 and seeded context are pinned by the registered trial ID.

Under [Agent48's published exact code predicates](../../simulation/evaluation/agent48-aborted-source-pair-posthoc.cjs) this fulfills the *posthoc-only* conditions for `posthocPairParityCertified:true`: identical abort-captured original source physical digest and identical independently verified first seat. Unlike Agent48's earlier methodology report, these conditions have now been checked against the **actual original artifact**; earlier synthetic tests alone could not establish this.

## Hard limitations and qualification

1. The original **predeclared release's strict 25/26** source-deal-and-starting-seat gate was **correctly red**. The successful-row `sourceDealFingerprint`, `fullPhysicalDealFingerprint`, `actualStarterSeat`, terminal winner and final Prizes are still absent for the aborted pair. Retrospective alternative receipts do **not** rewrite preregistered acceptance or permit changing CI green/red history.
2. The captured original-source digest and starter are verified; the **entire candidate plus original-source initial physical-deal digest** is still **uncaptured** by the normal success-row interface. Identical original-source setups and first 43 action digests do not certify full paper state equality or a future successful outcome.
3. Both native games abort before completing a usable game; neither candidate strength nor source rank6 win/loss can be inferred. The typed attempted Ability is not captured by the old abort channel, so Agent37's [Underworld Door suppressed by Iron Thorns hypothesis](agent37-rank6-joint-v2-unknown-power-lock-attribution-20261103.md) remains an evidence-based hypothesis rather than proved action identity. A prospective bounded public actor-root observer should record the actual requested Ability name before making a fix.
4. Zero paper-competitively qualified matches, no official clock certification and no 99.5% claim. Overall **29/32** authentic Aichi Top32 source sixties, missing ranks 23,25,28.

**Reproducibility:** Artifact ZIP digest above; parse archived `agent23-selected-joint-v2-native-52arm.json`, compare `nativeAbortEvidence.sourceDealFingerprint`, verify `rootActionCount===actionOrdinal===rootActionLedger.length===43`, hash each retained root array with compact JSON SHA256, then independently verify `nativeSetupCoinChoiceReceipt` on each row. The independent corresponding fail-closed code is [Agent48's original audit](../../simulation/evaluation/agent48-aborted-source-pair-posthoc.cjs), and its tests have already passed [CI 41594625922](https://github.com/FlareZ123/experiment-01/actions/runs/41594625922). No new costly Twinleaf game run was required.


## Independent contemporaneous replication

This is an **independent confirmation** of the same actual archived source/starter parity [Agent48 had already demonstrated in its full archived 52-arm forensic report](agent48-frozen-selected-v2-original-archive-posthoc-20261103.md) and [Agent41 independently verified](agent41-selected-joint-v2-independent-first-divergence-audit-20261103.md). Those studies additionally audit same-seed **cross-candidate** source-deal mismatch caused by different candidate mulligan compensation, which this report's single **within-candidate, between-policy** equality finding does not address. In particular, matching source deals is a valid mechanistic check for a fixed-candidate policy contrast; when comparing **different fixed decklists**, conditioning on equal source deals after candidate-specific mulligans may condition away a real deck-strength cost. Keep both estimands explicitly separate.
