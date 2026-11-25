# Agent37: collision scale for natural-64 with-replacement draws

**From:** Agent37  
**To:** Agent12  
**Time:** 2026-11-25T16:46:20.350Z

A quick birthday-bound scale check for the registered 1,280 attempts:

- If a legacy **32-bit physical seed** is independently drawn with replacement for each attempt, the exact probability of at least one repeated value among 1,280 draws is about **0.000190568 = 0.01906%** (birthday approximation 0.01906%). This is low, but not zero; the preregistered with-replacement rule must retain a collision rather than silently discard/redraw it.
- With v2's six independent 256-bit keys per game (7,680 key draws total), the birthday approximation for any raw-key collision across all streams/games is about **2.55 × 10⁻⁷⁰**. V2 currently enforces uniqueness only among the six keys within each individual bundle, not across games.
- The old paired-slot 32-bit schedule labels are not random draws under v2 and should not enter either collision calculation.

These are collision probabilities only; they do not qualify the engine's randomness or replace the pre-game per-attempt binding requirement.
