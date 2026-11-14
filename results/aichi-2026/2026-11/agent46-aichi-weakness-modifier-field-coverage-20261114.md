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

The three known Fairy Zone lists mean that a blanket “any opponent Ability text containing Weakness → abstain” guard will lose explicit coverage against at least these three known field entries. The candidate's own list also contains Lillie's Clefairy ex, so its Fairy Zone must be modeled against opponent Dragon Pokémon. The opponent-side Fairy Zone is directional too: Hood v1's Latias ex SSP 76 is **Psychic type**, not Dragon, but its Dialga-GX UPR 100 is **Dragon type**. An opponent Fairy Zone can therefore change the Weakness of that Dialga-GX when it is in play; it does not change Latias ex, Shadow Rider VMAX, Mimikyu or Clefairy. The policy needs a board-aware, owner-relative model rather than a blanket opponent-Ability veto.

## Dragon-target coverage in the 29 lists

A second exact-printing scan of the same 29 lists finds Dragon-type Pokémon in **12 ranks**:
- Rank1 Shadow Rider Calyrex: Radiant Eternatus CRZ105 and Dialga-GX UPR100.
- Ranks10, 12, 13, 14, 18, 20, 21, 27 and 32: Regidrago variants with Regidrago V/VSTAR and supporting Dragon attackers (including Dragapult ex, Noivern ex, Hisuian Goodra VSTAR, Kyurem, Koraidon ex, Mega Dragonite ex, Salamence ex, or Dialga-GX depending on list).
- Rank15 Lopunny Vileplume: Tatsugiri TWM131.
- Rank19 Raging Bolt: Raging Bolt ex TEF123 and Arceus & Dialga & Palkia-GX CEC156.
- Rank30 Lillie's Clefairy: Dialga-GX UPR100.

This is where the candidate's own Fairy Zone can matter: it can make those opponent Dragon Pokémon Psychic-weakness targets. The three opponent Fairy Zone lists are ranks1, 5 and 30; ranks1 and 30 also contain Dragon Pokémon, while rank5's Fairy Zone can still affect the candidate's Dialga-GX if that card is on the board. The candidate's Dialga-GX UPR100 is Dragon; Latias ex SSP76 is Psychic. The missing ranks23,25,28 may add more Dragon targets.

## Policy implications

1. Evaluate Fairy Zone directionally and per Pokémon. Candidate Fairy Zone changes Weakness on opponent Dragon Pokémon. Opponent Fairy Zone changes Weakness on Hood v1's Dialga-GX UPR 100 (Dragon) when it is in play, but not Latias ex SSP 76 (Psychic) or the Psychic attackers. Do not treat the opponent's Fairy Zone as modifying the opponent's own Dragon targets.
2. Require the exact Lillie's Clefairy ex printing and an explicit live-Ability certificate. Apply known public suppression effects and abstain on unmodeled Ability locks.
3. Do not assume the presence of Clefairy alone proves Fairy Zone is active. Printed Ability names remain in actorObservation while suppressed.
4. For target damage, first resolve the target's printed type and existing Weakness/Resistance; then apply any modeled public Weakness modifiers, damage prevention/reduction, and target HP. If an unmodeled modifier can change the result, abstain.
5. The 17-text census is not exhaustive for Trainer/Tool/Attack effects or Abilities that also mention damage/prizes. Keep those effect classes separate.

## Limitations

- Only 29/32 complete lists are available; ranks 23, 25 and 28 remain missing. Their Ability content is unknown.
- The event is Japanese Extra, not a uniformly paper-Expanded-legal field. Existing scope audit identifies ranks 3, 6, 7, 24 and 29 as Extra-only incompatible; this audit does not resolve that format mismatch.
- No card Ability was proven active in a played game, and no matchup was simulated or competitively qualified.

## Reproduction

Run `python scripts/agent42-expanded-weakness-ability-census.py` against the repository card pool, then compare the emitted unique card/Ability printings with `results/aichi-2026/full-decklists.json`. The scan should remain source-locked and must not fill the three missing lists from archetype inference.
