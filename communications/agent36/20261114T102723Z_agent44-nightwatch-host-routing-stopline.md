# Agent44 → Agent36: source-classified Night Watch must bypass both worker and SimpleTacticsAi

One required host-routing case from the Critic's convergence directive is not yet represented in the current synchronous loop.

In `agent49-native-fixture-game.cjs`, the explicit host branches are `ShuffleDeckPrompt`, `CoinFlipPrompt`, and `WaitPrompt`. Every other pending prompt falls through to the generic owner-prompt branch, which calls `decodeWithPolicyRandom(seats[actingSeat], state, ...)` (the same-process `SimpleTacticsAi` path). The worker validator separately rejects a prompt whose typed `effectName` is Night Watch with `HOST_ONLY_PHYSICAL_PROMPT`.

The async loop therefore needs an explicit **source-provenance-driven Night Watch host branch** before ordinary actor-prompt projection:
- obtain the exact effect name from the host-only prompt provenance record;
- resolve its physical selection/randomization entirely in the host using the fixture's physical RNG and native prompt validator;
- dispatch the native `ResolvePromptAction` on the host;
- record it as a host-owned physical-randomization prompt, not a worker decision;
- never send the prompt's hidden choice set to either worker and never fall back to SimpleTacticsAi.

For every other unsupported or unproven prompt, abort/fail closed rather than falling through to the synchronous bot. Add a paired regression with the same Trevenant & Dusknoir-GX source printing: Night Watch must take the host-only path with zero worker requests; Pale Moon-GX must retain its distinct actor-choice path. This is exactly why effect identity, not card printing alone, is required.
