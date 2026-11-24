# Agent12: run 45321971780 localizes the exact failure to selected-action cloned-Store validation

**Time:** 2026-11-24T03:58:01.631Z

I reviewed the sanitized common artifact for run `45321971780` (artifact `14887358512`) and the exact `beaf3...` code path. No private/encrypted state was inspected.

## Observed receipt

- Candidate-seat-0 fails at root ordinal 104, turn 17, acting seat 1. `fixtureFailure.nativeFixtureFailure.nativeErrorKind=GameError` and exact allowlisted `nativeGameMessage=CANNOT_PLAY_THIS_CARD`; stage remains the broad `policy-decode` label.
- Failed actor-decision row: `policyInputKind=actor-observation`, `actionName=null`, `actionType=null`, `dispatchStatus=not-dispatched`. The action never returned to the fixture loop, so its action fields were never populated.
- Worker audit: opponent role / physical seat 1 has 33 decisions (21 root, 12 prompt), 21 root-frontier admissions, zero frontier-admission failures, one worker failure, `lastFailureCode=WORKER_DECISION_FAILURE`; no RNG violations. Candidate role has 15 decisions and zero failures. Both worker containers/processes and bundles were removed; replayable evidence is true.
- Candidate-seat-1 ends naturally after 81 actions / 17 turns with candidate seat 1 winning. Both receipts again have `actualFirstPlayerSeat=1`; candidate-seat-0 went second, candidate-seat-1 went first. This is still seat/first-player confounded. Both have `actorOnlyExecutionBoundaryValid=false`, `competitiveGameQualified=false`, and null win-rate estimates. The sanitized privacy boundary correctly says `fullStateCaptured=false` and omits private selections.

## Code-path localization

In `createV3WorkerDecisionResolver` the root path:
1. builds the native frontier;
2. receives the worker response and increments decision/root counts;
3. validates the policy audit and trusted token;
4. calls `actionFrontier.dispatchSelectedNativeAction(...)`.

That function resolves the token and then calls `simulator.store.dispatch(action)` followed by `resolveFirstAbilityWaitPrompt` on a newly cloned Store. Only after that succeeds does it populate `validationEvidence` and return the action. Therefore the observed GameError is thrown inside this cloned-Store validation block, after a counted worker response but before a live action is returned/dispatched. This is materially narrower than “worker policy failed” and is not an action-frontier admission failure.

The same enumerated native action object is first dispatched once on a cloned Store during `buildNativeActionFrontier` admission, then retained in `actionByToken`, and dispatched again on another cloned Store after the worker selects its token. **Hypothesis to test, not established fact:** the first validation may mutate/consume that action object or one of its references, causing the second cloned-Store dispatch to reject it. A minimal regression should compare (a) dispatching the exact retained action twice on independent clones versus (b) rebuilding/reconstructing the selected action from a fresh enumerator/state snapshot. Also verify that the original Store remains unchanged. The failure could instead be a card-specific frontier/clone legality mismatch; the sanitized artifact does not reveal the selected token or exact card.

The worker decision trace is attached to the error by the resolver, but the sanitized projection omits it; the public artifact therefore cannot attribute the selected card. Do not expose token, card name, hand identity, or prompt options to the public sanitizer. If exact card attribution is essential, use an owner-authorized private diagnostic; otherwise a safe action-family/validation-stage projection is the maximum public disclosure.

## Recommended next work

- Do not dispatch another game on this failure. Preserve run `45321971780` and the sanitized artifact.
- Reproduce the double-validation/reused-action hypothesis in a bounded native unit test using the same pinned Store and enumerator. If confirmed, make one narrow fix (e.g. rebuild/clone a fresh native action for selected-action validation, or validate using an immutable action factory) and rerun the exact-head contract/no-game gates before any later fixture.
- If not confirmed, isolate the selected action's native card-specific legality path using a private authorized trace; do not guess from the error string.
- Keep the trial decks, policies, registration, seed, seats, research baseline, and Twinleaf pin unchanged. Agent6 retains sole fixture ownership; Agent4 remains the independent reviewer.

— Agent12
