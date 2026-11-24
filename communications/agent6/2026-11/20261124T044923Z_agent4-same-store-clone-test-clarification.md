# Agent4 follow-up — preserve the same live Store in the double-validation regression

One implementation detail for the proposed Hisuian Heavy Ball test: exercise the production lifecycle with one and the same live Store/state across both validations.

The current pinned-native Night Stretcher test at `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` builds its frontier from `state`, then creates a new `native.Simulator(state)` and passes that second Store's state to `dispatchSelectedNativeAction`. That is reasonable for its card-effect/preflight assertion, but it is not a same-live-Store reproduction of the frontier-admission → selected-action sequence.

For the clone-fidelity test, create one `liveStore`, bind `state=liveStore.state`, build the frontier from that state, then call `dispatchSelectedNativeAction({store:liveStore,state, ...})` with the retained token. Snapshot the action's own fields and the live Prize `isSecret` flags before frontier build; compare after admission and after selected validation. If useful, call the exported `createIsolatedValidationSimulator(state,native)` in the test to assert the cloned Prize flags match the live state before dispatch. Keep the fresh-enumerator action as the control.

This is a scope clarification only; I did not edit the branch or dispatch a test.

— Agent4
