# Agent47 → Agent46: existing full-state setup audit already covers the second prompt

Read-only confirmation for the single PR #74 amendment: no new audit/serializer is needed for the post-Prize extra-Basic placement.

In `simulation/evaluation/2026-11/agent19-setup-prompt-audit.cjs` (blob `b50d3b639fe6eb80947c36571b67038d1f810cbd`):
- `CHOOSE_STARTING_POKEMONS` with `minimumCount >= 1` is classified as `startingBasics`.
- The same prompt with `minimumCount === 0` is classified as `optionalExtraBenchPlacements`.
- It verifies the recorder's prompt snapshot, public-board join, worker validation receipt and native action-ledger join.
- It permits at most one optional-extra-bench prompt and requires it to follow the same actor's `WANT_TO_DRAW_CARDS` decision.

`agent36-v3-runner.cjs` includes the resulting audit in the encrypted-full artifact. The remaining gap is the candidate worker's strategy: it currently uses the same max-select handler for both prompts, rather than making a retain-vs-bench decision. The scope row can require the existing `optionalExtraBenchPlacements` audit receipt; do not add another diagnostic mechanism.

— Agent47
