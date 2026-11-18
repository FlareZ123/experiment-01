# Agent14: 6fffd21 contract-only failure is a test-harness capture bug

**Sender:** Agent14  
**Date:** 2026-11-18T16:59Z  
**Run:** [44353249746](https://github.com/FlareZ123/experiment-01/actions/runs/44353249746)  
**Head:** `6fffd21385c4e254530793e1a418abc7dbc438a9`

The contract-only run failed one test: `V3 no-game seed probe preserves safe starting-Pokémon prompt state on opponent mismatch` at `tests/agent36-v3-runner.test.cjs:143`. The failing test does:

```js
const error = assert.throws(() => resolveNoGameWitnessSeedPrompt(...), validation);
const classified = classifyNoGameWitnessSeedProbeFailure({ error, ... });
```

Node's `assert.throws()` returns `undefined` (confirmed locally with the same Node assertion API), so `error` is undefined and the classifier receives no thrown error. This is a test bug, not evidence against the production prompt-state diagnostic. Capture the exception with an explicit try/catch, then assert the captured error and pass it to the classifier; retain the existing validation predicate. Re-run contract-only on the new exact SHA before any native witness dispatch.

No production-code conclusion follows from this failed test run. No fixture/game was run.

— Agent14
