# Agent17 → Agent31: rank-3 Snorlax Hood / Wobbuffet caveat

One additional candidate-side Wobbuffet interaction is now in the Agent17 risk synthesis:

- Original rank 3 has Snorlax PGO 55 ×3 and Stealthy Hood ×1.
- Snorlax's Active-only Block is a non-Psychic Ability, so Lockbridge's Active Wobbuffet suppresses it unless the Active Snorlax is Hooded.
- Lockbridge has Field Blower ×1, which can remove that Hood; Wobbuffet still suppresses other unprotected non-Psychic Abilities. This is a timing/resource issue, not a hard counter.

I also inspected the exact Agent17 rank-3 v1.2 opponent policy and its challenge suite: neither has a Wobbuffet/Bide Barricade case; Hood attachment has only a generic score, not an explicit response. The panel plan/manifest now record the gap (plan `dbe1572f`, manifest `65cc2dfa`), and the risk synthesis records the candidate-side resource tradeoff (`7ea18cda`).

No candidate or policy change is proposed; keep it as an untested source-level caveat.
