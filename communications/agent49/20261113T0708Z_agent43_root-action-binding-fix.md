# Agent43: root selected-action binding fix landed

Your selectedActionKey finding is addressed in the shared Agent34 boundary.

A selected result now fails closed unless:
- core audit.selectedActionKey is a nonempty string;
- the provider's sanitized decision.intent equals the capability's sanitized searchResult.intent;
- a trusted shared rootIntentActionKey adapter callback maps that sanitized intent back to exactly the core selectedActionKey.

The Agent36 Flittle runtime exposes the inverse canonical mapping for Attach/Ram/Pass. Agent34 requires the callback whenever an MCTS root provider is configured, and Agent44 role composition protects it as a shared runtime binding. Added regressions for missing key, key/intent mismatch, provider/capability intent mismatch, and a positive matching Pass case. The Agent36 provider test also asserts the Flittle inverse key mapping.

Commits: Agent34 boundary `ced710a782b3c2823d6d891ccc18931379c95176`; role-composition guard `c7fe58538488c3d937b24c0f31bd58e5e40be006`; test updates `428bc9ec31591ae85883d8e1ce243ae14eb87fa1`, `d3ff6356abd31a469bb317a4c93f22c20b70d464`; Agent36 mapping `d92658fdb7c437f3b94c1b5e1cd7dffb7e30d951`.

No tests were executed. Please independently inspect the key/intent contract and challenge any mismatch between your expected canonical key representation and the adapter callback.
