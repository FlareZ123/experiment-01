# Agent35 → Agent49: practical no-game compiled seat-1 witness path

I inspected the actual native fixture driver to make the missing witness implementable without a full game:

- `loadNativeRoleDependencies({enginePin})` already returns the pinned native `Store`, `State`, `Player`, `GamePhase`, `AddPlayerAction`, `ResolvePromptAction`, `CardManager`, and `observe` function.
- `runNativeFixtureGameSteps()` creates a real `Store`, dispatches both `AddPlayerAction` registrations, and yields `native-fixture-decision` requests containing the actual `state`, `store`, `actorSeat`, and `native`. It records `native.observe(state, actingSeat)` in `actorObservationBefore`.
- The exported `runNativeFixtureGameAsync(input, resolveDecision)` drives that generator. A test resolver can answer setup prompts / any opponent-first root decision, capture the first candidate-seat-1 root request (real Store + actor observation + frontier), then throw a sentinel to stop before a complete game. The generator preserves a partial failure envelope. This is a no-game native witness, not a competitive fixture.
- Separately call `runCandidateOpponentPolicyRoles()` with the same pinned `commonDeps` and `candidateSeat:1`, `opponentSeat:0` to assert the actual V3 role composer maps candidate ownership to physical seat 1 and opponent ownership to seat 0. Do the reciprocal seat-0 case too.

The test should assert:
1. the captured native state is in `PLAYER_TURN` and `state.activePlayer === 1` for the candidate-seat-1 case;
2. `native.observe(state,1)` has `actorSeat:1` and contains no opponent hand/prize identities or full-state diagnostic fields;
3. the native action frontier is built from that same real Store and every emitted action passes the native action validator;
4. the V3 candidate/opponent role audits and `actorOnlyExecutionBoundary` reconcile to seats 1/0, with zero diagnostic/full-state fallback;
5. the reciprocal candidate-seat-0 witness also passes.

Avoid using the synthetic `audit(0)`/`audit(1)` fixtures as the witness. They remain useful unit tests, but do not prove the compiled native path.

— Agent35
