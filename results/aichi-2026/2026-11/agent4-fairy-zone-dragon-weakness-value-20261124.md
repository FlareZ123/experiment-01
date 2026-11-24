# Fairy Zone value against the Aichi Dragon-target field

**Date:** 24 November 2026  
**Author:** Agent4  
**Status:** exact-card-pool weakness census; no matchup or game evidence

## Question

How much does Fairy Zone actually change the Weakness of the Dragon Pokémon in the 29 authenticated Aichi lists? The number of Dragon-containing lists alone does not show whether Fairy Zone creates a useful Psychic weakness or merely replaces an existing one.

## Method

- Joined `results/aichi-2026/full-decklists.json` against the exact card-pool records under `resources/cards/en/*.json`, using `resources/sets/en.json` to map PTCGO set codes to the correct card JSON.
- Used the 13 Dragon ranks identified in `results/aichi-2026/2026-11/agent46-aichi-weakness-modifier-field-coverage-20261114.md`.
- Counted only Pokémon printings with exact set and number matches; no inference from archetype names.
- This is a static decklist/card-text analysis. It does not imply all targets enter play or establish a matchup outcome.

## Findings

The 13 Dragon lists contain **118 Dragon Pokémon copies** across **14 unique printings**. None of those 14 printings has a printed Psychic Weakness. Twelve have no printed Weakness at all; two have Fairy ×2 Weakness.

| Dragon printing | Count across field | Printed Weakness |
|---|---:|---|
| Regidrago V SIT 135 | 44 | None |
| Regidrago VSTAR SIT 136 | 38 | None |
| Dialga-GX UPR 100 | 14 | Fairy ×2 |
| Dragapult ex TWM 130 | 12 | None |
| Kyurem SFA 47 | 11 | None |
| Noivern ex PAL 153 | 7 | None |
| Koraidon ex TEF 120 | 5 | None |
| Hisuian Goodra VSTAR LOR 136 | 4 | None |
| Mega Dragonite ex ASC 152 | 3 | None |
| Raging Bolt ex TEF 123 | 2 | None |
| Radiant Eternatus CRZ 105 | 1 | None |
| Salamence ex JTG 114 | 1 | None |
| Tatsugiri TWM 131 | 1 | None |
| Arceus & Dialga & Palkia-GX CEC 156 | 1 | Fairy ×2 |

**Consequence:** Fairy Zone does not merely improve an already-Psychic-weak target. For every Dragon printing in the authenticated field, it creates Psychic ×2 Weakness; for Dialga-GX and Arceus & Dialga & Palkia-GX it replaces Fairy ×2 with Psychic ×2. This is directly aligned with Shadow Rider Calyrex VMAX's Psychic attacks. It makes Fairy Zone a high-value damage modifier across the known Dragon field, subject to the Ability actually being active and the target not being protected by Stealthy Hood.

## Dragon copies by rank

| Rank | Archetype | Dragon Pokémon copies |
|---:|---|---:|
| 1 | Shadow Rider Calyrex | 2 |
| 10 | Regidrago | 12 |
| 12 | Regidrago | 13 |
| 13 | Regidrago | 12 |
| 14 | Regidrago | 13 |
| 15 | Lopunny Vileplume | 1 |
| 18 | Regidrago | 11 |
| 19 | Raging Bolt | 3 |
| 20 | Regidrago | 12 |
| 21 | Regidrago | 12 |
| 27 | Regidrago | 13 |
| 30 | Lillie's Clefairy | 1 |
| 32 | Regidrago | 13 |
| **Total** | **13 lists** | **118** |

## Policy implications

1. Do not optimize Fairy Zone as a marginal one-off Weakness bonus. It creates a new Psychic ×2 weakness on every Dragon printing in the 29-list field.
2. The evaluator must preserve the card's exact replacement semantics: Fairy Zone changes the target's Weakness to Psychic; it does not stack Psychic Weakness on top of the printed Weakness.
3. Correct source resolution and target-side Stealthy Hood handling matter materially. The candidate's fixed 60 has two Lillie's Clefairy ex, and the candidate's main Psychic attacker can exploit the modifier.
4. The target-side Hood check must not overestimate damage when Tool/Stadium status is unknown. If a Dragon has Stealthy Hood and its effectiveness is unknown, do not assume Fairy Zone applies.
5. Suppression and field access still matter: Path to the Peak and Silent Lab suppress Clefairy directly; the previous lock-overlap report identifies 7/13 Dragon ranks with one or both. The source resolver and Stadium-removal policy are both necessary.

## Limitations

- Three Aichi lists (ranks 23, 25, 28) remain missing; their Dragon printings and Weaknesses are unknown.
- Decklist counts are not board-state counts; not every Dragon is expected to be in play simultaneously.
- No games, matchup samples, policy competence, or win-rate claims are included.
- This analysis does not change the fixed candidate deck or nominate a new list.
