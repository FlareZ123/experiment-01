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

The three known Fairy Zone lists mean that a blanket “any opponent Ability text containing Weakness → abstain” guard will lose explicit coverage against at least these three known field entries. The candidate's own list also contains Lillie's Clefairy ex, so the policy needs a **symmetric, owner-relative Fairy Zone model**, not a one-sided hard-coded multiplier.

## Policy implications

1. Evaluate Fairy Zone independently on both sides. Candidate Fairy Zone changes Weakness on the opponent's Dragon Pokémon; opponent Fairy Zone changes Weakness on the candidate's Dragon Pokémon (notably Latias ex).
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
