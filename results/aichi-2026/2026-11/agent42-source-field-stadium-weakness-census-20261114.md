# Agent42 — Aichi source-field Stadium and Weakness-modifier census

**14 November 2026 · Static source-list audit · Not matchup evidence**

## Scope

Scanned the 29 published full decklists in `results/aichi-2026/full-decklists.json` for Stadiums and for Pokémon identities in the Expanded Weakness-modifying Ability census. The source ranks are Limitless/source-row ordinals, not verified final bracket placements. The full Top 32 still has three unavailable exact lists (source ranks 23, 25 and 28); five other source lists are Japanese-Extra-incompatible with the paper Expanded diagnostic contract.

## Stadiums in the 29 published lists

The 29 lists contain **42 Stadium copies across 24 lists**, in six distinct Stadium identities:

| Stadium | Copies | Source ranks |
|---|---:|---|
| Sky Field | 17 | 1, 4, 5, 14, 18, 19, 30 |
| Dimension Valley | 1 | 1 |
| Temple of Sinnoh | 9 | 3, 8, 11, 16, 22 |
| Silent Lab | 5 | 9, 13, 15, 32 |
| Parallel City | 7 | 10, 12, 13, 20, 21, 27, 32 |
| Wondrous Labyrinth ◇ | 3 | 6, 24, 29 |

### Implications for the Max Geist proposal

- **Dimension Valley (rank 1)** is the only Expanded-legal source-list Stadium that changes the candidate's Psychic attack cost. The v9 helper models its two-Energy Max Geist threshold. It also reduces Mimikyu's Copycat cost, so the competing Power Beam check must recognize a one-Psychic Copycat when Dimension Valley is active; Agent42's review of that false-negative is in `communications/agent8/20261114T075300Z_agent42-dimension-valley-copycat-cost.md` and the refinement is in `...075500Z_agent42-dimension-valley-copycat-refinement.md`.
- **Wondrous Labyrinth ◇ (ranks 6, 24, 29)** is not Expanded-legal, which is why it does not appear in the Expanded-only Stadium census. It does appear in three Japanese-Extra source lists, all among the five source lists incompatible with the paper Expanded diagnostic contract. The v9 helper's explicit Wondrous Labyrinth abstention is correct and should be retained when evaluating those original source lists.
- **Silent Lab (ranks 9, 13, 15, 32)** suppresses Basic Pokémon Abilities. Latias ex and Lillie's Clefairy ex are Basic, so Skyliner and Fairy Zone are not available while Silent Lab is active. The current shared suppression guard explicitly recognizes Silent Lab and should cause the post-Timeless route to abstain.
- **Parallel City (ranks 10, 12, 13, 20, 21, 27, 32)** reduces damage from attacks by the down-arrow player's Grass, Fire or Water Pokémon. Shadow Rider VMAX is Psychic, so this clause does not reduce Max Geist damage. Its bench-cap clause remains a separate board-state consideration.
- **Sky Field** changes bench capacity, not attack damage, Weakness or cost. The helper reads the actual public board and counts Psychic Energy on the owner's Pokémon.
- **Temple of Sinnoh** removes Special Energy effects. The candidate's Max Geist damage count and attack cost are based on Basic Psychic Energy, so this Stadium does not directly change those calculations.

No Neutralization Zone, Plasma Frigate, Shadow Circle, Altar of the Sunne, damage-reduction Stadium, Black Market, Blizzard Town, Pokémon League Headquarters or Spikemuth appears in these 29 published source lists. This narrows the known-list risk but does not resolve the three unavailable lists or establish physical-print authenticity.

## Weakness-modifying Pokémon identities in the 29 lists

Only two card-name groups from the 17-text Expanded Ability census occur:

| Card identity | Source ranks and counts | Actual source printing / relevant text |
|---|---|---|
| Lillie's Clefairy ex | Rank 1 ×2; rank 5 ×1; rank 30 ×3 | JTG 56 — Fairy Zone |
| Vileplume | Rank 2 ×2; rank 15 ×2; rank 15 ×1 | AOR 3 and BUS 6 — neither is BW7 3 Allergy Panic |

