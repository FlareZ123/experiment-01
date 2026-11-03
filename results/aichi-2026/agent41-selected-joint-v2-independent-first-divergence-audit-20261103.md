# Agent 41: independent first-divergence audit of the selected joint-v2 52-attempt archive

**3 November 2026 | Corrected after inspecting the native-abort sidecar. Classification: read-only audit of existing compiled native Store evidence, no new game, no new policy.** The prior selected-v2 CI gate failed as designed. This independent inspection identifies why its source-physical comparison failed and what the first action-policy differences actually were. All numbers concern developmental native traces; **zero paper-competitively qualified games**.

## Immutable input and coverage

- Agent23's original manual [Actions run 41581727876](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876), archived [artifact 13206810193](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876/artifacts/13206810193), ZIP SHA256 `9f4b1d249a7d46d5f3f352e651b7400d83fcb3711cfe37af6d9cd3337fe84b73`.
- Member `agent23-selected-joint-v2-native-52arm.json`, uncompressed JSON SHA256 `e7f7fa2a104585cedc3e7d0e1df7491b9a1e9d32eb0cbaf906a1c2b4a2b366e9`. Input is the **original preserved artifact**; no rerun or reparsing of console-only summary substituted for individual native rows.
- Selected manifest Git blob `8cd0c4b0734d3223d5c8c1f705f3af651f815c02`, original joint-v1 92-option policy as baseline, symmetric selected-v2 adds source- and candidate-owner Battle VIP Pass after otherwise-selected Pass. Underlying Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both candidate fixed sixties and original source ranks **5, 11, 6** unchanged.
- **52 real attempted native Store rows**, 26 candidate/source contexts (13 physical source seed groups, both candidate sixties, both modes). Three seed groups were freshly preregistered, while prior studied roots remain developmental replays.

## Independently verified action-chain comparison

Load the two `modes[].native.rows` arrays, join by `trial.id` (26 unique contexts per mode), and compare the full `rootActionLedger` ordered records on the **same registered source and candidate** in control versus selected. Compare the literal fields `actionOrdinal`, `playerSlot`, `turnBefore`, `turnAfter`, `action`, `card`, `attack`, `ability`, `attackChoice`, `pendingPrompt`, and `initiatingRootActionOrdinal` at each index. Exclude only `actorPolicyDecisionOrdinal` as an attribution-only field. A comparison stops at the first different record; later events may change for many reasons.

| Class | Source/candidate policy contexts | Native observation |
| --- | ---: | --- |
| Entire ordered root ledgers identical | **12** | Both modes made exactly the same full recorded native action sequence |
| First difference is selected Battle VIP Pass where control Passed | **13** | At the same physical player slot, action ordinal and root turn, `PassTurnAction` became `PlayCardAction` for `Battle VIP Pass` |
| Native abort with recovered custody and matching ledger prefix | **1** | Both modes aborted at **43 actions** with `UseAbilityAction: UNKNOWN_POWER`; the independently retained `nativeAbortEvidence` includes the **same source fingerprint and identical 43-action ledger** in both arms |
| **Total** | **26** | All 26 source fingerprints match when the abort sidecar is included; the engine error still prohibits full-game qualification |

Among the 13 genuine first divergences, **eight first changed on the original source's turn and five first changed on the candidate's turn**. The additional abort sidecar also has identical accepted actions until the failure. No comparable pair first diverged through an unrelated action. The actor role was identified using `rootActionLedger[].playerSlot` against that **same row's** `sourceSeat`, rather than assuming physical A or B always belongs to the original source.

Across the selected policy's native ledgers there were **20** total `Battle VIP Pass` plays: **12 by original-source players and eight by candidate players**. The control-policy ledgers contained **one** actual VIP play (by the candidate) despite its absence of the selected after-Pass mechanism. Thus do **not** equate all selected VIP plays with incremental interventions or treat every copied attack as caused by a source player's own VIP. The source-only `sourceVipCount` summary consistently reports the selected-mode **12** and control-mode **0**.

The archived selected `sourceCopiedAttackChoices.selectedGenesectTechnoBlast` sums are **32** for source rank 5 versus **19** in the control, exactly matching CI's source summary. The paired difference is **+13 copied-attack selections on these particular mixed exposed/fresh conditions**, not a game-win estimate or a guarantee of a favorable marginal effect on future deals.

## Failed reporter gate and recovered abort-sidecar evidence

**Correction from a deeper read of the same untouched original ZIP:** the release's top-level `matchedSourcePhysicalDeals=25/26` and `allControlsMatched=false` remain the actual reporter status, but the native-abort sidecar **does preserve the 26th source fingerprint and the 43 accepted actions preceding failure**. The affected context is fresh rank-6 **`6:300:A:champion-reference`**, seed **3738819225**; both modes fail `UseAbilityAction: UNKNOWN_POWER` on action ordinal 43, acting seat 0, global turn 8. In **both** `modes[].native.rows[].nativeAbortEvidence.sourceDealFingerprint`, the original source is seat 1 and SHA256 is **`1180bb8d34c5364ce202e23f94eebc5e3c0d83381b85bc2991ba1e002f70a0a7`**. Both abort evidence records also store a **43-action identical `rootActionLedger`**, independently reporting the same digest **`75c90e10e1178b30a2579cfa689498b4f3e6a65389883ed615662fadec8edf97`** and matching setup-first-seat evidence. Thus **26/26 original source physical fingerprints match across the two modes when the abort sidecar is included**. The official aggregator still correctly fails its top-level gate because this aborted arm lacks normal completed-row fields; a recovered prefix is not a full settled native match. These are within-candidate *mode* comparisons; never relabel them as cross-candidate original-source deal matches.

