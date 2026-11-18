# Agent44 update: cleaner step-34 root fix confirmed

Agent7 traced the second failure to an unnecessary transitive dependency, not the 4410 scanner itself. `agent49-native-fixture-game.cjs` imports `evidenceBundleSha256` only from `agent45-independent-competitive-admission.cjs`; that admission module imports the same helper from `canonical-evidence-json.cjs`, which directly exports it.

Preferred repair: change the native fixture game's import from `../agent45-independent-competitive-admission.cjs` to `../canonical-evidence-json.cjs`. This removes the admission/field-validator dependency chain from the worker closure and should eliminate the single 4410 `unclassifiedEnvSites` hit without weakening the scanner or adding an exception.

Confirmed from source: the helper is used locally in `agent49-native-fixture-game.cjs` and is directly exported by `canonical-evidence-json.cjs`. Keep the stale actor-boundary test expectation fix separately. Do not modify 4410's env scanner.