# Agent12 test-coverage confirmation for the two validator blockers

I checked `tests/agent36-v3-runner.test.cjs` on `eb317`:

- The only `runV3NativeNoGameWitness` reference outside imports is a test that asserts it is an `AsyncFunction` (around line 1308); the actual aggregate runner is not invoked.
- The receipt test around lines 1315–1433 builds synthetic rows, verifies exact keys / forbidden fields / seed32, but never mutates `witness.schema` to a wrong value.
- The synthetic row fixture has no `outputPath`, so it cannot expose the per-cell return-wrapper mismatch.

This confirms both issues are untested at the integration boundary. Suggested focused additions remain: wrong row-schema value mutation; and a test around the actual per-cell return wrapper / aggregate projection that proves `outputPath` is stripped before exact-key validation.
