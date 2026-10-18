# Agent 50: authentic rank-10 decision, detached hidden-order contrast

**17 October 2026. Evidence status:** research hook and three pure controls committed. Pinned Store execution and source-result interpretation are pending the manual workflow. This is an exploratory information-access sensitivity test, not a qualified game result.

## Narrow question

Does the currently configured generic Twinleaf policy select a different action at one genuine, published 60-card source-dealt rank-10 Regidrago versus rank-1 Shadow Rider state if its own remaining deck's *unseen physical order* changes?

The existing compiled synthetic rank-10 60-card inventory fixture showed a hidden-order-dependent `PassTurnAction` versus `PlayCardAction` choice at a constructed turn-four board. That finding does not show exposure in an actual game. This source-dealt probe tests a stronger context but is still not an observation-equivalent-policy certification.

## Frozen source and procedure

- Reuse the exact rank-10 source deal from `results/aichi-2026/qualification-packets/rank-10/README.md`: rank-10 Regidrago opponent in engine seat A, rank-1 Shadow Rider champion in physical seat B (the actual first player), v3 seed `4246551499`, pilot repeat 0.
- Preserve every `runMatch` option and 60-card printing ID used by the existing real root-decision graph mutation audit; finish the game ordinarily once without probe and once with probe.
- Intercept only the first candidate root decision at global turn 27, seat B, without substituting any action. Construct two independent full-State clones via pinned `deepClone` without a Card ignore list, preceded by the existing vendor-shape preflight and followed by source-prototype normalization.
- Evaluate the standard policy on each detached world, keeping all public zones and owned hand equal and reversing only the acting player's remaining deck order in the counterfactual. Each world has a fresh bot and an identical independently seeded policy-random stream. The root source graph fingerprint before/after and the entire uninstrumented/instrumented `runMatch` summaries must match.
- Record only bot action identities, the unknown-zone card count, and digest, without dumping hidden identities into the report.

Files: [source probe](../../simulation/twinleaf/rank10-hidden-order-live-probe.cjs), [pure regressions](../../tests/rank10-hidden-order-live-probe.test.cjs), [existing manual CI](../../.github/workflows/twinleaf-hidden-information.yml).

## Limits

K1 deck-membership knowledge is not proven for the specific observed root and legitimately remembered top-of-deck information is not audited. Therefore, even if choices differ, the result is first an **actual source-State deck-order sensitivity** demonstration requiring an independent observation equivalence check before calling it an unfair clairvoyance violation. Conversely, equal choices in two orders cannot establish information-set safety across all possible orders, actions or policy randomness.

The source state's clone preflight may correctly fail closed. A failed assertion should be recorded and attributed, rather than bypassed. This experiment cannot establish strong decision policy, source card correctness, opponent competence, matchup strength or the proposed 99.5% target.

## Initial control rejection and repair

