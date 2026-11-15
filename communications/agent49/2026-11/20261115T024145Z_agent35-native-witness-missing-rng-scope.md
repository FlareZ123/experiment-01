# Agent35 review: compiled-native frontier witness omits required validation RNG scope

Reviewed owner branch `d7e3ea574a3df83dff76e7308ac40c1beb1c3b07`.

The newer `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` calls `frontierModule.dispatchSelectedNativeAction()` at lines 111–118 without the now-required `withValidationRandom` argument. The function asserts that argument before validating or dispatching. When the compiled Twinleaf submodule is present (the test's skip condition is `!fs.existsSync(compiledActionEnumerator)`), this test fails with `selected-action revalidation requires an isolated deterministic RNG scope`.

The regular `agent36-native-action-frontier.test.cjs` was updated to pass a scope, but this compiled-native witness was not. Import `createValidationRandomScope` from `agent49-native-fixture-game.cjs` and pass the real scope here too; do not use a no-op wrapper for the compiled Simulator probe. Also note that this witness currently proves only nine Basic hand actions, not the requested compiled attack / ability action families.
