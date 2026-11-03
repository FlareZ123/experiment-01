# Original rank5/rank11 source: all 12 native fallback Trainer selections invoked speculative tactic scoring

**Agent 9 | 3 November 2026 | compiled real Store scoring census | zero qualified competitive games**

## Decision question

[Agent 50's registered generic native Trainer A/B/A development](agent50-generic-native-trainer-aba-20261103.md) proved **12 accepted Trainer roots** over four source physical cohorts of original rank-5 Mew/Genesect against original rank-11 Mega Absol/Garbodor. The fallback chooses a raw full-State `SimpleTacticsAi.decodeNextAction` candidate **before** checking its card metadata, payment and public constraints. The pinned upstream scorer can evaluate speculative game states and hidden future cards, as independently established by the [hidden-order leak investigation](../twinleaf/hidden-order-policy-leak.md).

The missing issue was whether this speculative scorer was even **invoked** at those actual 12 accepted source roots. The default canonical actor's four historical exploratory roots gave zero scorer evaluations. A synthetic hidden-order reversal alone does not prove that the real registered fallback actions used that mechanism.

## Paired matched-source observable scorer census

The [read-only observer](../../simulation/twinleaf/agent9-native-trainer-score-observer.cjs) temporarily wraps pinned `SimpleTactic.prototype.evaluateAction` and `getStateScore`, plus the native `SimpleTacticsAi.decodeNextAction`, while a genuine headless Store match executes. It identifies only **actual live game State object identity**, owner seat/turn, and absence of unresolved prompts. It never reads owner's concealed deck or opponent's hand. It restores every prototype descriptor even on failure. The `actorObservation` is obtained only **after** the native delegation and used for identifying the public root. It cannot affect the native action or its scoring inputs.

The [reproduction runner](../../simulation/twinleaf/agent9-native-trainer-realroot-score-census.cjs) reuses the unchanged [Agent50 source registration](registrations/agent50-owner-native-trainer-fallback-v1-20261103.json), original printed rank5/11 source 60s and original four physical seed/seat groups. Each source group runs **baseline treated**, then **identical treated with observer**. The runner asserts deep equality of the **entire recorded game evidence** between each pair: source full-deal fingerprint, deck hashes, root ledger, decision trace, native terminal/capped status, and fallback summary. The observer only counts method invocations. There are **8 actual original source Store attempts**, paired into four physical cohorts; repeats and matched pairs are **not independent games**.

To connect scorer use to actual selected, accepted Trainer roots, [receipt correlation](../../tests/agent9-native-trainer-scorer-attribution.test.cjs) requires an exact one-to-one match in **owner seat + live global turn + owner hand index + printed held Trainer name + native `PlayCardAction` class**. Duplicate matches or missing records are flagged ambiguous and cannot be counted as scorer-positive merely by guessing. Nonaccepted native calls are kept in the raw audit. The correlation unit tests include a fully scored match, a zero-scored match, a repeated-proposal ambiguity, and a missing-proposal ambiguity.

## Confirmed compiled results

**[GitHub Actions CI run 41655806018](https://github.com/FlareZ123/experiment-01/actions/runs/41655806018)** completed **success**, source commit `e10eba4fa8de72f085322c570462a1a0cc2dbb1c`, with downloadable raw audit [artifact 13240540576](https://github.com/FlareZ123/experiment-01/actions/runs/41655806018/artifacts/13240540576), artifact digest `sha256:78037c591cf215ffee84d8fb90b7176a5c5126d2da89e48ef95fc6d184363581`.

| Original-source observed quantity | Measured count |
| --- | ---: |
| Registered independent physical source seed/seat groups | **4** |
| Paired headless Store attempts | **8** |
| Full baseline-vs-observer game evidence equal | **4 / 4 pairs** |
| Actual owner-root native delegations through the wrapper | **47** |
| Native root delegations invoking at least one `SimpleTactic` scoring method | **22** |
| Native root delegations with zero such invocations | **25** |
| Native `evaluateAction` method invocations | **109** |
| Native `getStateScore` method invocations | **85** |
| Exact original fallback Trainer Store acceptances | **12** |
| Accepted Trainer receipts matched uniquely to a native scoring root | **12 / 12** |
| Those accepted Trainer roots that invoked scoring | **12 / 12** |
| Those accepted Trainer roots that did not invoke scoring | **0 / 12** |
| Ambiguous or unmatched accepted Trainer scorer receipts | **0** |
| Competitively paper-qualified games | **0** |

CI stdout:

```text
AGENT9_NATIVE_REALROOT_SCORER {"cohorts":4,"pairedArms":8,"authenticDelegations":47,"nativeAcceptedTrainers":12,"acceptedWithScoring":12,"acceptedWithoutScoring":0,"acceptedAmbiguous":0,"scorerRootCount":22,"scoreCalls":85,"evaluateCalls":109,"provenanceParities":true}
```

The earlier initial compiled [run 41654666246](https://github.com/FlareZ123/experiment-01/actions/runs/41654666246), source revision `3c43adcbb1a1d555cf1d0a9d8e66917867e8ac50`, had the same 47/22/109/85/12 totals and full game parity but had not yet joined accepted receipts to scoring calls. The later receipt-correlator version makes the 12-of-12 attribution independently testable.

## Proper inference and release recommendation

**Established:** The default-off experimental fallback's **actual 12 registered source Trainer actions** were all chosen by a raw native proposal mechanism that did invoke hypothetical-action tactic scoring, which can have access to concealed game information. The fallback's owner/public eligibility screen has no information-theoretic mechanism to undo such hidden influence. The separate [rank-5 exact printed-sixty injected-state reversal](../twinleaf/agent9-rank5-native-fallback-concealed-order-release-veto-20261103.md) confirms the vulnerability is actionable by the proposer on a matched synthetic source inventory. (A later matched seeded-policy-RNG tape test was in progress when this report was written.)

**Not established:** Whether any one of the 12 *particular* naturally reached source-root decisions would reverse under a counterfactual concealed-deck permutation and identical owner-visible K0/K1 knowledge; whether its action was paper legal and could pay required resources; correct prompt search/recipient custody; game win improvement; an independent opponent policy; or any aggregate competitive rate. A scoring method can be invoked even when its output does not change the final chosen action.

**Action:** Retain `nativeOwnerTrainerFallback:false` in the selected/common release profile. Replace upstream raw proposal with owner-visible information-set-only action selection. Then independently validate native real Store payment, prompt resolution, deterministic source-deal/revealed-top counterfactual parity and consequences on both symmetric seats before considering the Trainer family a competitive improvement.

**Field target remains:** original 29/32 complete published opponent sixties, ranks 23/25/28 unavailable; no selected single fixed 60; no 99.5% attainment.
