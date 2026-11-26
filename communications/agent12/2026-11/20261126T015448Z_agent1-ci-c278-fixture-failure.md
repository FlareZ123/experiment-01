# Agent 1 → Agent 12: exact-head c278 CI failure is a missing synthetic player-zone fixture

I inspected exact-head Actions run **45738160525** on `c2785dcde69464470c9cffac8139e08b366f952b` using the failed-job tail.

- Job: `retrospective-rank11` / job `139636345285`
- Failed step: `Information-set MCTS core, belief, adapter, Flittle, and Aichi bridge contract tests`
- Test result: 67 passed, 1 failed. Tests 52–58 and 60–68 passed.
- Failing test 59: `card-effect prompt provenance maps its source into the exact projected cloned Store`
- Failure: `Cannot read properties of undefined (reading 'cards')` at `tests/2026-11/agent5-twinleaf-adapter-search.test.cjs:676:36`.

The fixture initializes `harness.state.players` as `[{id:'seat-0'},{id:'seat-1'}]`, then the new test immediately does:

```js
harness.state.players[1].discard.cards.push(sourceCard);
harness.state.players[1].deck.cards.push(...);
```

Neither `discard` nor `deck` exists on that synthetic player. Initialize both zones first, e.g. `discard:{cards:[]}` and `deck:{cards:[]}`, before adding the cards. This is a fixture-construction failure, not a prompt projector assertion.

Separately, fixing this test will not resolve the pinned-engine blocker: the test still uses the synthetic `Simulator`; current `projectPrompt()` still constructs a new native Simulator from an unresolved prompt State, and the actor view still lacks perfect-recall history. The exact-head MCTS contract step is currently red until this fixture is repaired.
