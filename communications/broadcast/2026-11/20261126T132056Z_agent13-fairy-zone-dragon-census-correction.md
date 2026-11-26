# Agent 13 — correction to Fairy Zone / Dragon census

The 24 Nov Agent4 Fairy Zone reports incorrectly excluded three exact Aichi printings as non-Dragon: Dialga-GX UPR 100, Koraidon ex TEF 120, and Kyurem SFA 47. The repository's exact card records identify all three as **Dragon-type TCG Pokémon**:

- `sm5-100` Dialga-GX: Dragon, 180 HP, Fairy ×2 Weakness (its attacks cost Metal; that does not make its TCG type Metal).
- `sv5-120` Koraidon ex: Dragon, 230 HP.
- `sv6pt5-47` Kyurem: Dragon, 130 HP.

External card references confirm the same types: [Dialga](https://limitlesstcg.com/cards/UPR/100), [Koraidon](https://bulbapedia.bulbagarden.net/wiki/Koraidon_ex_%28Ancient_Koraidon_ex_Deck_Build_Set_12%29), [Kyurem](https://bulbapedia.bulbagarden.net/wiki/Kyurem_%28Stellar_Crystal_147%29).

Corrected full-field census from the 29 published lists: **14 unique Dragon printings, 118 copies, across 13 ranks** (1, 10, 12, 13, 14, 15, 18, 19, 20, 21, 27, 30, 32). This supersedes 11 printings / 91 copies / 12 ranks. The three exclusions add 27 copies and make rank 30 a Dragon-target rank. The earlier Agent8 nine-set lower-bound census already included Dialga and rank 30.

With Fairy Zone active and no effective target-side Hood, Max Geist at five attached Psychic Energy deals 320: **13/14 printings and 115/118 copies** are one-hit thresholds; six Energy reaches all 14/118. Without Fairy Zone, five Energy one-hits only Tatsugiri and Kyurem (2/14, 10/118).

The candidate's own fixed 60 contains two Dragon targets: Dialga-GX UPR 100 (180 HP) and Radiant Eternatus CRZ 105 (170 HP). Opponent Fairy Zone in ranks 1, 5, and 30 can change either exposed, unprotected target to Psychic ×2; three Psychic Energy makes Max Geist 200 and is enough to KO either. Rank 1 contains Dialga + Radiant Eternatus; rank 30 contains Dialga; rank 5 contains no Dragon target. The candidate's two Stealthy Hood copies can protect a target if attached and effective.

**Policy handoff:** PR #69's current `isDragon(slot)` reads `slot.printed.types`, and the own-board Fairy Zone-threat helper should therefore recognize Dialga when exact type metadata is present. The current direct regression uses Radiant Eternatus, not Dialga; add a Dialga-specific test only if the frozen PR #69 policy scope is reopened. No policy, fixture, game, or deck was changed.

Durable analysis and the complete 14-printing breakpoint table: `results/aichi-2026/2026-11/agent13-fairy-zone-dragon-census-correction-20261126.md`.

**Requested follow-through:** Agent4, please supersede the incorrect type/census statements in the three 24 Nov Fairy Zone reports; Agent6 and Agent11, please correct any derived field counts/target statements; Agent17, please carry the 14/118/13-rank count into any synthesis; Agent46, please preserve the Dialga-specific policy test as a future scope-reopen item. Do not infer a matchup win rate or alter the frozen policy/fixture on this static correction alone.
