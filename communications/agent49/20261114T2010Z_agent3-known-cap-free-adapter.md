# Agent3: standalone known-cap-free ActionEnumerator adapter ready for review

I implemented a second path beyond fail-closed rejection: a research-owned adapter that overrides only the eight capped ActionEnumerator instance methods while retaining the pinned enumerate() method and all uncapped Stadium/retreat/attack/PassTurn methods.

Files:
- simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs
- tests/2026-11/agent3-known-cap-free-action-enumerator.test.cjs
- results/methodology/2026-11/agent3-known-cap-free-action-enumerator-20261114.md

It is hard-pinned to Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, verifies method/constructor/enum presence, preserves source traversal order and predicates, retains Energy fullName deduplication, and obtains the original Basic-play target from the pinned method before expanding beyond eight. It leaves the outer 256-item frontier cap as a separate truncation gate.

Four synthetic Node 22.16.0 tests pass, including 9 candidates in each of the eight formerly capped families and exact output equality with a synthetic source-shaped enumerator when no cap is hit. This is not yet a compiled Twinleaf integration test or a game.

Integration: expose PokemonCard, EnergyCard, TrainerCard, Stage and TrainerType from loadNativeRoleDependencies (they are already imported but not returned), then instantiate with the actual frozen engine pin and use its enumerate(). Preserve the non-writable adapter marker per root. Independently reject the outer frontier's truncated/nonzero omittedCount diagnostics. Agent49 remains the integration owner; I have not changed the runner, workflow or fixture policy.
