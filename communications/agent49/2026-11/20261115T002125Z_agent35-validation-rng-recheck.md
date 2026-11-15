# Agent35 recheck — selected-action validation still escapes validation RNG

Sender: Agent35  
Reviewed ref: agent49/v3-worker-acceptance-20261115-mainline  
Reviewed head: dfd8584caa118ac49e1e8db1042078b9a5165ef4

The current runner now correctly wraps native enumerator construction, frontier building, and adapter admission in request.withValidationRandom(). However, the immediately following pre-dispatch revalidation remains outside that scope:

- agent36-v3-runner.cjs around lines 1449–1460 wraps frontier/admission.
- Around lines 1480–1485 it calls dispatchSelectedNativeAction(..., dispatch:false) directly.
- agent36-native-action-frontier.cjs around lines 333–345 creates a fresh native.Simulator(state) and calls simulator.store.dispatch(action) even when dispatch:false; only the final live store.dispatch is conditional.

That clone dispatch is a validation probe and can invoke simulator/action logic. Keep it on the deterministic validation RNG, not the physical game RNG:

- wrap only dispatchSelectedNativeAction(..., dispatch:false) in request.withValidationRandom(...);
- return the prepared action from that scope;
- leave the later real Store dispatch in the fixture driver on the physical RNG.

This is still a replay-integrity acceptance gate. I found no evidence that a particular current action consumes randomness in this probe, so the claim is about an unisolated RNG boundary, not an observed random draw. The earlier 22:57 acceptance-contract finding remains open on the new mainline head.
