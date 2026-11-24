# Aichi Top32: public Weakness-modifier Ability coverage in the 29 complete lists

**Status:** source-list coverage audit only. No matchup result, deck recommendation, or win-rate claim.

## Question

Which of the BW+ Expanded-legal Ability printings identified by the Weakness census actually occur in the currently authenticated Aichi Open League 2026 Top32 decklists, and what does that imply for a Fairy Zone damage evaluator?

## Method

- Input: `results/aichi-2026/full-decklists.json`, the 29 currently complete published 60-card lists.
- Ability census: `scripts/agent42-expanded-weakness-ability-census.py`, which scans the supplied Expanded-legal card pool for Ability text containing “Weakness” but not “damage” or “prize”.
- Match each decklist printing against the census's unique card/Ability names. Preserve exact set/number printings; do not infer missing lists.
- This is a static source-list audit. It does not establish which Abilities were played, active, or unsuppressed in any game.

## Findings

The 17-text Ability census intersects the 29 complete lists only at **Lillie's Clefairy ex / Fairy Zone**:

| Rank | Player | Archetype | Printing and count |
|---:|---|---|---|
| 1 | Yasunori Kato | Shadow Rider Calyrex | Lillie's Clefairy ex JTG 56 ×2 |
| 5 | Yamato Nakano | Mew Genesect | Lillie's Clefairy ex JTG 56 ×1 |
| 30 | Koki Takeda | Lillie's Clefairy | Lillie's Clefairy ex JTG 56 ×3 |

No other card from the 17-text Ability census appears in the 29 complete lists.

Two Vileplume lists are worth distinguishing because the Pokémon name alone is misleading:
- Rank2 Takahiro Ando's Vileplume Control uses Vileplume AOR 3, whose Ability is Irritating Pollen (Item lock), not the BW7 Allergy Panic Weakness modifier.
- Rank15 Ryotaro Nozawa's Lopunny Vileplume uses Vileplume AOR 3 and Vileplume BUS 6; BUS 6 has Disgusting Pollen (Basic-Pokémon attack restriction), not Allergy Panic.
Neither is a Weakness modifier from the census.

The three known Fairy Zone lists mean that a blanket “any opponent Ability text containing Weakness → abstain” guard will lose explicit coverage against at least these three known field entries. The candidate's own list also contains Lillie's Clefairy ex, so its Fairy Zone must be modeled against opponent Dragon-type Pokémon. **Corrected card-type check:** the candidate's Radiant Eternatus CRZ 105 is Dragon type; its Dialga-GX UPR 100 is Metal type, and Latias ex SSP 76 is Psychic type. Opponent Fairy Zone can therefore change the candidate's Radiant Eternatus Weakness, but not its Dialga-GX. Fairy Zone is directional and applies only to cards whose TCG `types` include Dragon, not to Pokémon species with Dragon identity/name.

## Dragon-target coverage in the 29 lists

A corrected exact-card-type join of `results/aichi-2026/full-decklists.json` against `resources/cards/en/*.json` (set codes mapped through `resources/sets/en.json`) finds Dragon-type Pokémon in **12 ranks**, not 13: ranks 1, 10, 12, 13, 14, 15, 18, 19, 20, 21, 27, and 32. These lists contain **91 Dragon Pokémon copies across 11 unique Dragon-type printings**.

- Rank1 Shadow Rider Calyrex: Radiant Eternatus CRZ 105 ×1. Dialga-GX UPR 100 is Metal, not Dragon.
- Ranks10, 12, 13, 14, 18, 20, 21, 27, 32: Regidrago V/VSTAR plus exact Dragon-type support printings (Dragapult ex, Noivern ex, Hisuian Goodra VSTAR, Mega Dragonite ex, Salamence ex, depending on list). Koraidon ex TEF 120 is Fighting and Kyurem SFA 47 is Water; neither is a Fairy Zone target.
- Rank15 Lopunny Vileplume: Tatsugiri TWM 131 ×1.
- Rank19 Raging Bolt: Raging Bolt ex TEF 123 ×2 and Arceus & Dialga & Palkia-GX CEC 156 ×1.
- Rank30 Lillie's Clefairy: no Dragon-type Pokémon. Dialga-GX UPR 100 is Metal.

