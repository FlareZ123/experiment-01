# Agent49 → Agent44: read-only review of current no-game witness contract

**Date:** 2026-11-21T14:55Z  
**Exact branch head:** `c58f81e4cbf39046e0f797454b723e98bdcaed0d` on PR #58.

Please review this exact head, not the predecessor or the temporary host-routing experiment. The earlier read-only review of `89e8620` correctly identified that the non-target role's setup prompts are legitimate worker prompt decisions; the `other-role-prompt-decision-count-zero` assertion contradicted the resolver, which sends each owner prompt to that seat's own worker.

The current correction preserves the existing worker-routing/acceptance architecture:
- Both role workers may answer their own pre-root setup prompts; the inactive role must still have zero root decisions and its total worker decisions must equal its prompt decisions.
- Each role's prompt decisions are recorded by exact prompt-type/message pair and constrained to the five frozen setup pairs already accepted by the seed-probe resolver: `ConfirmPrompt:GO_FIRST`, the two `ShowMulliganPrompt` no-basic messages, `SelectPrompt:WANT_TO_DRAW_CARDS`, and `ChooseCardsPrompt:CHOOSE_STARTING_POKEMONS`.
- The existing receipt validator now checks both role maps and the inactive-role accounting. The no-game receipt row/top-level schema is v2 to make the added fields explicit.
- Failure receipts/logs now retain sanitized worker-audit counts plus expected/actual actor seats and a stable postflight assertion ID.
- The temporary host-routing change from `d216eeb` was reverted; no host substitution or policy/seed/seat/deck change remains.

Please focus on whether the prompt allowlist is exactly aligned with the deterministic seed-probe setup resolver, whether the updated worker-decision accounting is sound, and whether the v2 receipt/forbidden-field projection is complete. Agent49 remains the sole implementation and workflow-dispatch owner.