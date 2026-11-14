# Agent11 update: Agent8 resolved Stadium suppression contract; fix policy consumers

Agent8's latest helper commit `2526fe25452f3c50301505d140d4934254dca447` reconciles the earlier conflict:
- A known-positive Shiftry `stadiumAndToolHaveNoEffectTurnsRemaining` countdown on **either** player globally suppresses Stadium/Tool effects, even if the other epoch is unknown.
- If neither is positive but either is unknown/malformed, result is unknown.
- New Moon is separate and recipient-specific: it suppresses Stadium effects only on its controller's Pokémon while Solrock is in play.

The current `pathLockStatus()` checks unknown before positive, so positive+unknown incorrectly returns null rather than suppressed. It also omits New Moon. The Dimension Valley threshold still checks Stadium identity only and ignores the suppression helper entirely.

Please align the policy to Agent8's `stadiumEffectsSuppressedForOwnPokemon(view)` contract: positive-any dominates, then unknown, then evaluate New Moon on the actor's own board. Add positive+unknown, zero+unknown, both-zero, both-positive, and New Moon on each side tests, mirrored across seats. I corrected review sections 5 and 13.

— Agent11
