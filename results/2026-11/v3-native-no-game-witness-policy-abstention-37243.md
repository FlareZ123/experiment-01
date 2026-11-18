# V3 native no-game witness failure at 37243: real policy prompt abstention

## Question

Why did the first exact-head native no-game witness fail after the stale source assertion was corrected on commit `37243d2c6347ae48e4b70cf33d23bed3c5f40200`?

## Evidence

- Workflow run: `44249521495` (`Agent36 one-game bilateral competence probe`), head `37243d2c6347ae48e4b70cf33d23bed3c5f40200`.
- All 320/320 contract tests passed before the native witness command ran.
- Failed artifact `agent36-common-v9-bilateral-competence-44249521495` contains exactly `agent36-v3-fixture/native-no-game-witness/failure-candidate-seat-0-actor-seat-0.json`.
- Failure receipt: `fixtureOnly=true`, `gameExecuted=false`, `coverageComplete=false`, `completedWitnessCount=0`.
- First failing cell: candidate seat 0, opponent seat 1, expected actor seat 0; failure stage `prompt-resolver-decode`.
- Public failure code: `POLICY_ABSTAINED`.
- Native fixture failure: `actionOrdinal=14`, `actingSeat=1`, `turnBefore=0`, `pendingPromptType=ChooseCardsPrompt`.
- Candidate worker audit: 2 worker decisions, all 2 prompt decisions, 0 abstentions, 0 failures.
- Opponent worker audit: 3 worker decisions, all 3 prompt decisions, 1 abstention, 0 failures; process closed and container removed successfully.
- No root decision was reached (`rootDecisionCount=0`); no native action-frontier admission occurred; physical/policy/native-state disclosure flags all remained false.
- Worker RNG evidence remained replayable and cleanup was fully verified.

## Interpretation

This is a genuine rank-1 opponent-policy prompt-resolution failure, not a Twinleaf root-action legality failure, worker-launch failure, cleanup failure, or stale contract assertion. The exact abstention reason is intentionally coarsened to `POLICY_ABSTAINED` by the public failure projection, so the internal reason must be recovered or reproduced before asserting the precise branch.

The current Agent6 policy explicitly recognizes three engine setup messages in its setup branch: `CHOOSE_STARTING_POKEMONS`, `GO_FIRST`, and `WANT_TO_DRAW_CARDS`. The current prompt-projection tests and rank1 policy agreement test cover those three. A `ChooseCardsPrompt` during turn 0 therefore needs targeted reproduction. If it is a standard starting-Pokémon prompt, compare the real actor-only metadata against the existing setup agreement contract; if it is another prompt source, extend the typed provenance/policy contract deliberately. Do not mask the failure with a dummy policy or repeated blind witness runs.

## Reproduction / diagnostic gap

The current public failure projection retains the generic `POLICY_ABSTAINED` code but not the policy's allowlisted abstention reason. A safe future diagnostic improvement is to preserve that reason code in the failure receipt (without prompt contents, hidden state, or policy input) so the next failed witness identifies the exact policy branch immediately.

## Current disposition

Agent26 sent the artifact-backed diagnosis to Agent6 and Agent49 in their mailboxes. No V3 implementation or policy files were changed by Agent26. The next owner action is to reproduce or expose the exact abstention reason, patch the smallest real policy/projection gap, then rerun the exact-head no-game witness.