The 11 unique Dragon printings are Radiant Eternatus CRZ 105, Regidrago V SIT 135, Regidrago VSTAR SIT 136, Dragapult ex TWM 130, Hisuian Goodra VSTAR LOR 136, Noivern ex PAL 153, Salamence ex JTG 114, Mega Dragonite ex ASC 152, Tatsugiri TWM 131, Raging Bolt ex TEF 123, and Arceus & Dialga & Palkia-GX CEC 156. Ten have no printed Weakness; ADP-GX has Fairy ×2; none has Psychic Weakness. Fairy Zone creates Psychic ×2 Weakness on all 11. Full per-printing counts, HP, Weakness, and Max Geist breakpoints are in [Agent4's corrected Dragon-type census](agent4-fairy-zone-dragon-weakness-value-20261124.md) and [Max Geist breakpoint analysis](agent4-fairy-zone-max-geist-breakpoints-20261124.md).

The three opponent Fairy Zone lists remain ranks1, 5, and 30. They can change the candidate's Radiant Eternatus CRZ 105 (Dragon) to Psychic ×2 Weakness; they cannot change the candidate's Dialga-GX UPR 100 (Metal). Rank1 also contains Radiant Eternatus, which the candidate's own Fairy Zone can affect. The missing ranks23, 25, and 28 may add further Dragon targets.

## Policy implications

1. Evaluate Fairy Zone directionally and per Pokémon. Candidate Fairy Zone changes Weakness on opponent Dragon-type Pokémon; opponent Fairy Zone changes Weakness on the candidate's Radiant Eternatus CRZ 105, not its Metal Dialga-GX UPR 100.
2. Use exact TCG `types` for Dragon membership. Do not classify Dialga-GX UPR 100, Koraidon ex TEF 120, or Kyurem SFA 47 as Fairy Zone targets.
3. The candidate's 2 Lillie's Clefairy ex can target 91 Dragon Pokémon copies in 12 known ranks. Ten of the 11 unique printings have no Weakness; ADP-GX has Fairy ×2; none has Psychic Weakness, so Fairy Zone creates Psychic ×2 on all 11.
4. The candidate's Radiant Eternatus is vulnerable to opponent Fairy Zone in ranks1,5,30. Candidate has two Stealthy Hood; ranks1/5/30 have no Hood but have Field Blower (1/1/3 copies), so Hood is a tactical protection window, not permanent safety.
5. In rank1, both sides have Radiant Eternatus and Fairy Zone. Candidate has two Hoods; rank1 has none. Candidate can protect its own Radiant Eternatus while targeting the opponent's unprotected Radiant Eternatus, subject to Field Blower.
6. For the candidate's own Fairy Zone, Path to the Peak / Silent Lab intersect 7/12 Dragon ranks (12,13,15,20,21,27,32) and directly suppress Clefairy; Hood cannot bypass them. Flutter Mane occurs in rank19 and is Active-only. Wobbuffet occurs in ranks10/21 but exempts Psychic Clefairy.
7. Source-owner-aware Hood logic and source-suppression status still matter, but no corrected Dragon rank contains Iron Thorns, Garbodor, or Klefki. Do not overstate their Aichi Dragon-matchup frequency.

## Limitations

- Only 29/32 complete lists are available; ranks 23, 25 and 28 remain missing. Their Ability content is unknown.
- The event is Japanese Extra, not a uniformly paper-Expanded-legal field. Existing scope audit identifies ranks 3, 6, 7, 24 and 29 as Extra-only incompatible; this audit does not resolve that format mismatch.
- No card Ability was proven active in a played game, and no matchup was simulated or competitively qualified.

## Reproduction

Join exact Pokémon printings in `results/aichi-2026/full-decklists.json` to the repository card records under `resources/cards/en/*.json`, using `resources/sets/en.json` to map PTCGO set codes. Filter by `card.types` containing `Dragon`; do not infer type from species name or card name. Keep the three missing lists (23,25,28) unknown. The Ability-text census remains reproducible with `python scripts/agent42-expanded-weakness-ability-census.py`, but that script alone does not establish Dragon-type membership.
