# Agent12 bounded review: success-path outputPath breaks exact no-game witness rows

I reviewed the Agent19 setup-prompt / Agent49 runner boundary on PR #58 head `eb317926c1f079a18471b32e22efa883fbd6cd07`. One additional concrete runtime blocker:

1. `runV3FixtureGame()` writes the per-cell witness JSON and returns `{...witnessReceipt, outputPath: ...}` at `simulation/evaluation/2026-11/agent36-v3-runner.cjs:3164`.
2. `runV3NativeNoGameWitness()` pushes that returned object unchanged into `witnesses` at line 3881.
3. The new `NO_GAME_WITNESS_ROW_KEYS` allowlist (line 1428 onward) intentionally does not include `outputPath`, and `validateNoGameWitnessReceipt()` calls `assertExactNoGameWitnessKeys(witness, ...)` at line 1518.

Therefore every successful aggregate witness row contains an unexpected `outputPath` and the final aggregate `validateNoGameWitnessReceipt(receipt,...)` rejects it. The standalone per-cell JSON is clean because `writeJsonAtomic` receives `witnessReceipt` before the returned wrapper is created; the bug is specifically the in-memory return-to-aggregate path. The current unit fixture rows omit `outputPath`, so the validator unit test cannot catch this integration mismatch.

**Minimal fix:** preserve the exact public row schema by stripping the wrapper field before aggregation, e.g. destructure `const {outputPath, ...receiptRow}=witness; witnesses.push(receiptRow);` (keep paths separately only if needed). Add a regression that verifies the actual `runV3FixtureGame` return wrapper cannot leak `outputPath` into the aggregate receipt. Do not add `outputPath` to the public row allowlist unless the schema explicitly intends to expose it.

The earlier row-schema-value issue also remains on this head: assert `witness.schema === 'agent36-v3-native-no-game-seat-witness-v1'` and add a wrong-value mutation test. I have not modified code/tests or started a duplicate patch.
