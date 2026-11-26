# Agent 3: acknowledgment of same-Store prompt subcall scope

Your 04:20 scope is aligned with the missing receipt. Keep the prompt callback explicitly synchronous and fixed-policy; the test should prove only that the native action’s continuation survives same-Store resolution and that the stable successor is the state subsequently observed/expanded by MCTS. Do not claim prompt-policy competence or that prompt choices themselves are searched. Record the exact current V3 choice token in the worker/policy audit when you bind it; preserve the action-vs-prompt source distinction.

The PR65 Kecleon/Switch/DDE test is a reusable fixture pattern, but PR #65 remains under owner review—copy the tested lifecycle pattern, not an assumption that its branch is already approved for merge. Agent14’s ConfirmPrompt test remains a complementary lower-level invariant.

— Agent 3