The first manual [source probe CI 39023497950](https://github.com/FlareZ123/experiment-01/actions/runs/39023497950), head `bd99ad8b9f9d32b630f65728b9b2076efd28d32a`, failed in the new **pure test before the actual source probe ran**. Its exact failure was `RangeError: Maximum call stack size exceeded` while an independently created bot inherited the temporarily patched `decodeNextAction` method and recursively entered the observer. The repair at commit `5354b0baa9d50ac55c108dc73af4105669d03e48` binds the saved original method directly on each detached bot. A fresh isolated JavaScript execution passed all three pure cases. The second compiled manual workflow was dispatched at head `45ffc34151a0dc981436867cfb592a1b7b4741e2`, [CI 39023726151](https://github.com/FlareZ123/experiment-01/actions/runs/39023726151); its outcome is not yet included here.

## Compiled source-dealt result: no selected-action divergence in this contrast

[Manual CI 39023726151](https://github.com/FlareZ123/experiment-01/actions/runs/39023726151), source head `45ffc34151a0dc981436867cfb592a1b7b4741e2`, completed successfully. The `hidden-draw-forecast` job (ID `117370487113`) passed all three new Node regression cases and the actual pinned-engine source run. The live source fixture used `pilot:10:0:champion-reference:B` and seed **4246551499**.

At genuine candidate global turn **27**, the acting player ID was **202**, with **19 cards** remaining in the deck. Both cloned worlds selected exactly the same `PlayCardAction`: actor ID 202, `handIndex:2`, target `{player:2,slot:2,index:2}`. The observed `actionSensitiveToHiddenDeckOrder` flag was **false**. The original full-State root-data digest before/after both speculative evaluations was **`8c1b545ccdacb9dda83a3d42192e00c23ff5d507f1d54a5a7be1bbd1aedfe20d`**, and the complete instrumented `runMatch` return was identical to the uninstrumented run.

This tests only **one** reverse-order counterfactual and one fixed policy seed. It does not evaluate all hidden arrangements, numerical action-score sensitivity, intermediate speculative mutations, information known from previous observations, or human-quality decisions. It provides evidence that this one source decision was *not* altered by the selected permutation in the tested generic policy. Existing earlier synthetic rank-10 list-complete hidden-order action divergence remains valid under its own constructed conditions. The two results describe different states and do not contradict one another. The number of competitively qualified match outcomes remains **zero**.


## Archived ordinal 215 needs an explicit historical policy

The first decisive-gate CI run [39024325361](https://github.com/FlareZ123/experiment-01/actions/runs/39024325361) failed after the already-passing turn-27 control: the ordinal-215 observer saw **zero** eligible calls and asserted one. This is a *non-exposure*, not hidden-order equivalence, and must not be reported as a successful ordinal-215 comparison.

The full current-v4 source differential [39035919042](https://github.com/FlareZ123/experiment-01/actions/runs/39035919042) subsequently documented that corrected Double Dragon attachment on turn 2 causes this source game to end on turn 16. The historical ordinal-215 Mimikyu Retreat was in an older trajectory. A turn-28 gate cannot occur after a turn-16 completion.

The live probe now explicitly selects `doubleDragonArchiveV3:true` **only** for the archived ordinal-215 question, retaining active v4 for its earlier exploratory turn-27 query. The headless engine supports a separately named `DoubleDragonAttachTactic-v3-archive` option, and its source is annotated as a historical-only compatibility tactic. A standalone regression for the profile choice is in `tests/rank10-hidden-order-policy-profile.test.cjs`. Compiled archival reproduction and complete-action prefix equivalence remain unverified until the newly dispatched manual workflow completes. In particular, choosing the archived tactic is not by itself proof of historical replay identity.

Do not combine the v3 ordinal-215 and v4 current-policy observations into one current-game claim. Both are diagnostic policies, and neither qualifies a competitive game.


## Current-v4 true turn-2 source decision: one reverse-order negative

[Manual CI 39104594586](https://github.com/FlareZ123/experiment-01/actions/runs/39104594586), commit `2db0b9275e97f86eea0e7c102a7bfbdb4b9f0782`, compiled pinned Twinleaf, passed all prerequisite hidden-information fixture tests after the lazy `temple-raichu-board.cjs` import correction, and passed the new archival-profile pure check and six source-probe controls. **The overall job ended red at the later archived-ordinal step**; the preceding successful source observation remains bounded evidence.

At actual source root dispatch **15**, global **turn 2**, acting rank-10 Regidrago in physical engine seat A, player ID **101**, the remaining **46** own deck cards were reversed only on an independent, prototype-normalized detached State. Equal-seeded bots chose the same typed `PlayCardAction`, `handIndex:0`, target Active `{player:2,slot:1,index:0}`. The uninstrumented physical source match matched the instrumented match, and live source-graph fingerprint `cff10223bdffa732381e23d75bbfaa1578bf3f617dd7a65cb16998c58b9f5410` was unchanged before/after speculative counterfactuals. The source observer recorded **zero whole-owner-deck searches** before this decision. An independent Agent8 source-printing audit had already identified this exact root step as Double Dragon Energy ROS attached to Active Regidrago V; the probe's own live chosen-printing assertion is a subsequent, unverified improvement.

This is **no selected-action difference across this one physically reversed hidden deck order**. It does not prove score invariance, full observational equivalence, K1 deck knowledge, or general hidden-information-safe policy. The policy consumes entire engine State in speculative evaluations; the earlier valid constructed full-source-inventory test still demonstrates a possible hidden-order decision flip. Since no own-deck search was recorded on this turn-2 source, the actor is not shown to have K1 membership knowledge from normal play.

The same compiled workflow attempted `DoubleDragonAttachTactic-v3-archive` for historical root **215** and again found **zero** root gate exposures, failing its previous exactly-one expectation. The archived v3 tactic selection alone did not reestablish the historical source trajectory; the earlier hypothetical Mimikyu action must remain tied to its archived original process and source-input transcript. A subsequent code revision encodes historical gate absence as an explicit `exposed:false` diagnostic result while retaining strict failure if the current-v4 root-15 gate disappears. This revision and the additional exact selected-printing assertion await their own compiled confirmation.

Both observations are diagnostic only; none is a qualified competitive game or a rank-10 win-rate measurement.
