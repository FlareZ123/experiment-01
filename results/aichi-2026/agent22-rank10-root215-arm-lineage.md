# Rank-10 root 215: historical policy-arm identity and reconstruction gate

**Agent 22, 18 October 2026.** Evidence class: code-path provenance and historical compiled source fixtures. **Historical root215 restored in compiled CI 39110044974.** This is not a competitive-game result.

## Apparent contradiction

- The old Copycat/Shred reports place a `RetreatAction` at root Store ordinal **215**, global **turn 28**, champion physical seat **B**, seed `4246551499`.
- Agent 50's [18 October compiled source reconstruction](../../results/twinleaf/agent50-rank10-live-hidden-order-probe.md), with archived `DoubleDragonAttachTactic-v3-archive`, instead found a `PlayCardAction` at root **215**, global **turn 29**.

Both can be true, because their policy arms differ.

## Source-level cause

The original `simulation/twinleaf/rank10-source-branch-transcript.cjs` has an unmodified v3 **control** (`common`) and an explicit **Timeless intervention** (`branchRequest`). The latter adds exactly three options:

```js
mimikyuApexTimelessPolicy: true,
mimikyuApexTimelessPolicySeat: 1,
mimikyuTurn27SetupSeat: 1
```

The [16 October source-dealt turn-27 branch](agent22-rank10-live-copycat-fork.md) compiled at head `243a600c63d1f54511c32e04db75082ca57dad88`. It uses Mimikyu's Copycat to select Timeless-GX, granting the same player a subsequent turn. `simulation/twinleaf/rank10-mimikyu-shred-source-fork.cjs` starts from this **intervention configuration**, then tests whether the bot ought to Retreat or use Copycat/Shred on turn 28. `simulation/twinleaf/rank10-turn28-bot-fingerprint.cjs` similarly explicitly enables the three flags. [Compiled CI 39005718717](https://github.com/FlareZ123/experiment-01/actions/runs/39005718717) and [39006077523](https://github.com/FlareZ123/experiment-01/actions/runs/39006077523) supported the historical turn28 Retreat observation, subject to the documented source-policy and rules limits.

The newer `rank10-hidden-order-live-probe.cjs` initially used archived v3 Double Dragon **without those three flags**. This reconstructs the control arm, whose action 215 does not have to match the turn-28 intervention arm. The archived DDE tactic's implementation is retained at `simulation/twinleaf/dde-attach-tactic-v3-archive.cjs`; the missing policy-arm identity, independently of that tactic, already invalidates a direct ordinal comparison.

## Correction and intended falsification

- Changed `sourcePolicyForOrdinal(215)` to select historical v3 DDE **plus all three Timeless-branch flags**. The default current-v4 root15 probe remains unchanged.
- Changed the archived hidden-order decision target to turn **28** and asserted that the actual root decision is `RetreatAction`, matching the historical branch expectation.
- Updated `tests/rank10-hidden-order-policy-profile.test.cjs` to pin the complete object, rather than checking only DDE version.
- Manually dispatched existing no-per-commit `twinleaf-hidden-information.yml` [run 39110044974](https://github.com/FlareZ123/experiment-01/actions/runs/39110044974), head `bc4743f7`. **The complete workflow passed: compiled root215 is turn28 Retreat (player 202, benchIndex1)**. A pure profile test cannot prove source-action prefix restoration.

If the compiled root action differs, classify it as a **remaining historical replay mismatch**, collect earliest root action/prompt prefix divergence and relevant options, and do not silently redefine the target event.

## Compiled verification

[Manual CI 39110044974](https://github.com/FlareZ123/experiment-01/actions/runs/39110044974) completed successfully at `bc4743f7c9277827b2d11a68e1dc4384abe66754`, after compiling the pinned Twinleaf source and passing both historical-profile regression and source game.

At global **turn 28**, root dispatch **215**, physical champion seat **1**, the authentic Store action was `RetreatAction` with actor ID **202**, bench index **1**. There were **22 remaining own deck cards**, and **four** prior own deck search prompts were recorded, latest at root185 on turn27. Equal-seeded detached policies on physical and reversed remaining deck order chose the identical Retreat action, `actionSensitiveToHiddenDeckOrder:false`. The untouched live State graph digest before and after the probe was `955530f42ee54b2dcca44485239156e69201833781a6c5d1e88b3e5db2ab3e19`; the instrumented and uninstrumented `runMatch` return values matched exactly.

The repaired experiment demonstrates that restoring the **Timeless intervention arm** restores the historic source event; the prior turn29 PlayCard belonged to the unmodified v3 control arm. The hidden-order result tests only one reversed permutation, one seed, and one action, after previous search history. A full 215-step old-vs-new source prefix equality comparison is still desirable. Neither bot-policy competence nor competitive game qualification is established. 

**Second compiled confirmation:** [CI 39110786334](https://github.com/FlareZ123/experiment-01/actions/runs/39110786334) passed. The restored historical root215 pre-dispatch physical zone digest `5a27a7fa4d3e9cbef465675b05cf2270f0550851f4cc579940a551c3ade70b4d` exactly matches the archived Agent7 historical fork at the same decision. The source-zone hash implementation is unchanged across revisions. This establishes partial physical State equivalence, with closure and full input replay still unqualified. Follow-up assertion added in commit `a98286b3`.

## Scope

A restored historical root215 would establish that one original **policy arm** is again observable. The proposed detached hidden-deck reversal would test one policy action under one opaque permutation; it cannot prove decision competence, full information-set safety, source-engine/paper-rules fidelity, multi-seed performance, or the 99.5% full-field goal. **Competitive-qualified games: zero.** Exactly 29 of 32 Aichi decklists are source-verified, with ranks 23, 25, and 28 still missing.
