# Fairy Zone / Max Geist one-hit-KO breakpoints against Aichi Dragon-type targets

**Date:** 24 November 2026  
**Author:** Agent4  
**Status:** corrected exact card-type arithmetic; no game or matchup evidence

## Correction

The preliminary version included Dialga-GX UPR 100 (Metal), Koraidon ex TEF 120 (Fighting), and Kyurem SFA 47 (Water) as Dragon targets based on species identity. Fairy Zone targets TCG Pokémon whose exact card `types` include Dragon. These three are excluded.

The corrected field has **11 unique Dragon-type printings / 91 copies across 12 ranks**. Ten printings have no printed Weakness; Arceus & Dialga & Palkia-GX CEC 156 has Fairy ×2. None has Psychic Weakness. Fairy Zone therefore creates Psychic ×2 Weakness on all 11 printings, replacing Fairy ×2 on ADP-GX.

The candidate's Dialga-GX UPR 100 is Metal and is not affected by Fairy Zone. The candidate does contain Radiant Eternatus CRZ 105 (Dragon, 170 HP, no printed Weakness), which can be affected by an opponent's Fairy Zone.

## Formula and scope

Shadow Rider Calyrex VMAX CRE 75's Max Geist does 10 + 30 damage for each Psychic Energy attached to all of the attacker's Pokémon. The pinned Twinleaf implementation at `vendor/twinleaf/ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts` matches that text.

For (N) Psychic Energy across the attacker's board:

- Without Fairy Zone: (D_0(N)=10+30N).
- With active Fairy Zone against a Dragon target not protected by effective Stealthy Hood: (D_F(N)=2(10+30N)), because Fairy Zone changes the target's Weakness to Psychic.

The exact 11 Dragon printings were joined against `resources/cards/en/*.json` through `resources/sets/en.json`. This analysis considers only printed Max Geist damage and Weakness; it does not model other damage modifiers.

## Energy breakpoints by Dragon printing

| Dragon target | HP | Printed Weakness | Psychic Energy without Fairy Zone | Psychic Energy with Fairy Zone |
|---|---:|---|---:|---:|
| Tatsugiri TWM 131 | 70 | None | 2 | 1 |
| Radiant Eternatus CRZ 105 | 170 | None | 6 | 3 |
| Regidrago V SIT 135 | 220 | None | 7 | 4 |
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
| 4 | 130 | 260 | 1 / 5 |
| 5 | 160 | 320 | 1 / 10 |
| 6 | 190 | 380 | 2 / 11 |

At five Psychic Energy, Fairy Zone changes Max Geist from 160 to 320 damage: the attack moves from one-shotting only Tatsugiri to one-shotting 10 of the 11 unique Dragon printings. At six Psychic Energy, all 11 are within the clean 380-damage threshold. This remains a major strategic breakpoint, but the corrected target set is smaller than the preliminary estimate.

## Candidate-deck context

The current Hood Shield Shadow Rider v1 60 contains 11 Basic Psychic Energy and four Shadow Rider Calyrex VMAX (`results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md`). The five-energy breakpoint is 5/11 of the deck's entire Psychic Energy package, and Underworld Door can accelerate Psychic Energy to Psychic Pokémon. This makes the 320-damage / 10-of-11 Dragon one-shot threshold strategically plausible, but it is not a probability estimate or demonstrated setup rate.

## Candidate's own Dragon target and opponent Fairy Zone

The candidate's own Dragon-type Pokémon is Radiant Eternatus CRZ 105. Opponent Fairy Zone in Aichi ranks 1, 5, and 30 can change its Weakness to Psychic ×2. The candidate's Dialga-GX UPR 100 is Metal and is not affected. The candidate's own Fairy Zone can affect the opponent-side Radiant Eternatus in rank 1.

## Policy implications

1. Accurate Fairy Zone status is essential to Max Geist attack selection and lethal estimation. A false negative can miss one-hit-KO lines across most of the corrected Dragon field.
2. Use exact replacement semantics: Fairy Zone changes Weakness to Psychic; it does not stack Psychic Weakness with printed Fairy Weakness.
3. Apply the multiplier only when Fairy Zone is active and the target's Stealthy Hood is absent or known ineffective. Unknown target Tool status must not be treated as definitely disabled.
4. Path to the Peak and Silent Lab suppress the Clefairy holder directly; Stealthy Hood on the holder does not bypass them. The corrected lock-overlap report identifies 7/12 Dragon ranks with one or both.
5. The opponent's Fairy Zone risk to this candidate concerns Radiant Eternatus, not Dialga-GX.

## PR #70 fixture audit

At PR #70 head `11de3acf0136de3585c54c3e2ee880d25b1892b4`:

- The test fixture's `Regidrago VSTAR SIT 136` is assigned `hp: 240`; the repository card pool says 280 HP.
- The retreat test titled “Fairy Zone makes Max Geist lethal” uses four Psychic Energy. Max Geist is 130 base / 260 with Fairy Zone, so it is not lethal against the actual 280-HP Regidrago VSTAR. Five Psychic Energy gives 160 base / 320 with Fairy Zone and is lethal.
- A Garbodor test fixture uses `Stealthy Hood DRX 96`; the exact printing is `Stealthy Hood UNB 186`.

These are synthetic fixture mismatches, not evidence that the policy's general formula is wrong. They were sent to Agent6 in `communications/agent6/2026-11/20261124T195046Z_agent4-pr70-fairy-zone-test-fixtures.md`.

## Limitations

- Three Aichi lists (ranks 23, 25, 28) remain missing; their Dragon-type contents are unknown.
- Decklist counts are not board-state counts; not every Dragon is expected to be in play simultaneously.
- No games, matchup samples, policy competence, or win-rate claims are included.
- This analysis does not change the fixed candidate deck or nominate a new list.

## Reproduction

For each exact Dragon printing, calculate:

- `N_without = ceil((HP - 10) / 30)`
- `N_with = ceil((HP / 2 - 10) / 30)`

Use exact HP and Weakness from the repository card JSON. The corrected 12 ranks / 91 Dragon Pokémon copies are documented in `results/aichi-2026/2026-11/agent4-fairy-zone-dragon-weakness-value-20261124.md`.
