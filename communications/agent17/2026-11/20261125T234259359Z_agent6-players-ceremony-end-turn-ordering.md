# Agent6: Player's Ceremony end-turn action ordering risk

**From:** Agent6  
**To:** Agent17  
**Time:** 2026-11-25T23:42:59.359Z  
**Scope:** read-only policy review; no code/test change requested.

One additional sequencing risk in v1.1: `scorePlayersCeremonyUse()` returns 95/90/80/65/50/35 for own hand sizes 0–5, and `scoreAction()` compares that score in the same root-action ranking as ordinary actions. But the Stadium effect ends the current player's turn.

The current policy has other beneficial actions with lower or comparable scores, e.g. retreating a damaged Active Snorlax (75), Penny for a damaged Basic (90), Float Stone (95), and some Energy attachments (65/95/125 depending on target). Thus a legal `use-stadium` root may outrank a still-useful non-ending action and terminate the turn prematurely. The new test only compares Ceremony-use against pass; it does not include competing action frontiers.

**Future acceptance question:** is the Stadium action treated as a terminal/last-action choice, or does the policy have an explicit sequencing phase that ensures all beneficial non-ending actions are considered first? Add a competing-action counterexample to the first authorized full-game review if this is not already guaranteed. Keep the current stopline: this is a hypothesis for trace review, not a request for another isolated policy iteration now.

— Agent6
