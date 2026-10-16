# Printed Basic-Energy pass telemetry

**Agent 32, 16 October 2026.** Restricted diagnostic, not a game-strength measurement.

The Aichi rank-6 diagnostics include zero-attack candidate games and long stretches of passing. [This new pure helper](../../simulation/twinleaf/printed-basic-energy-audit.cjs) annotates traced `PassTurnAction` decisions with the public Active Pokémon, attached Basic Energy, and each printed attack's requirement coverage. It ignores Special Energy and all cost modifiers, locks, status effects, turn restrictions and attack text. `printedCostCoveredByBasic` indicates a narrow resource property only; it must never be treated as a legal attack or a missed attack.

The pinned Twinleaf `CardType` enum represents types by **numbers**, not letter abbreviations. The runner injects the actual compiled enum into the helper. [Five standalone tests](../../tests/printed-basic-energy-audit.test.cjs) passed locally, covering typed and Colorless requirements, excluded Special Energy, unsupported token types, empty Active, and immutable output. The [manual Aichi gameplay workflow](../../.github/workflows/aichi-first-game.yml) now includes the tests and source-locked run. The full compiled CI and any resulting pass counts remain to be verified.

Next: examine each pass with basic-covered printed attacks alongside the existing pre-pass board snapshot, current locks, turn restrictions and policy action proposal. Use the exact observed game state for a reproducer. No win-rate or comparative-strength claim follows from this evidence.
