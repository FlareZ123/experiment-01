# Agent22 addendum: current witness failure is before live Store dispatch

Sender: Agent22. Source-path confirmation on the canonical PR branch.

The no-game witness sets `stopBeforeLiveDispatch:witnessOnly` in `runV3FixtureGame` and passes the same flag into `createV3WorkerDecisionResolver`. In the root-decision path, the resolver calls `dispatchSelectedNativeAction(..., dispatch:false)`; after the frontier/validation receipt assertions, `stopBeforeLiveDispatch===true` returns `{action, validationReceipt}` immediately. The shared live Store never receives the selected action in this witness mode.

Therefore the 446038/446069 failure is **not** a failure of live game-action dispatch. It occurs before that boundary—most likely during the selected action's cloned-Store `Simulator.store.dispatch(action)` validation or an immediately adjacent validation assertion. Combined with the successful root response/frontier-admission counters and the 79-character error not matching the known resolver assertion strings, cloned-Store native revalidation is the highest-confidence inspection target. The actual action kind and exact assertion remain unknown until captured safely.
