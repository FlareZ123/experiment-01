# Rank 7 Snorlax Stall: Megaton Blower makes the two-Hood plan a resource war

**Agent 17 · 17 November 2026 · paper-list/card-text analysis only**

## Conclusion

Rank 7 is materially more hostile to Hood Shield v1's two-Stealthy-Hood package than rank 1 or rank 31. The published rank 7 list has **Tool Jammer ×1, Field Blower ×1, Megaton Blower ×1, Faba ×2**, plus **VS Seeker ×3 and Lusamine ×2**. Megaton Blower discards *all* Pokémon Tools attached to all of the candidate's Pokémon in one play; Field Blower can discard up to two Tools/Stadiums; Faba can put one attached Tool into the Lost Zone and is recyclable through the Supporter recovery package. Two Hoods are therefore not a durable lock against this list.

The candidate's Arven → Field Blower + Hood line still has a clear immediate purpose: remove the opponent's Active Tool Jammer, attach Hood to the trapped Active, then escape Snorlax Block. But the follow-up is a multi-turn resource fight, not a stable two-Hood shield. Acerola is a separate emergency bypass if the trapped Active is already damaged.

## Exact list facts

| Seat | Relevant published cards |
|---|---|
| Hood Shield v1 | Stealthy Hood ×2; Field Blower ×1; Arven ×1; Acerola ×1; VS Seeker ×2; Latias ex ×1 |
| Rank 7 Snorlax Stall | Snorlax PGO 55 ×2; Tool Jammer ×1; Field Blower ×1; Megaton Blower ×1; Faba ×2; Wobbuffet PHF 36 ×3; Mimikyu PAL 97 ×3; VS Seeker ×3; Lusamine ×2 |

## Printed interactions

- **Snorlax Block:** while Snorlax is Active, the opponent's Active Pokémon cannot retreat. Stealthy Hood on the candidate's Active prevents the opponent's Ability effect; if Tool Jammer is attached to the opponent's Active, it suppresses Pokémon Tools on the candidate's Active until removed.
- **Candidate escape turn:** Arven can search Field Blower + Hood. Play Field Blower to remove the Active Tool Jammer, attach Hood to the trapped Active, then retreat. If the Active is Basic, Latias ex's Skyliner makes it free to retreat; if it is a VMAX, Latias ex does not reduce its retreat cost, so Energy or another switch effect is still required.
- **Opponent Tool removal:** Field Blower discards up to two Tools/Stadiums. Megaton Blower discards all Pokémon Tools and Special Energy attached to all of the candidate's Pokémon, plus a Stadium. Faba sends one attached Tool/Special Energy or Stadium to the Lost Zone. Rank 7 has one copy each of Field Blower and Megaton Blower plus Faba ×2; VS Seeker ×3 and Lusamine ×2 can recover Supporters such as Faba. Holding the second Hood avoids exposing both to a two-target Field Blower, but does not protect an attached Hood from Megaton Blower or repeated Faba.
- **Wobbuffet PHF 36:** Bide Barricade removes Abilities from non-Psychic Pokémon while Wobbuffet is Active. Hood Shield's main engine Pokémon (Shadow Rider VMAX, Trevenant & Dusknoir-GX, Mimikyu, Tapu Lele-GX, Lillie's Clefairy ex, and Latias ex) are Psychic, so they are exempt. Do not spend a Hood merely to protect Shadow Rider's Underworld Door or Latias ex's Skyliner from Wobbuffet.
- **Mimikyu PAL 97:** Safeguard prevents damage from attacks by Pokémon V and Pokémon ex. Shadow Rider VMAX and Lillie's Clefairy ex cannot damage it; the candidate must use non-V/non-ex attackers such as Trevenant & Dusknoir-GX or its own Mimikyu. This is a separate attack-selection constraint, not a Tool-removal issue.
- **Acerola fallback:** if the trapped Active has damage counters, Acerola can return it and all attached cards to hand. This is not a retreat and bypasses Block, but consumes the Supporter for the turn and returns Energy/Tools/evolution cards. Rank 7 has no persistent Item lock, so VS Seeker can recover Acerola later.

## Policy implications

1. Use the Arven + Field Blower + Hood sequence for the immediate Snorlax/Tool Jammer escape, not as a promise of lasting protection.
2. Do not attach both Hoods while Field Blower or Megaton Blower remains available unless the board requires it. The second Hood is a reserve, but Megaton Blower removes it if already attached and Faba can remove Tools repeatedly.
3. Track whether the Active is Basic or VMAX: Latias ex gives free retreat only to Basic Pokémon. A VMAX still needs a payable retreat cost or another switch effect.
4. If the trapped Active is damaged, compare Acerola's Supporter/attachment cost against the Arven line. Acerola bypasses Block without needing Hood or Field Blower, but it is unavailable on an undamaged Active.
5. Do not overreact to Wobbuffet by spending Hood on the Psychic engine; the candidate's main Psychic Pokémon are exempt from Bide Barricade. Preserve Hood for Block/Tool Jammer or another Ability that actually affects the attached target.

## Evidence boundary

- Counts are direct from `results/aichi-2026/full-decklists.json`.
- Megaton Blower, Field Blower, Tool Jammer, Faba, Wobbuffet, Mimikyu, and Snorlax text is from the pinned local card pool (`resources/cards/en/sv8.json`, `sm2.json`, `swsh5.json`, `sm8.json`, `xy4.json`, `sv2.json`, `pgo.json`).
- The Arven/retreat and Acerola lines are card-text deductions. No new native sequence, source-dealt game, fixture, policy code, or matchup result was produced.
