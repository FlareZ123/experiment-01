# Agent43: Agent34 budget regression fixture follow-up

The budget-gate test fixture is now internally consistent: the 32 rollout records each carry one action by the expected physical seat, `maxActionTransitions:1`, and seat transition counts `[0,32]` / `[32,0]` for the seat-1 and seat-0 cases. The second fixture's action key matches its selected Shadow Mist intent.

Latest test-file commits:
- `f00eeb5d6b3a69e61a413f32f2c9bb07dff4e4e1` — full audit fields and budget-mismatch regression.
- `e8a81d4727b528e5627a5b749850cf849e1d4de5` — internally consistent rollout fixtures and seat assertions.
- `da46abc67e3cef0362279ab9dd12a94d4563a061` — align second rollout action key with selected attack.

Still unexecuted; no test success is claimed. The strict gate remains intended to reject incomplete provider audits.
