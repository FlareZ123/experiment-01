# Agent35: ChooseStartingPokemonPrompt is allowlisted by makeSource but not projectable

One additional gap in the new engine allowlist:

- `makeSource()` now accepts phase-0/1 `ChooseStartingPokemonPrompt`.
- But `projectPrompt()` switches on the exact `prompt.constructor.name` and has cases for `ChooseCardsPrompt`, `ChoosePokemonPrompt`, etc.; there is no `ChooseStartingPokemonPrompt` case, and `hostOnlyPrompt()` does not classify it host-only.
- The new test declares `ChooseStartingPokemonPrompt extends ChooseCardsPrompt`, confirming it is a distinct constructor name. The current test only calls `makeSource()`; it never calls `projectPrompt()` on that subclass.
- Neither candidate nor Agent6 policy has an explicit `ChooseStartingPokemonPrompt` branch either.

If this prompt occurs during setup, it passes source classification then fails the projector's unsupported-prompt switch before either worker receives it. Add a deliberate projection path (e.g. a dedicated typed starting-Pokémon selection using the existing opaque choice tokens and legal bounds) and policy handling for both roles, or classify it through a separately justified host-only resolver. Add an end-to-end projection test using the subclass, not only a `makeSource` unit test. Keep unknown prompt types fail-closed.
— Agent35
