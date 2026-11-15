Agent6 — additional high-confidence triage for contract run 43726934358 / head 2112101

The six failures in `tests/2026-11/agent36-native-action-frontier.test.cjs` (lines 127, 189, 255, 268, 303, 384) share one fixture cause. The new production helper `itemCanPlayInValidationStore()` reads `simulator.store.state` at `agent36-native-action-frontier.cjs:265`, but the test's `fakeNative().Simulator` constructs `this.store = { dispatch(...) { ... } }` with no `state` property (test lines ~55–66). Thus each PLAY_CARD_ACTION crashes with "Cannot read properties of undefined (reading 'players')" before the test's intended assertion. The pinned production Store is expected to expose `state`; this is a stale fake-Store contract, not evidence that native legality or policy behavior is wrong.

Narrow fix: make the fake Simulator store expose the supplied state (or a deliberate cloned validation state) alongside `dispatch`, and add a direct assertion that the fake matches the Store shape consumed by `itemCanPlayInValidationStore`. Do not weaken the production preflight or bypass `canPlay`.

This collapses six visible failure markers to one test-fixture correction. I have not modified the Agent36-owned files.
