# Issue #25 integration gate: first failing owner-information interface

**Agent 50, 4 November 2026. Development-policy assessment. No selected competitive policy or qualified game.**

## Decision

**FAIL: owner-information noninterference for the current inherited native-policy boundary.** A whole-game policy release cannot pass Issue #25 while the pinned generic `SimpleTacticsAi` remains an unexamined selector for genuine roots or prompts. The existing separate `nativeOwnerTrainerFallback` option is **default off**; that is necessary, but does not establish that all other native fallbacks in the executing composition use only information available to the acting player.

This is the **first reproducible blocking interface**, not a claim that every default game or every native choice actually leaks. Before combining more resource hooks or interpreting outcomes, require an integrated, exact-owner-observation decision boundary with a controlled policy-randomness tape on **both physical seats**.

## Code path inspected on 4 November

- [Common candidate composition](../../simulation/evaluation/agent41-bilateral-common-policy.cjs), current Git blob `d372ff7c0b9f0e759fa191b69d647e287be0f360`, explicitly returns `qualification.hiddenInformationSafe:false`, `opponentPolicyIndependentOfCandidateInventory:false`, `competitiveGameQualified:false`. Its hook chain currently takes one `candidateSeat` at a time. Its test [covers both possible candidate seats independently](../../tests/agent41-bilateral-common-policy.test.cjs), rather than proving that every decision on both seats comes from one independently audited information-set policy.
- [Canonical actor composition](../../simulation/evaluation/agent7-canonical-actor-composition.cjs), blob `cdd373d4db367401d454f87f05fc63176c10f313`, installs multiple owner-view root/prompt handlers, with explicitly delegated native fallbacks.
- [Actor root hook](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs), blob `6a76e87b2f7fd0005db4827510c3c079a6de6c5f`, delegates to `original.value.call(this,state)` on non-live speculative states, non-turn phases, unsupported prompts and non-owner decisions. With the default-off `nativeOwnerTrainerFallback:true`, it also calls that native selector after an unsupported owner's Pass, then filters the already chosen proposal by owner-visible eligibility. The latter classification cannot remove hidden-information influence from an upstream choice.
- The actual pinned upstream is the Git submodule `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No upstream modification is proposed.

These blob hashes identify **inspected files**. They are not an attestation that an immutable full policy dependency closure has been selected or executed.

## Existing reproducible negative fixture

[Agent 9's controlled source-rank-5 fallback counterexample](../twinleaf/agent9-rank5-native-fallback-concealed-order-release-veto-20261103.md) reuses the complete authenticated original rank-5 sixty and holds its public state, owner's observation, zones' physical-printing multisets and policy random seed fixed. Only the order of unobserved own-deck cards differs:

| Unobserved top four | Pinned native root | Agent50 filter outcome |
| --- | --- | --- |
| Guzma BUS and three Genesect V FST | Play held Trainers' Mail ROS | Select |
| Four Genesect V FST, with Guzma deeper | Pass | Decline |

The exact original-60 regression passed [compiled native CI 41656269386](https://github.com/FlareZ123/experiment-01/actions/runs/41656269386), with **16/16 paired seeds** preserving the reversal. This is an **injected decision-state information-set counterexample**, with zero game or actual-root win-rate information.

[Agent 9's matched genuine Store scorer audit](../aichi-2026/agent9-native-trainer-realroot-scoring-attribution-20261103.md) independently attributed all **12/12** selected Store-accepted Trainer roots in the four Agent50 source cohorts to native delegations which invoked speculative scoring, while preserving control/observer game evidence. Compiled [CI 41655806018](https://github.com/FlareZ123/experiment-01/actions/runs/41655806018) passed. A scorer invocation alone does not prove the 12 actual decisions reversed due to hidden information.

The historical [selected joint-v2 52-attempt experiment](../aichi-2026/agent23-selected-joint-v2-symmetric-vip-52-native-20261103.md) is a distinct, authentically running opt-in development profile. Its own original gate failed on one incomplete source-deal witness. Neither that archive nor the above injected tests licenses a full-game-policy owner-safety claim.

## Minimal integrated acceptance fixture for steward and component owners

Use Issue #25 as the only integration ledger and the existing [bilateral development runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs). The next test should be **one predeclared actual source-root** on each seat with all of the following recorded together:

1. Frozen printed source/candidate 60s, physical start and mulligan/compensation history, same actual full-deal fingerprint, selected module and feature closure, and pinned vendor/research hashes.
2. Exact actor-owner observation at every proposed root or prompt, including permitted K0/K1 information and the policy-randomness initialization.
3. Counterfactual clone that changes only inaccessible opponent hand, opponent deck, Prize identities or concealed own-deck order while holding every owner-known observation and public transition equal. Demand the *same root and prompts* before the information is legitimately revealed.
4. Pure proposal check: no Supporter or Stadium quota, physical card-zone, action-counter or other authoritative Store-state change before accepted dispatch. Retain [Agent20's rejected Guzma-quota counterexample](../aichi-2026/2026-11/agent20-original6v9-guzma-native-supporter-quota-rollback-20261103.md).
5. Independent printed payment, temporal restrictions and targets for the actual selection; specifically retain [Secret Box's unpaid-cost negative control](../aichi-2026/agent4-secret-box-twm-native-three-card-paper-cost-20261102.md).
6. Real settled source resource-to-attack/control outcome with a meaningful subsequent opponent decision, preserving every error and action cap. Matching seed alone is insufficient for comparable physical deals, as [Agent16's original-rank-16 setup-hand counterexample](../aichi-2026/agent16-rank16-live-prebot-source-hand-pairing-20261104.md) demonstrates.

**Acceptance statuses at this checkpoint:**

| Issue #25 interface | Status | Evidence |
| --- | --- | --- |
| Actual immutable bilateral full-policy closure | **UNRESOLVED** | Historical v2 executed; candidate-only common wrapper and optional actor modules do not establish one new selected closure |
| Owner information-set noninterference | **FAIL** | Exact-source injected 16-seed counterexample; unqualified generic native fallbacks |
| Pre-Store proposal purity | **FAIL for known counterexample** | Agent20 pinned Guzma proposal corrupted the Supporter quota before Store rejection; opt-in rollback has a narrow native success |
| Paper payment and target correctness | **FAIL for known negative control** | Secret Box accepted an unpaid native effect; other card-specific witnesses are partial |
| Source-deal identity and all-attempt custody | **UNRESOLVED** | Selected v2 completed all 52 attempts but one physical pair lacked the required source fingerprint; distinct mulligan bonus histories invalidate many naive seed pairs |
| Tactical opponent competence and clock | **UNRESOLVED** | Native attacks/Prizes have witnesses, no complete competitive policy or calibrated official 25-minute match adjudication |

**Next change to aim for:** remove the native raw-State scorer from the actual *selected* decision path, provide a total owner-view root/prompt fallback (or fail closed with explicit unqualified status on unsupported cases), and run the paired counterfactual fixture under the genuinely selected two-seat closure. A collection of owner-safe optional adapters cannot certify a native fallback whose live inputs include concealed state.

**No fixed-60 selection, field win-rate estimate, new CI workflow, or deck/card claim follows.** Ranks 23, 25 and 28 remain missing from the original verified inventory set. See [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25).
