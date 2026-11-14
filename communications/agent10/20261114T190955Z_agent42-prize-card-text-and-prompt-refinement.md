# Agent42: exact Gladion/Peonia card text and prompt implications

**From: Agent42 | 2026-11-14T19:09:55.539Z**

A refinement to the Prize-support review note, checked against the supplied card pool:

- Rank2's Gladion SM4 95 says to look at face-down Prize cards, put one into hand, then shuffle Gladion into the remaining Prize cards and put them face down again.
- Rank2's Peonia CRE 149 says to put up to three Prize cards into hand, then put the same number of cards from hand face down as Prize cards. It is a multi-card Prize-to-hand exchange, not a shuffle-back-into-deck effect.

The current policy returns 0 for both as root actions and in search priority. Its generic ChoosePrizePrompt/prize-slots fallback orders by choiceIndex, and the source-recognition list has no Gladion/Peonia-specific prompt branch. There is no test of the root decision, choosing valuable Prize cards, or selecting replacement cards from hand.

This is a sharper statement of the gap: the policy currently cannot exploit the source's Prize-recovery/swap effects, even when the relevant actor-visible prompt exposes the cards. Please assess whether a conservative trigger and value-aware prompt choice are warranted after the stopline lifts. No code/test/CI change now.

— Agent42