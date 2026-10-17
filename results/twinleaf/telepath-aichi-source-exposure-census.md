# Telepath attachment-origin bug: exact Aichi field exposure bounds

**Agent 3, 17 October 2026.** Evidence class: exact published-list census, inspection of the pinned Twinleaf source, and independent source-card text. This is **not** an observed game-frequency or win-rate study.

## Reproducible known-list census

The source for the [Aichi published exact lists](../aichi-2026/full-decklists.json) currently contains **29 of 32** registered 60-card decks; ranks **23, 25 and 28** still lack full lists. [The standalone census](../../scripts/aichi-telepath-source-inventory.cjs) with [regression assertions](../../tests/aichi-telepath-source-inventory.test.cjs) counts exact `Telepathic Psychic Energy` printings directly from those source rows.

| Rank | Published archetype | Exact `POR 88` copies | Other co-occurring relevant cards |
| --- | --- | ---: | --- |
| 9 | Absol Electrode | 1 | No Minior, Wondrous Patch or Raihan |
| 30 | Lillie's Clefairy | 2 | 1 Minior PAR 99, 4 Wondrous Patch PFL 94, 1 Raihan EVS 152 |
| 31 | Dusknoir Chimecho | 3 | No Minior, Wondrous Patch or Raihan |

**Six copies across exactly three observed lists**, with all exact published records specifying `POR 88`. The three unpublished decks may or may not contain this card. Known inventory exposure therefore has an exact numerator for the 29 published lists; it is not a claim that the other 26 published opponents avoid all other `AttachEnergyEffect` problems. The independently sourced **52nd-place New Moon 60** additionally contains three copies and is outside the benchmark Top 32.

## Source-engine risk versus actual in-game exposure

The previously [compiled two-seat Sol Burst-GX negative repro](telepath-attachment-source-confusion.md) establishes two **staged** pinned Twinleaf defects: a deck-origin Telepathic Psychic Energy wrongly activates its *from-hand-only* search, and the attached physical Energy also remains in the deck. The bug's `AttachEnergyEffect` source-zone confusion is genuine in that selected path. **Solgaleo-GX UPR is the adversarial test donor, not a registered Pokémon in these 29 inventories.** This census alone does not show that any listed deck executed a non-hand Telepath attach.

The rank-30 co-occurrences require especially careful interpretation. According to the printed Wondrous Patch text (PFL 94), it attaches a **Basic Psychic Energy** from discard to a **Benched Psychic Pokémon**. Telepath is Special Energy, while Minior PAR 99 is Fighting-type, so this Item is neither a route for moving Telepath from discard nor a legal target route to Minior. Pinned Twinleaf `WonderPatch` uses `MOVE_CARDS` rather than `AttachEnergyEffect` in that path. Raihan EVS 152 similarly attaches only **Basic Energy** from discard and its pinned reducer uses `MOVE_CARDS`; it cannot supply deck/discard Telepath and does not establish that Minior's *from-hand-only* switching Ability misfires in an actual source game.

By contrast, the [pinned Minior PAR code](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-paradox-rift/minior.ts) checks `AttachEnergyEffect` on itself without directly checking its printed *from hand* condition. That is a **code-inspection risk**, not yet a demonstrated non-hand Minior trigger. Minior's source-match exposure requires a qualifying non-hand event reaching that reducer; the rank-30 Item and Supporter above do not supply one through their pinned implementations.

## Next acceptance gate

To determine actual Aichi impact, instrument authentic source-dealt games of ranks 9, 30, and 31 with card-instance identifiers, pre/post location across hand/deck/discard/active/Bench, attack/Ability/Item cause, `AttachEnergyEffect` occurrence, and the card's source location **before** any effect changes it. Require conservation of each physical Energy card and assert the absence of Telepath Basic search when its Energy came from outside hand. Independently test Minior with one true non-hand `AttachEnergyEffect` and one ordinary manual hand attachment. Include both seating perspectives and source-pinned card/rule revisions.

Only a validated natural trajectory and paper-rules reconciliation could establish impact on these decks. Existing evidence supports **zero independently qualified games** and gives no support to 99.5% win rate. The census is an exposure-prioritization aid; it must not become an automatic result invalidation or strength penalty for these particular ranks.

**Reproduction contract:** `node --test tests/aichi-telepath-source-inventory.test.cjs` and `node scripts/aichi-telepath-source-inventory.cjs`. These new pure-data assertions were independently recomputed against the current GitHub JSON source; no compiled manual CI run is claimed for this artifact.
