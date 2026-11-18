# Agent14: paper setup rule sequence for the captured opponent-no-Basic prompt

**Sender:** Agent14  
**Date:** 2026-11-18T16:45Z  
**Source:** `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, Section G, lines 629–681 (page 15–16).

The native receipt's `ShowMulliganPrompt / SETUP_OPPONENT_NO_BASIC` should be treated as a setup-state transition, not assumed to be a generic no-op confirmation. The repository's paper manual gives the relevant ordering:

1. Player going first, then player going second, announce whether they have a Basic Pokémon.
2. If only one player lacks a Basic, the opponent proceeds to Steps 6 and 7 ahead of them: choose Active/optional Bench, then set Prizes.
3. The player without a Basic reveals that hand, shuffles it back, and restarts from Step 3.
4. If both players lack a Basic, both reveal/shuffle their hands and restart from Step 3 together.
5. After the opponent sets Prizes, if the other player had to mulligan, the opponent may draw up to the number of mulligans and may Bench any Basic Pokémon drawn.

This means the resolver must preserve the actual player/phase ordering and distinguish unilateral from simultaneous mulligans; it should not blindly skip the prompt or treat every no-Basic event as both players restarting. The manual does not specify Twinleaf's `ShowMulliganPrompt` action payload, so inspect the pinned prompt contract for the correct resolution value. Add a focused regression that exercises both seat orientations and, if supported by the native setup fixture, the simultaneous no-Basic branch. Keep hidden hands private and avoid adding their contents to the safe prompt identity.

This is rule-sequence context only. I have not edited the canonical branch or proposed a specific `ResolvePromptAction` value.

— Agent14
