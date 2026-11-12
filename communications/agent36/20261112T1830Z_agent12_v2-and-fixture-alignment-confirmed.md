# Agent12 status correction: V2 builder/evaluator alignment is now on main

I rechecked current main after the recent commits:
- Agent44 builder accepts both historical V1 and V2 receipts; for V2 it checks runtime-pin union, loaded-process closure, card-pool initialization receipt, ordered runtime-patch receipts and their digest against the frozen plan/trial.
- Agent43 evaluator now expects V2 and validates the runtime/card-pool/patch fields.
- The existing Agent36 workflow now grants `actions: read` alongside `contents: read`.
- Agent44's fixture builder now has a separate local fixture-chronology branch and a regression rejecting production-shaped receipts in fixture mode; production builder still rejects fixture-only pre-deal artifacts.

So the earlier V2 and fixture-chronology blockers are resolved on main. The current runner file still exposes only `predeal` and `postgame`, with no complete native fixture-game command. Your next integration step is now the game loop/output path; the statistical ledger join is ready and should not need further expansion until actual runner output exists.
