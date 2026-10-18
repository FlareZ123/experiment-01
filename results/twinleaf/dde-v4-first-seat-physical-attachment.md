# Real-source Double Dragon attachment and immediate resource loss

**Agent 8, 18 October 2026 UTC.** Bounded diagnostic of the *first-seat* Aichi rank-10 Regidrago source game, distinct from Agent8's richer rank10-opponent/Shadow Rider-B replay. This report identifies actual Store targets and immediate attached-Energy disposition. It establishes a source-specific policy misallocation opportunity, not a win-rate result.

## Source and falsification contract

- Frozen published 60s: Aichi **rank 1 Shadow Rider** (engine A) versus **rank 10 Regidrago** (engine B), seed **4246551499**. The actual first player was slot B, Regidrago. Exact request and existing negative-conversion baseline: [Agent20 source audit](dde-v4-first-seat-nonconversion.md).
- Pinned Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Hook set is Agent20's **simplified** `DoubleDragonAttachTactic-v4`, with `doubleDragonRecovery:true`, `isolatePolicyRandomness:true`, `captureDecisionTrace:true` and 350-action ceiling. Do **not** conflate with Agent8's separate `postSuperAliasRepairIsolation` plus extended hooks source.
- [Manual compiled CI 39083775716](https://github.com/FlareZ123/experiment-01/actions/runs/39083775716) **succeeded**, head `6dd1222c8ac3c620aaa969937ff114bb92807366`; [machine-readable source artifact 12120201020](https://github.com/FlareZ123/experiment-01/actions/runs/39083775716/artifacts/12120201020), ZIP SHA-256 `512d06bfe73cb4ab6bcb6ad017f5e7d65220918d625dcb66bedf6c0fb7047232`.
- [Research observer](../../simulation/twinleaf/dde-v4-first-seat-source-root-target.cjs) intercepts only the live source `Store.dispatch`. It reads the player's own hand plus public Active/Bench printings and attached Energy before/after each actual Double Dragon Energy ROS root play and after the next two root actions. It never asks a speculative bot for hidden cards or mutates the action. [Fake Store tests](../../tests/dde-v4-first-seat-source-root-target.test.cjs) passed in the same compiled run.
- The observer required **exactly two actual DDE root plays** and checked a separate baseline against the observed game. The complete *runner-observable* digest stayed identical: `fa9c8c213beefb3164f24add23f0ca8eebe95431347d23ab872a78df8ef4f019`. Both games finished at 211 runner actions / global turn 38; rank1 engine slot A won, remaining Prizes [0,3], **zero Regidrago Apex Dragon attacks**. Full Store reducer/closure noninterference is not independently proven.

## Physical targets and immediate aftermath

| Real Store root dispatch | Physical DDE recipient and state | Next actual source action |
| --- | --- | --- |
| **104**, global turn **21** | Active **Kyurem SFA**, 0 attached Energy before and **Double Dragon Energy ROS** after. The Bench already contained Regidrago V SIT with one Grass. | Root **105 RetreatAction** moved Kyurem to Bench; its attached Energy became **empty**. Root **106 PassTurnAction** left Koraidon ex TEF Active and unpowered. |
| **133**, global turn **27** | Active **Koraidon ex TEF**, 0 attached Energy before and **Double Dragon Energy ROS** after. A Benched **Regidrago VSTAR SIT already had two Grass Energy**; another Regidrago V had one Grass. | Root **134 AttackAction** (source attack trace: Koraidon ex **Retribution Strike**). Root **135 ResolvePromptAction** still showed DDE attached to Koraidon; the Benched VSTAR remained on two Grass. |

Both actions' physical target fields were `{player:2,slot:1,index:0}`, which identify the observed Active recipient in these Store dispatches. The original `decisionTrace` action ordinals (102 and 131) differ by **two** from the actual Store dispatch ordinals (104 and 133); future forks must use the latter if counting Store roots. These ordinals are valid only under this frozen source hook suite and initial deal.

The first DDE's physical removal immediately after Retreat is direct runtime observation. Discard as the Retreat payment is consistent with the Basic Rulebook retreat cost and the Special Energy provision (two units), but the artifact did not independently record that exact discarded card's final discard-zone identity. The second DDE remained attached to Koraidon through its next AttackAction.

## Decision significance

The [v4 policy implementation](../../simulation/twinleaf/dde-attach-tactic.cjs) normally orders the **Active** first when it can legally receive DDE, even with partially energized Regidrago on the Bench. The observed source choices exactly expose this local-scoring heuristic's consequence: one DDE is lost from the Active in the very next root action, while the subsequent DDE energizes a secondary attacker instead of the Benched Regidrago VSTAR with two Grass.

**Testable alternative:** at **source root 133 only**, retarget that same in-hand DDE to the real Benched Regidrago VSTAR at index 5. That Pokémon has a genuine Dragon printing and two Grass Energy before the choice. Printed Apex Dragon requires Grass-Grass-Fire, and DDE can supply the missing typed requirement. This is a *legality/access hypothesis*: Regidrago still needs an Active position, a legal attack window and competent continuations, and the challenger gives up Koraidon's immediate Retribution Strike. Compare identical source prefix, preaction physical zone, opponent response, resulting attack history, and terminal game under the same frozen rules/hook set. Do not declare the alternative stronger from its Energy coverage alone.

**Qualification:** `sourceReplayMechanicsVerified:false`, `qualifiedForCompetitiveInference:false`. One seed, one start, unqualified opponent decisions and simulator fidelity. The population still has **29/32 exact lists and zero qualified competitive games**.
