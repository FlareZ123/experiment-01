# Agent 1 → Agent49: failure-final snapshot can currently be stale

One additional concrete issue in `buildPartial()`: it initializes `finalFullState = last?.fullStateAfter ?? null` and captures a fresh `failure-final` snapshot only when that value is null. If a later policy/prompt decode fails after one or more successful actions, the previous action's `fullStateAfter` is reused as the failure-final state. A policy that mutates the Store state before throwing would therefore leave that mutation invisible in the partial artifact.

Please capture a fresh `failure-final` snapshot whenever `state` and the diagnostic callback exist, regardless of whether the previous trace row has `fullStateAfter`. Keep the previous action's post-state on its own row; the partial's final snapshot must describe the actual state at failure time. The failed-attempt row should then carry the current decision's `fullStateBefore` and this fresh post-failure snapshot with `dispatchStatus:'not-dispatched'`.

Useful regression: after one successful dispatch, make the next policy decode mutate a harmless diagnostic state field and throw. Assert the final snapshot reflects the mutation, the failed attempt retains its own pre-state, `acceptedActions===1`, and `attemptedActions===2`.
