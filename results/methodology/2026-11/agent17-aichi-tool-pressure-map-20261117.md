# Aichi source-field Tool-removal and Tool-suppression map

**Agent 17 · 17 November 2026**

## Decision

The exact 29 available original source lists show broad pressure against a Tool-dependent candidate package:

- **Field Blower:** 9/29 lists, 11 total copies.
- **Megaton Blower:** 10/29 lists, 10 total copies.
- **Faba:** 7/29 lists, 8 total copies.
- **Tool Jammer:** 5/29 lists, 5 total copies.
- **Union:** 20/29 available lists (69.0%) contain at least one of those four direct Tool-removal / Tool-suppression cards.

This is a source-list inventory, not a claim that any of these cards is drawn, playable, or used in a particular game. The three missing lists (23/25/28) are excluded from the denominator and may not be imputed. The primary cross-format field retains all five Japanese-Extra-incompatible lists among the 29 exact lists.

For Hood Shield v1, this means Stealthy Hood cannot be treated as a permanent, universally reliable lock. The existing rank-3 and rank-7 reports already show that the same two-Hood package can have an immediate escape function but very different long-term resource durability by opponent.

## Exact rank-level matrix

Counts below are direct from `results/aichi-2026/full-decklists.json`; zero means the card is absent from that registered 60, not that no other answer exists.

| Rank | Archetype | Field Blower | Megaton Blower | Faba | Tool Jammer | Direct pressure profile |
|---:|---|---:|---:|---:|---:|---|
| 1 | Shadow Rider Calyrex | 1 | 0 | 0 | 0 | Field Blower |
| 2 | Vileplume Control | 0 | 0 | 1 | 0 | Faba |
| 3 | Snorlax Stall | 0 | 0 | 1 | 1 | Faba + Tool Jammer |
| 5 | Mew Genesect | 1 | 0 | 0 | 0 | Field Blower |
| 6 | Iron Thorns | 0 | 1 | 1 | 1 | Megaton + Faba + Tool Jammer |
| 7 | Snorlax Stall | 1 | 1 | 2 | 1 | All four; Faba ×2 |
| 8 | Absol Garbodor | 1 | 0 | 0 | 0 | Field Blower |
| 10 | Regidrago | 0 | 0 | 1 | 0 | Faba |
| 12 | Regidrago | 0 | 1 | 0 | 0 | Megaton Blower |
| 13 | Regidrago | 0 | 1 | 0 | 0 | Megaton Blower |
| 14 | Regidrago | 0 | 1 | 0 | 0 | Megaton Blower |
| 19 | Raging Bolt | 1 | 0 | 0 | 0 | Field Blower |
| 20 | Regidrago | 0 | 1 | 0 | 0 | Megaton Blower |
| 21 | Regidrago | 0 | 1 | 0 | 0 | Megaton Blower |
| 22 | Absol Garbodor | 1 | 0 | 0 | 0 | Field Blower |
| 24 | Iron Thorns | 0 | 1 | 1 | 1 | Megaton + Faba + Tool Jammer |
| 29 | Iron Thorns | 1 | 1 | 1 | 1 | All four |
| 30 | Lillie's Clefairy | 3 | 0 | 0 | 0 | Field Blower ×3 |
| 31 | Dusknoir Chimecho | 1 | 0 | 0 | 0 | Field Blower |
| 32 | Regidrago | 0 | 1 | 0 | 0 | Megaton Blower |

Ranks 4, 9, 11, 15, 16, 17, 18, 26 and 27 contain none of these four named cards. That is not a general "no Tool answer" certificate; other cards, attacks, or effects may matter, and the three missing ranks remain unknown.

## Highest-pressure overlaps

- **Rank 7** is the strongest named Tool-removal package in the available field: Field Blower ×1, Megaton Blower ×1, Faba ×2, Tool Jammer ×1. Its source list also has VS Seeker ×3 and Lusamine ×2; the existing rank-7 report documents the Faba recovery/resource-war concern. Two Hoods do not make the lock durable against this package.
- **Rank 29** has all four categories once. It is an Iron Thorns source list and remains one of the five Japanese-Extra-incompatible lists in the primary field.
- **Ranks 6 and 24** each combine Megaton Blower, Faba and Tool Jammer. Their source lists also contain substantial Energy disruption: Plumeria ×4 and Team Flare Grunt ×2 in each; rank 24 has Enhanced Hammer ×2 and Handheld Fan ×2, while rank 6 has Enhanced Hammer ×2 and Handheld Fan ×1.
- **Rank 30** has Field Blower ×3. Its list is a distinct pressure case even without Megaton Blower or Faba.
- **Rank 3** has Tool Jammer + Faba and Plumeria ×4, Team Flare Grunt ×2, Enhanced Hammer ×2. The already-staged Arven → Field Blower + Hood escape line is still a useful immediate response, but the list's Supporter/Energy pressure makes retreat-payment and follow-up protection separate questions.
- **Rank 1** has Field Blower ×1. The existing rank-1 reserve model additionally records the post-KO Teammates / Field Blower / Unfair Stamp branch; the Stamp's net effect on candidate reserve access remains unquantified.

## Related Energy disruption (separate from Tool removal)

The source list inventory also shows:
- **Plumeria:** 8/29 lists, 20 copies;
- **Team Flare Grunt:** 5/29 lists, 9 copies;
- **Enhanced Hammer:** 7/29 lists, 10 copies;
- **Handheld Fan:** 3/29 lists, 4 copies.

Do not combine these into the Tool-removal count. Plumeria and Team Flare Grunt create attached-Energy pressure; Enhanced Hammer is relevant to Special Energy, not a Basic Psychic Energy attachment; Faba and Megaton Blower can affect Special Energy as well as Tools under their text. Candidate-specific relevance depends on the exact Energy type, attached Pokémon, current retreat/attack cost and timing. The source list counts do not prove that a disruption effect is available on the needed turn.

## Candidate and policy implications

1. **Treat Hood as a timing tool, not a permanent shield.** The policy should decide when to attach the first Hood, when to keep the second in hand, and when the immediate escape line is more valuable than preserving a reserve.
2. **Separate removal classes.** Field Blower discards up to two Tools/Stadiums; Megaton Blower is a broad all-Tools/Special-Energy sweep; Faba removes one eligible attached card to the Lost Zone; Tool Jammer suppresses Tool effects on the opponent's Active. These are not interchangeable responses and need different decision envelopes.
3. **Track opponent recursion and turn economy.** A single Faba is different from Faba ×2 plus VS Seeker/Lusamine recovery. The number of copies alone is not access probability; policy competence needs source-natural or native-staged evidence.
4. **Do not use this matrix to make an immediate deck change.** The current V3 acceptance and first rank-1 diagnostic sequence remains frozen. The matrix is a cross-field risk map for the later policy challenge suites and structural candidate comparison.
5. **Do not infer full Top 32 coverage.** These counts are 29 exact lists only; ranks 23/25/28 remain unavailable and no full-field aggregate is permitted.

## Reproduction

For each exact source deck in `results/aichi-2026/full-decklists.json`, sum copies by exact card name and count each named card above. The union is the number of distinct available ranks with a positive count of at least one of Field Blower, Megaton Blower, Faba, or Tool Jammer. The source JSON is unchanged.

**Evidence classification:** list presence/copy counts = repository source data; 20/29 union and overlaps = deterministic arithmetic; candidate-policy implications = proposed methodology; actual card access, timing, strategic effect in a complete game, matchup performance and win rate = not established.
