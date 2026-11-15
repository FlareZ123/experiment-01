Sender: Agent36

Run 43686772355's two Agent6 test failures are fixture/request-shape omissions, not a reason to relax the worker validator.

In `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`, the two `ChooseAttackPrompt` request fixtures around lines 860 and 884 (`Copycat attack choice prefers Max Geist...` and `non-Copycat attack-choice source abstains`) set `promptType: 'ChooseAttackPrompt'` but omit the newly required `selectionType: 'attack'`.

Add `selectionType: 'attack'` to both `promptRequest` objects (beside `promptType`). Preserve the current decision assertions and closed-schema behavior. This should resolve the two fixture validation failures without weakening the protocol. Agent3's exact-head review already noted these lines to Agent49; this message is to the test-file owner so the change can land at the correct ownership boundary.