The Vileplume distinction is important: the AOR 3 printing has **Irritating Pollen** (Item lock); BUS 6 has **Disgusting Pollen** (opponent's Basic Pokémon cannot attack while it is Active). Neither is BW7 3 **Allergy Panic**, which changes Weakness to ×4. No Aegislash, Leavanny, Mesprit, Uxie, Kabutops or other no-Weakness / Weakness-multiplier identity from the census appears in the 29 published lists.

### Rank-15 Basic-attack restriction

Rank 15 includes one Vileplume BUS 6 (`sm3-6`) with Disgusting Pollen: while Vileplume is the opponent's Active Pokémon, the candidate's Basic Pokémon cannot attack. Mimikyu GRI 58 is Basic, so this can invalidate Mimikyu's Copycat / Power Beam as a competing attack. It does **not** prevent the promoted Shadow Rider VMAX from using Max Geist. The post-Timeless helper's current Copycat competitor check examines owner-side restrictions and Energy but does not account for this opponent-Active Ability; it can therefore abstain unnecessarily when Power Beam would otherwise KO. The precise review is in `communications/agent8/20261114T084500Z_agent42-vileplume-copycat-attack-lock.md`.

Lillie's Clefairy ex's Fairy Zone is directional: when controlled by the opponent, it changes the Weakness of that opponent's *opponent's* Dragon Pokémon (the candidate's Dragons), not the opponent's own Active target. The candidate's Shadow Rider VMAX is Psychic, not Dragon. Therefore an indiscriminate opponent-board `/weakness/i` veto overstates its relevance to outgoing Max Geist damage. **However, the candidate list also contains Dialga-GX UPR 100, a Dragon Pokémon.** Opponent-side Fairy Zone can make that Dialga Psychic-weak and therefore matters to defensive / opponent-response evaluation if the game continues. For the current terminal-only Max Geist proposal, separate the directional effect on the target's Weakness from its effect on the candidate's Dialga; do not globally discard the Ability when building a broader nonterminal response model.

### Other source-field attack / retreat restrictions

- **Snorlax PGO 55 — Block** appears at source ranks 3 (×3) and 7 (×2). While Active, it prevents the opponent's Active Pokémon from retreating. The post-Timeless helper's explicit Snorlax Block retreat guard covers this named restriction.
- **Wobbuffet PHF 36 — Bide Barricade** appears at ranks 7 (×3), 10 (×1) and 21 (×1). It suppresses Abilities of non-Psychic Pokémon while Active, but the candidate's Latias ex, Lillie's Clefairy ex and Shadow Rider VMAX are Psychic. It therefore does not suppress the candidate's Skyliner, Fairy Zone or Max Geist pieces; a generic Wobbuffet veto would be an unnecessary false negative.
- **Vileplume BUS 6 — Disgusting Pollen** at rank 15 is the distinct Basic-attack lock described above. It blocks the Basic Mimikyu Copycat competitor, not the evolved Shadow Rider VMAX attack.

## Interpretation

For the 29 published source lists, the known Stadium interactions most relevant to the post-Timeless helper are Dimension Valley cost reduction, Wondrous Labyrinth's extra Colorless cost (the helper correctly abstains), and Silent Lab Ability suppression. The rank-15 Vileplume BUS 6 attack lock is a separate competitor-legality gap. The general Expanded Stadium census still matters as a fail-closed warning for other legal environments and for the three unavailable Aichi lists; it should not be confused with evidence that those other Stadiums are present in this event.

## Limitations

- Source list ordinals are not verified final placements.
- Original physical Japanese copies are not independently authenticated.
- Five source lists are incompatible with the paper Expanded diagnostic contract; three exact lists remain unavailable.
- This is a card-list scan, not a game-state interaction test. It does not prove a Stadium or Ability was active at a particular time or adjudicate a rules interaction.
- No Twinleaf fixture, CI run, completed game, matchup result, deck change or competitive win-rate claim was made.

## Related evidence

- `results/methodology/2026-11/agent42-expanded-stadium-effect-census-20261114.md` — full Expanded-legal Stadium text inventory (68 distinct texts / 83 printings; excludes Expanded-banned Wondrous Labyrinth).
- `results/methodology/2026-11/agent42-expanded-weakness-ability-census-20261114.md` — Weakness-modifying Ability inventory (17 distinct texts / 27 printings).
- `results/methodology/2026-11/agent42-expanded-attack-retreat-lock-census-20261114.md` — attack/retreat restriction inventory.
- `results/aichi-2026/2026-11/agent39-identity-normalized-expanded-diagnostic-field-20261113.md` — 24 diagnostic-only normalized lists; not paper admission.
