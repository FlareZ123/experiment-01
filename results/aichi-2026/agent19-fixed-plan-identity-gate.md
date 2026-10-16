# Agent 19: fail-closed provenance for the fixed-candidate diagnostic

**16 October 2026.** This investigation tests evidence attribution in the Critic's six-trial source-locked diagnostic, rather than Pokémon card strength.

## Defect and impact

The original `simulation/evaluation/aichi-campaign-execute.cjs` passed scheduled decks and seed to `runMatch`, then accepted any nominally finished engine response as a `completed-engine-game` when first-turn telemetry looked valid. It displayed returned deck hashes but did not compare them against the requested ordered 60-card arrays, or compare the returned seed with the scheduled seed. A valid first-turn observation by itself could therefore describe an execution of the wrong inputs.

An open-ended `...policyFlags` spread occurred after the scheduled deck arrays, seed, and action bound. An injected `seed`, `deckA`, `deckB`, or `maxActions` property could silently override the supposedly frozen plan. This risk concerns integrity of research instrumentation; it does not imply any existing archived artifact was malicious.

## Change

The runner now allows only recognized boolean policy flags. It independently derives `SHA256(JSON.stringify(deck))` for each requested ordered engine deck and compares both values to the engine's returned `deckHashes`. It verifies the engine-reported seed and `rules.format === 'EXPANDED'` before first-turn and completion classification. Mismatches receive `unverified-game-identity` or `unverified-game-environment` status and are excluded from `completed-engine-game`.

The test fixtures now return realistic ordered input fingerprints and report the seed and rules format. Four new adversarial tests cover false seed reporting, wrong fingerprints, wrong format, and attempts to override frozen inputs using policy flags. The pre-existing diagnostic tests remain part of the same suite.

**Verification:** manual [Aichi benchmark statistical tests, CI 38838767329](https://github.com/FlareZ123/experiment-01/actions/runs/38838767329) passed at commit `9b2d7796df3cf984e651187ee77db40f6b2b8f83`. Relevant implementation commits: `b8e46bd0673a5edb06ff9aa46aed19bed828f860` and `9b2d7796df3cf984e651187ee77db40f6b2b8f83`.

## Scope and unresolved evidence

The runner checks requested engine-deck identity, not the semantic fidelity of the mapping from Japanese tournament printings to Twinleaf card objects. It trusts the separate source resolver for that mapping. It checks returned metadata against requested inputs, but a compromised or defective engine could report identical metadata while executing different rules. No action-level replay or reference-policy validation is established.

Existing rank-6 generic-bot outcomes remain diagnostic. The 99.5% target has no supporting qualified win-rate sample. Further campaign promotion should verify complete action histories, relevant lock and search effects, and opponent policy quality under the same frozen trial plan.
