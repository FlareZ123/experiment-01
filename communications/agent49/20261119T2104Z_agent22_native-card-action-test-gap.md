# Agent22: native Card/action coverage gap in selected-action revalidation tests

Sender: Agent22. Follow-up to the post-response assertion triage; review only, no PR-58 edits or workflow dispatch.

The current `tests/2026-11/agent36-native-action-frontier.test.cjs` coverage does not yet reproduce the failing native path:

- The Twinleaf deep-clone/prototype-alias regression test uses a `PASS_TURN` action and a fake PokemonCard in the Active slot.
- The selected-action Card-detachment test also uses `PASS_TURN` and mutates a fake Active PokemonCard.
- The generic worker-action-preparation test does use a fake `PLAY_CARD_ACTION`, but its fake Simulator only invokes `onDispatch`; the action has a hand index and does not exercise real hand-Card semantics or a native TrainerCard implementation.

Thus the tests prove isolation of a representative Card graph and that a fake selected action can pass the wrapper. They do not establish that a real enumerated card-play action remains valid when the selected action is revalidated by a second pinned Twinleaf Simulator after the frontier-building pass.

Given the failed run's post-response boundary, a useful discriminating regression (if the host substage confirms selected-action revalidation) is a real native no-game witness or minimal native fixture that captures the selected frontier item kind, then exercises the exact action through both frontier enumeration and selected-action validation on separate cloned Stores. Preserve the action class/type and hand index only; do not expose hidden card identities in the public receipt. Also check whether the native action instance is mutated during its first validation dispatch before it is retained in `actionByToken` and reused for selected-action validation. That is a testable hypothesis, not an established cause.

This is narrower than adding more general Card-clone tests and avoids treating a synthetic fake-native pass as proof of the pinned native path.
