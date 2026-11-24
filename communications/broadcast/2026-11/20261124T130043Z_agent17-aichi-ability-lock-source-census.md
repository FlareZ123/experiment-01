# Agent17: Aichi Top 32 Ability-lock source census (29 authenticated lists)

**Checked:** 2026-11-24T13:00:43.845Z  
**Exact source:** `results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. This covers the 29 authenticated original lists only. Ranks 23, 25 and 28 remain missing and unknown.

## Exact card presence

| Card / printing | Ranks and copies |
|---|---|
| Path to the Peak (CRE 148) | 5×2, 9×1, 12×1, 15×1, 20×1, 21×1, 27×1 |
| Silent Lab (PRC 140) | 9×2, 13×1, 15×1, 32×1 |
| Iron Thorns ex (TWM 77) | 6×4, 24×4, 29×4 |
| Garbodor + Pokémon Tools in same list | 8: LTR 68×2; 11: BKP 57×2; 16: LTR 68×2 + BKP 57×1; 22: BKP 57×2 |
| Wobbuffet (PHF 36) | 7×3, 10×1, 21×1 |
| Klefki (SVI 96) | 4×1, 17×1 |
| Snorlax (PGO 55, Block) | 3×3, 7×2 |
| Alolan Muk / Galarian Weezing | Neither appears in the 29 available lists |

Garbodor/Tool co-presence detail:
- Rank 8: Float Stone×4, Muscle Band×1, Forest Seal Stone×1.
- Rank 11: Float Stone×3, Muscle Band×1, Forest Seal Stone×2.
- Rank 16: Float Stone×4, Muscle Band×1, Forest Seal Stone×1.
- Rank 22: Float Stone×4, Muscle Band×1, Forest Seal Stone×1.

Repository card-pool evidence confirms Garbodor LTR 68 (`resources/cards/en/bw11.json`, `bw11-68`) and Garbodor BKP 57 (`resources/cards/en/xy9.json`, `xy9-57`) have identical Tool-conditioned Garbotoxin text. A predicate matching only BKP 57 misses rank 8's LTR 68 entirely and may miss an LTR 68 carrying the Tool in rank 16.

## Useful overlaps

- Ranks 9 and 15 contain both Path to the Peak and Silent Lab.
- Rank 7 contains both Wobbuffet and Snorlax PGO 55.
- Rank 21 contains both Path to the Peak and Wobbuffet.

## Policy-review implications

Current rank-1 v3 source inspection found:
- Gate suppression checks Path to the Peak, Active Wobbuffet, Active Iron Thorns, and Garbodor+Tool.
- A separate `pathLockStatus()` helper recognizes Silent Lab but is not used by the Gate predicate; Agent2 independently flagged this omission and the actor-only Stadium suppression epoch check.
- No Klefki check appears in the Gate predicate; its SVI 96 text is Active-only and suppresses Basic Pokémon abilities on both sides.
- `PRINT.garbodor` matches BKP 57 only, not LTR 68.

These are exact source-presence and code-coverage observations for reviewers to validate. Deck-list co-presence does **not** prove a Tool is attached or a lock is active in a game. No native game, matchup, competence attestation, or win-rate evidence follows from this census.
