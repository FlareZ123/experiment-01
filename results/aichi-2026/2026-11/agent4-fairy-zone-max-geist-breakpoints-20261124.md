# Fairy Zone / Max Geist one-hit-KO breakpoints against Aichi Dragon targets

**Date:** 24 November 2026  
**Author:** Agent4  
**Status:** exact card-pool arithmetic; no game or matchup evidence

## Formula and scope

Shadow Rider Calyrex VMAX CRE 75's Max Geist does 10 + 30 damage for each Psychic Energy attached to all of the attacker's Pokémon. The pinned Twinleaf card implementation at `vendor/twinleaf/ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts` matches that text.

For (N) Psychic Energy across the attacker's board:

- Without Fairy Zone: (D_0(N)=10+30N).
- With active Fairy Zone against a Dragon target not protected by effective Stealthy Hood: (D_F(N)=2(10+30N)), because Fairy Zone changes the target's Weakness to Psychic.

The exact 14 Dragon printings in the 13 authenticated Aichi lists were joined to `resources/cards/en/*.json` using `resources/sets/en.json`. None has printed Psychic Weakness: 12 have no printed Weakness, and Dialga-GX UPR 100 / Arceus & Dialga & Palkia-GX CEC 156 have Fairy ×2. Fairy Zone therefore creates a Psychic ×2 Weakness on every one of these printings.

## Energy breakpoints by Dragon printing

The table gives the minimum total Psychic Energy on the attacker's board needed for a clean one-hit KO, considering only Max Geist's printed damage and Weakness.

| Dragon target | HP | Printed Weakness | Psychic Energy without Fairy Zone | Psychic Energy with Fairy Zone |
|---|---:|---|---:|---:|
| Tatsugiri TWM 131 | 70 | None | 2 | 1 |
| Kyurem SFA 47 | 130 | None | 4 | 2 |
| Radiant Eternatus CRZ 105 | 170 | None | 6 | 3 |
| Dialga-GX UPR 100 | 180 | Fairy ×2 | 6 | 3 |
| Regidrago V SIT 135 | 220 | None | 7 | 4 |
| Koraidon ex TEF 120 | 230 | None | 8 | 4 |
| Raging Bolt ex TEF 123 | 240 | None | 8 | 4 |
| Noivern ex PAL 153 | 260 | None | 9 | 4 |
| Hisuian Goodra VSTAR LOR 136 | 270 | None | 9 | 5 |
| Regidrago VSTAR SIT 136 | 280 | None | 9 | 5 |
| Arceus & Dialga & Palkia-GX CEC 156 | 280 | Fairy ×2 | 9 | 5 |
| Dragapult ex TWM 130 | 320 | None | 11 | 5 |
| Salamence ex JTG 114 | 320 | None | 11 | 5 |
| Mega Dragonite ex ASC 152 | 370 | None | 12 | 6 |

## Aggregate breakpoints

| Psychic Energy on board | Max Geist without Fairy Zone | Max Geist with Fairy Zone | Dragon printings one-shot without / with Fairy Zone |
|---:|---:|---:|---:|
| 4 | 130 | 260 | 1 / 8 |
| 5 | 160 | 320 | 2 / 13 |
| 6 | 190 | 380 | 4 / 14 |

At five Psychic Energy, Fairy Zone changes Max Geist from 160 to 320 damage: the attack moves from one-shotting only Tatsugiri and Kyurem to one-shotting 13 of the 14 unique Dragon printings. At six Psychic Energy, all 14 are within the clean 380-damage threshold. This is a major strategic breakpoint, not a marginal bonus.

## Policy implications

1. Accurate Fairy Zone status is essential to Max Geist attack selection and lethal estimation. A false negative can miss one-hit-KO lines across most of the Dragon field.
2. The policy must use exact replacement semantics: Fairy Zone changes Weakness to Psychic; it does not stack Psychic Weakness with printed Fairy Weakness.
3. The multiplier applies only when Fairy Zone is active and the target's Stealthy Hood is known ineffective or absent. Unknown target Tool status must not be treated as definitely disabled.
4. Path to the Peak and Silent Lab suppress the Clefairy holder directly; Stealthy Hood on the holder does not bypass them. The prior lock-overlap cross-tab identifies 7/13 Dragon ranks with one or both.
5. This arithmetic does not model damage reduction, healing, protection, damage counters, other attack modifiers, or actual board development. It is a threshold analysis, not evidence of matchup win rate.

## Reproduction

For each exact Dragon printing, calculate:

- `N_without = ceil((HP - 10) / 30)`
- `N_with = ceil((HP / 2 - 10) / 30)`

Use the exact HP and Weakness from the repository card JSON. The 13 ranks / 118 Dragon Pokémon copies are documented in `results/aichi-2026/2026-11/agent4-fairy-zone-dragon-weakness-value-20261124.md`.


## Test-fixture audit against current PR #70

At PR #70 head `11de3acf0136de3585c54c3e2ee880d25b1892b4`:

- The test fixture's `Regidrago VSTAR SIT 136` is assigned `hp: 240`; the repository card pool says 280 HP.
- The retreat test titled “Fairy Zone makes Max Geist lethal” uses four Psychic Energy. Max Geist is 130 base / 260 with Fairy Zone, so it is not lethal against the actual 280-HP Regidrago VSTAR. Five Psychic Energy gives 160 base / 320 with Fairy Zone and is lethal.
- A Garbodor test fixture uses `Stealthy Hood DRX 96`; the exact printing is `Stealthy Hood UNB 186`.

These are synthetic fixture mismatches, not evidence that the policy's general formula is wrong. They were sent to Agent6 in `communications/agent6/2026-11/20261124T195046Z_agent4-pr70-fairy-zone-test-fixtures.md`.
