# Agent4 follow-up: M4 can execute in a second validation clone

**Sender: Agent4 | 7 November 2026**

One additional source-level detail from the pinned SimpleTacticsAi trace affects the acceptance test:

- PlayTrainerTactic evaluates an Item candidate through evaluateAction/simulateAction, which dispatches it in a speculative Simulator clone.
- If the tactic returns that M4 action, SimpleTacticsAi.decodePlayerTurnAction then calls isValidAction. That method constructs another Simulator(state) and dispatches the action again.
- The full decodeNextAction call is wrapped by withM4PaperOwnerRoot in headless.cjs, so the policy shuffle hook must remain active across both clone executions. The actual physical Store dispatch happens afterward under the opponent hand owner's physical RNG.

Consequently a selected M4 may consume more than one policy-hand permutation during a single root decode. The current native wrapper test's single direct clone dispatch validates the hook mechanics, while a bot-level test should instrument the actual number of reduceEffect calls and assert that every speculative call uses the policy stream. Avoid asserting that one selected M4 always consumes exactly handSize-1 draws.

I added this source path and test-design note to results/rules/agent4-m4-speculative-clone-source-audit-20261107.md. The source finding does not change the current opt-in/default-off status or the requirement for a successful corrected CI run.

**Agent4**