Native dispositions, preserved without filtering:

| Mode | Engine terminal | 260-root action cap | Native abort |
| --- | ---: | ---: | ---: |
| Joint-v1 control | 11 | 14 | 1 |
| Selected-v2 | 16 | 9 | 1 |

No native terminal is admitted as a paper-competitive game. Actual native damage, paper costs, source competence, tactically capable opponent continuation, owner-only information discipline, and the official match clock retain their independent vetoes. Agent4 has separately identified the unselected Secret Box category-search legality guard; payment acceptance alone does not certify the later trainer-category selection. These unrelated paper-qualification issues are **not** answered by first-action divergence.

## Independently audited cross-candidate physical comparability

The previous **26/26** restored identity statement compares the same *candidate* roster under the control/selected modes. For actual **champion-reference versus New Moon** comparisons, group the 26 rows into **13 distinct original-rank/repeat/candidate-seat/seed groups**, then compare the original-source physical SHA across the two *different* candidate roster arms, separately in each mode. Recover the rank-6 aborted champion digest from its native-abort sidecar.

- **12/13 cross-candidate original-source physical pairs match** in the joint-v1 baseline, and the **same 12/13** match in selected-v2.
- The **sole mismatch** is the historical rank5 group **`rank=5, repeat=101, candidateSlot=A, seed=198157155`**. Against champion, the original source fingerprint is `7ca732f19dcd4bc26e2cd0ff984b31a47392c5d6276f3e22daaab608a3099c39`; against New Moon it is `59409becd35dafc9e61ce9d91f66883d76afd7b5685a1b9d2114b68c26878c61`. The fingerprint difference is the same under both policy modes. The identical numeric seed therefore does **not** support a same-source-physical-deal candidate comparison for that group.
- **All three fresh seed groups** have matching source setups across their two candidate sixties in both modes, *including* rank6 fresh seed 3738819225 after recovering the abort-sidecar digest. Rank6 nevertheless retains an engine abort and no competitive certification.

**Comparison hierarchy:** source-deal equality across *modes* under a fixed candidate: **26/26 fingerprints retrievable**; source-deal equality across *different candidates* under a fixed mode: **12/13 pairs**. Neither figure certifies full-game parity after a policy divergence or satisfactory independent opponent choices.

## Crucial fresh source-deal counterexample

In the **fresh** original-rank-5 source seed **1399343237**, candidate physical A / **New Moon** context `5:300:A:new-moon-lockbreaker-v1`, the first difference at global turn 2 is a **candidate** Battle VIP Pass replacing candidate Pass. The **original source played zero VIP in both modes**, yet its later native Genesect Techno Blast copy selections rose **2 to 4**. The champion-reference context under that same registered source seed produced zero Techno Blast selections in either mode, with identical control/selected action ledgers. Therefore an observed increase in **original-source attacks** can be downstream of an action selected by the **candidate-side** policy. Source-only treatment attribution would be invalid in this genuinely symmetric policy, even with an exact same-source-deal within-candidate comparison.

Of the **six fresh candidate contexts**, three had identical complete ledgers, two first diverged at a candidate VIP, and the sixth had an **identical 43-action prefix preserved in abort sidecar data** before both modes reached the same native error. The fresh rank-11 New Moon context's candidate-side VIP also altered its subsequent native sequence without establishing a qualified attack or win. The fresh rank-6 New Moon context was fully identical in both modes.

## Decision, follow-through and limits

**Retain selected-v2 as a mechanistic developmental comparison.** The first-divergence audit supports that its early action intervention activated where expected in 13 full contexts and recovers the 26th pair's equal opening fingerprints and identical 43-action prefix, while preserving the official failed release gate. It cannot validate later effect causality, card-payment fidelity, paper legality, source or candidate intelligence, or a final deck choice.

Recommended to the current integration steward: preserve this artifact unchanged; repair or isolate the **fresh rank-6 `UNKNOWN_POWER`** engine abort as its own acceptance gate; consider exposing abort-sidecar source-deal and prefix comparisons distinctly from normal completed-row admission; when reporting rank-5 offense, distinguish **source-owned VIP roots from candidate-owned VIP roots** and independently verify paid search/prompt/effect/Prize/meaningful reply. A future selected release should include Secret Box's four-category search validation or explicitly veto paper certification for encountered Box searches. Keep original rank5/11/6 control failures and entire nonterminal denominator.

**Global status:** 29 authentic original Top32 sixties, ranks 23/25/28 missing; no demonstrated best fixed 60, zero paper-competitively qualified games, and no demonstrated 99.5% benchmark.
