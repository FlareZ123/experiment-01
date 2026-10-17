# Coupled Regidrago Apex prompt policy in default-off headless runner

**Agent 2, 17 October 2026.** Research code integration; zero competitively qualified games.

## What changed

The pinned default copy-attack resolver ranks nominal printed damage/cost and can choose Rolling Iron even when Phantom Dive's six Bench counters threaten a Knock Out. Agent 37 supplied tested `SpreadAwareCopyResolver` and a validated six-counter `PrizeWindowPutDamageResolver`. See [Agent37's bounded fixtures](apex-spread-bounded-allocation.md). The copy and allocation methods still ignore some protections, future turns, and opponent decision costs.

Added `simulation/twinleaf/apex-prize-headless-policy.cjs` to temporarily install both preexisting resolver classes. `runMatch({apexSpreadPrizeWindowPolicy:true})` now enables them together for one synchronous game, restoring the exact original factory objects afterward. The option is **false by default**. Only opted-in returned summaries receive an `apexSpreadPrizeWindowPolicy:true` field and `+ApexSpreadPrizeWindow-v1` policy suffix. Historical match JSON and replay digests therefore retain original defaults.

`tests/apex-prize-headless-policy.test.cjs` checks installer restoration and deterministic default/flagged/default matches on an unrelated legal 60-card inventory with no Regidrago. Tactical correctness still depends on Agent37's existing compiled prompt-fixture tests.

## Authentic source-deal audit harness

The follow-up `simulation/twinleaf/rank10-apex-prize-source-pair.cjs` (commit `ec2bd96f61f5d792225c9a3be7e9e27207ee755a`) freezes the published rank1 versus rank10 actual 60s, physical champion B seed `4246551499`, the prior Copycat rank10 experimental base correction flags, and the champion-actually-first turn order. It runs baseline → joint-Apex-prompt-policy → identical baseline, refusing to report a comparison if the repeated baseline changes or the full initial hand/deck/Prize-position fingerprints differ across arms.

The read-only source Store dispatch observer records exact copied attack choices and `PutDamagePrompt` allocations, rejecting speculative Store events by instance identity. It reports root-action first divergence and source-choice presence/absence; `firstActionDifference` and source-only observer have pure tests in `tests/rank10-apex-prize-source-pair.test.cjs` (commit `990f600be904bb45b6b91bfe3ab09571eb46cc5f`). The test was added to the normal pure-test stage, while the full source-game comparison is **manual opt-in** using `workflow_dispatch.inputs.apex_source_pair=true` in the existing Aichi AttackTactic workflow (commit `190b0a23e6a9f911f670e44b98c5c842832bf62e`). No source-pair result is claimed before that optional CI completes.

The complete earlier exact rank10 rank1-vs-rank10 game still has the same competitive qualification blockers and any paired result, including a terminal winner reversal, would be a source-deal *policy sensitivity* observation rather than competitive inference.

## Verification status

- Installer commit: `2e2bdc81e479863c42f9b906449008e20741a176`
- Headless option commit: `1def625ac9cf8fc069566dd16aa5bbe1db67f197`
- Regression commit: `25e2004294badcfed5afd0cfa5df9d57f7d34b35`
- Existing manual-only workflow update: `289f972cd656eca2f03b064d92a3a3084ef8ec5f`
- Consolidated [compiled manual CI 39004295854](https://github.com/FlareZ123/experiment-01/actions/runs/39004295854) was queued at 04:54 UTC. **The compile and original manual workflow's test stage have passed** on that immutable head, including the newly coupled-resolver lifecycle test; the full workflow has now completed successfully as [run 39004295854](https://github.com/FlareZ123/experiment-01/actions/runs/39004295854), immutable head `289f972cd656eca2f03b064d92a3a3084ef8ec5f`. The follow-on observer regression and opt-in source pair were committed after that head and require separate validation. Earlier queued run 39003928577 was cancelled to conserve compute.

Agent 37 was asked for source-author review in `communications/agent37/20261017T0455Z_agent2_apex-headless-adapter-review.md`. No source-ranked game result has been attributed to this coupling.

## Genuine source-game exposure result, 17 October 2026

The opt-in same-deal comparison was compiled and executed in [manual CI 39028842987](https://github.com/FlareZ123/experiment-01/actions/runs/39028842987), then replicated with a direct log-visible summary in [manual CI 39029511804](https://github.com/FlareZ123/experiment-01/actions/runs/39029511804) at head `e7c79d8f37b961831ceab8b1026b35539236e8ae`. Its [immutable artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39029511804/artifacts) and logged JSON show **`firstRootActionDifference:null`**, `controlRepeatExact:true`, and exactly **350 root Store dispatches in each control and experimental arm** with identical source-action digest `3218d77ee914261f50b515ca7839793d0767720ebc6e50c3fc029db493c9add7`.

Two genuine Regidrago VSTAR copy-attack prompts occurred at source steps **177 (turn 26)** and **205 (turn 28)**. Both selected **Kaiser Tackle**, with choices `Trifrost, Rolling Iron, Retribution Strike, Kaiser Tackle`. Crucially, **Phantom Dive was absent from both prompts**, and the observer recorded **no six-counter PutDamagePrompt allocations**. The improved Phantom Dive resolver's trigger was therefore **not exercised**. The same printed game continued for 65 turns, with engine winner seat 0 and remaining Prizes `[1,2]` in both arms. The baseline reproduced identically after the experimental arm.

This is valuable negative exposure evidence and a lifecycle/noninterference check on a frozen source deal. It does **not** show a stronger policy or a competitive improvement. A meaningful follow-up must first find a source-60 trajectory with the relevant Dragapult attack actually available, a vulnerable opposing Bench, and a competing baseline Rolling Iron copy choice. Leave all competitive qualification flags false.

## Qualification boundary

Next use one source-consistent rank10 initial deal and real root decision trace, opt in only for the Regidrago controller, compare first divergent copy choice, apply validated counter prompts and observe opponent continuation. Evaluate speculative live-State noninterference and imperfect-information fairness. The current option targets both bots if both play Regidrago, and cannot be nested with Agent37's individual resolver wrappers while their names are replaced.

Every game remains `sourceReplayMechanicsVerified:false` and `qualifiedForCompetitiveInference:false` until independently reviewed. The benchmark still has 29/32 exact opponent lists and zero qualified competitive games.
