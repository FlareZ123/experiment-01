# Agent 3: selected v8 KO-to-physical-Prize custody, root-scoped provenance

**6 November 2026. Developmental native Store evidence only.** This is the first replay of Agent 3's same-Store `KnockOutEffect` to `ChoosePrizePrompt` to exact selected physical Prize observer over the **currently selected shared v8 developmental common policy**. Previous v18 native evidence used a distinct retrospective v14 setup. The selected v8 gameplay policy, original printed 60-card sources, seed registration, and 128-root horizon remained unchanged. No competitive game or deck strength was certified.

## Registered experiment and two independent native executions

- Fixed registration: `results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json`. Exactly eight original attempts, rank 6/11/1/3 sources, two fixed contender 60s. Registration hash and exact original attempt IDs matched in both archives.
- Frozen executing policy: `simulation/evaluation/agent36-issue25-common-v8.cjs` calling `runStewardBroaderV8()`; observer wraps the runner passively. Original physical-deal and outcome receipts are retained unchanged.
- Pinned Twinleaf submodule: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- First native run using historical observer v2: [successful CI 42306987480](https://github.com/FlareZ123/experiment-01/actions/runs/42306987480), checkout `ab75b337fd362402f181e43763e33fdd4afedc95`; [artifact 13547115858](https://github.com/FlareZ123/experiment-01/actions/runs/42306987480/artifacts/13547115858). Artifact ZIP SHA-256 `3336d945183899b813cc7bd54768c92cfd534e6edfc70fffa6e9cfb89914a6fc`; v19 JSON SHA-256 `358abefbaeb6404ebb8c7339a70832d9e69a33075583597fc136ee251d7adb08`.
- Second native run using root-scoped observer v3: [successful CI 42307396303](https://github.com/FlareZ123/experiment-01/actions/runs/42307396303), checkout `5616a7e64eeb52550e9850a8cc0e3e685ead1b7a`; [artifact 13547291285](https://github.com/FlareZ123/experiment-01/actions/runs/42307396303/artifacts/13547291285). Artifact ZIP SHA-256 `f696db0c22f466687215d12c7aa5094fbd7e5b92aee2a7c08c7e3cbd9b40d99b`; v19 JSON SHA-256 `995445c15c97aaa09a6a00e351a0df75fce0b9c7e8df39240ac726377578c7d4`.
- The new v3 observer code is `simulation/twinleaf/agent3-ko-source-prompt-physical-v3.cjs` (SHA-256 `7b309cb7f99057c7eb84566a429aacbcde955d7549356b2a8d71b1454f56bc76`). Both-seat pure regressions: `tests/agent3-ko-source-prompt-physical-v3.test.cjs`. The unchanged v2 observer and tests remain for reproducibility. Both native runs used `tests/agent3-issue25-v19-v8-ko-source-physical.native.test.cjs` under the pre-existing manual-only Agent50 workflow flag `issue25_v14_only`. No workflow was introduced that runs on ordinary pushes.

## Read-only observations

| Source or custody gate | Native v2 | Native root-scoped v3 |
| --- | ---: | ---: |
| Registered original attempts | 8 | 8 |
| Real Store sessions identified via AddPlayerAction | 8 | 8 |
| Eligible Store KnockOutEffect candidates | 6 | 6 |
| Same-root KO-associated Prize prompt creations | 6 | 6 |
| Prompt answers settled in Store | 6 | 6 |
| Exact selected Prize objects physically moved to taking owner's hand | 8 objects | 8 objects |
| Prompt selections of two objects | 2 | 2 |
| Unresolved/rejected selections | 0 | 0 |
| Lost Zone or unverified physical destinations | 0 | 0 |
| Unjoined KO events expired at real Store root completion | Untracked | 0 |
| Native terminal games | 0 | 0 |
| Paper-qualified games | 0 | 0 |

**A six-prompt count is a count of selection events, not card objects.** Six prompt records selected eight individual Prize-card objects. In v3, two prompts selected two cards each. Four prompts arose in seat 1 and two in seat 0. Five Store sessions had at least one joined prompt. Both observers' complete six source-physical record tuples matched exactly, as did the eight original attempt dispositions and registration IDs/hash.

| Source rank | Champion reference fixed 60 | New Moon Lockbreaker fixed 60 |
| --- | --- | --- |
| 6 | Root cap, 128 actions | Engine error, 118 roots |
| 11 | Root cap, 128 actions | Engine error, 88 roots |
| 1 | Engine error, 98 roots | Root cap, 128 actions |
| 3 | Engine error, 106 roots | Engine error, 93 roots |

Session ordinals from the passive observer have **not** been independently joined to a unique registered trial ID. Treat the six prompt records as a valid eight-session aggregate, without assigning individual prompt records to specific matchups. Native root errors, caps and unqualified end conditions remain in the denominator; no win percentage follows from these events.

## Synthetic counterexample and fail-closed correction

Historical v2 retained unconsumed KO event records in a Store-level pending array across later `dispatch` roots. A prior root containing `KnockOutEffect` without a prompt could therefore give a later unrelated `ChoosePrizePrompt` the same recipient/destination/count and create a **false KO correlation**. This is a concrete possibility derived from the v2 observer implementation, demonstrated by a new synthetic both-seat `OrphanKoAction` followed by an unrelated next-root Prize prompt. It is **not evidence that any observed v8 event was incorrectly attributed**.

Observer v3 now expires pending KO records at the end of the outermost same-Store dispatch. The new negative tests assert that each unjoined event is counted as expired and that the later Prize prompt stays unrelated; existing real same-root matching, physical card custody, speculative Store exclusion and exception restoration tests still pass. In the actual selected v8 native replay, v3 counted **zero expired candidates** and preserved every v2 match and physical Prize record.

## Remaining qualification boundaries

The observer infers the live Store from the Store receiving `AddPlayerAction`. It has no authoritative unique game-session token, and `uniqueCheckStateOriginCertified=false` remains correct: matching a KO candidate and prompt by recipient/destination/count inside one root is not a proof that this precise checkState call generated the prompt. Prompt-free automatic KO Prize taking is outside this observer's denominator. The original native runner is still vulnerable to paper-legality and opponent-policy gaps; clock and adjudication remain unimplemented for competitive qualification.

**Research disposition:** v3 is a stricter passive audit that leaves the historical selected v8 attempt outcomes unchanged. The genuine, narrow result is six matching native Prize selections with eight exact card-object transfers under eight development trials. It supports instrumentation and source-custody traceability. It does not establish opponent competence, paper-game fidelity, a preferred fixed 60-card deck, or any progress claim toward 99.5% in qualified match play.

Next: have the shared-policy steward integrate the v3 root-scoped observer into future prospectively registered releases, add an engine-origin token and exact session-to-trial binding, and resolve full-game source attack/opponent continuation. Avoid reclassifying these eight historical attempt outcomes as wins.
