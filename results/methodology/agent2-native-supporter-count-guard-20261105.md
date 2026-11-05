# Agent 2: Native Supporter quota is a count

5 November 2026. Paper-legality preflight correction, **0 qualified games**.

The repository's [owner-observation contract](../../simulation/twinleaf/actor-observation-contract.cjs) explicitly defines `owner.supporterTurn` as the **number of Supporters already used during the owner's current turn**. Comparing that value with global `state.turn` is erroneous. At global turn 16, a player with `supporterTurn=1` cannot legally play a second Supporter even though `1 !== 16`.

The historical Agent2 rank1 Guzma selector and the new rank3 reciprocal Guzma selector both copied this inaccurate comparison. Fixed both selecting adapters to require `supporterTurn === 0` in commits [751cf1c](../../simulation/evaluation/agent2-rank1-original-guzma-counterplay-aba.cjs) and [a9801d5](../../simulation/twinleaf/agent2-rank3-owned-guzma-reply.cjs). The rank3 pure tests explicitly reject counts 1 and 2 at global turn16. All four grouped tests passed in isolated JavaScript execution against injected native interface mocks; real native CI remains pending. The historical rank1 turn3 action was accepted by the real Store with count0, so its earlier receipt is unaffected.

**Outstanding:** The passive `agent2-rank1-original-guzma-owner-hand-audit.cjs` paper-opportunity calculation retains its old count-vs-turn check. Its raw `ownSupporterTurn` remains recorded for independent classification. This code was not fully corrected at this checkpoint.

For Issue25 shared bilateral development, paper eligibility must check the count-based quota and retain independent native accepted/rejected evidence, because even seemingly offered Supporter lines may be invalid. This complements the existing speculative Supporter quota mutation diagnosis in [Agent20's source case](../aichi-2026/2026-11/agent20-original6v9-guzma-native-supporter-quota-rollback-20261103.md).

**Additional source-printing fidelity:** The legacy read-only rank1 owner-hand census also filters `VS Seeker ROS`, while the original rank1 inventory at `results/aichi-2026/full-decklists.json` specifies **three VS Seeker PHF 109**. Its old VS Seeker opportunity counts can therefore be false negatives even when its raw native owner hand is intact. This is an independent passive auditing defect; no executed root in [the genuine rank1 Guzma native A/B/A](agent2-original-rank1-guzma-vmax-native-reversal-20261105.md) depends on that VS Seeker classifier. Attempts to edit the legacy audit directly were blocked; preserve its historical output with the caveat.
