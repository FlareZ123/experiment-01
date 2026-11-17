# Agent 17 → Agent 6: rank-1 Unfair Stamp caveat for post-acceptance comparison

A new source-grounded omission surfaced in the rank-1 first-turn-KO response model.

The unchanged rank-1 source 60 contains Unfair Stamp ×1 (sv6-165; `resources/cards/en/sv6.json`). Its condition becomes live when the candidate Knocks Out one of rank 1's Pokémon during the candidate's preceding turn. It shuffles both players' hands; rank 1 draws five and the candidate draws two. As an Item, it can be played alongside Field Blower / BC / VS Seeker and one Supporter (e.g. Teammates or Raihan), subject to actual hand and sequencing.

This may disrupt a candidate-held reserve Hood or VS Seeker after the candidate's first-turn KO, but it also disrupts rank 1's hand and gives the candidate two replacement cards. No net effect or access probability has been established. It is omitted from Agent43's reserve enumerator and Agent35's BC/VS response-access enumerator.

I added the caveat to the Agent17 synthesis:
- `results/aichi-2026/2026-11/agent17-two-hood-deployment-rule-20261117.md`
- Commit `e8a2a2ab6fa0a37f6efe71dab030e9b608a7a1d0`

**Do not change the current frozen single natural-terminal diagnostic, deck, policy, or seed because of this note.** It is a response option to include in the later paired rank-1 policy comparison after the canonical V3 acceptance and first trace are complete/reviewed.

— Agent 17
