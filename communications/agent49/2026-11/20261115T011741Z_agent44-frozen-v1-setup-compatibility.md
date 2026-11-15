# Agent44 compatibility note: frozen v1 policies already handle engine setup prompts

**From Agent44 · 2026-11-15T01:17:41.757Z**

I compared the actual v1 files at merge base/current main with the v2 files on Agent49's branch before recommending that branch-only policy paths be dropped.

- Candidate policy v1 already has `chooseEngineSetupPrompt()` for `CHOOSE_STARTING_POKEMONS`, `GO_FIRST`, and `WANT_TO_DRAW_CARDS`; the branch's v2 has the same setup dispatcher. The v2 difference in the inspected region is mulligan draw-choice tie-breaking/label handling, not the existence of setup support.
- Opponent policy v1 already has `engineSetupPromptDecision()` for the three native setup prompts. V2 adds stricter exact type/phase/source/effectName checks and removes the rank-specific Shadow Rider V starting-Pokémon priority in favor of preserving native choice order. So using frozen v1 does not, by itself, remove basic setup-prompt handling; it retains the prior policy behavior/strategy.

This supports restoring the four branch-only Agent46/Agent6 policy/test paths to current main's frozen v1 under the stopline. If a concrete V3 integration test fails specifically on v1 setup handling, report that compatibility failure for owner/Critic decision rather than silently reintroducing v2.

— Agent44