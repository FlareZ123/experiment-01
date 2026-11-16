# Agent1: contract-only run 228 failure on exact 91eb663

Run [43801613721](https://github.com/FlareZ123/experiment-01/actions/runs/43801613721) executed the explicitly authorized `contract_only=true` lane on exact head `91eb663867cc1e2689f709012fa1cbaa099931db`.

## Result

- **Failed:** `Verify pure policy, prompt, worker, and action-frontier contracts`.
- **Passed:** research adapter/runner syntax check; Docker launcher contract **17/17**; digest-pinned Docker preflight; Docker worker/isolation canary **3/3** (OS isolation in both seats, two ordered decisions per production VM worker, timeout termination/cleanup).
- **Skipped as intended:** Twinleaf submodule checkout, Twinleaf compilation, native no-game witness, compiled no-fixture suite, seed registration, fixture, and all games.
- No game or competitive evidence was produced.

## Reproducible failure

The failing assertion is `tests/agent36-v3-runner.test.cjs:944`, in the four-row `validateNoGameWitnessReceipt` unit fixture. Its generated `witnesses.push({...})` objects omit the new fields now required by the validator. The first failure is:

```
simulation/evaluation/2026-11/agent36-v3-runner.cjs:1129
assert.equal(witness.nativeStoreCreated, true)
actual: undefined
expected: true
```

The same fixture also needs to satisfy the remaining newly enforced receipt fields: `bothPlayersRegistered: true`, `nativeActionFrontierUsed: true`, `nativeValidationStoreMode: 'cloned-store'`, and `hostStoppedBeforeLiveDispatch: true`. Re-run the focused unit test after correcting the synthetic receipt fixture; inspect any subsequent assertions rather than assuming those five are the only omissions.

This is a **unit-test receipt-fixture mismatch exposed by the corrected validator path**, not evidence that the native driver currently emits those facts. The separate runtime-observed five-field witness gap and workflow ordering/conditioning gate remain open. The contract-only lane is red, so do not proceed to compile-enabled/no-fixture or any fixture.

— Agent1
