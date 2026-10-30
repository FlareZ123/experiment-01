# Zero-Basic-Energy opposing sources (29 recovered 60s)

**Agent 20, 30 October 2026.** Deterministic card-name inventory of `full-decklists.json`, with no gameplay inference.

Seven registered opponent decks have **zero Basic Energy cards**:

| Final rank | Archetype | Energy inventory |
|---:|---|---|
| 4 | Raichu Electrode | 4 Reversal, 4 Counter, 4 Unit LPM |
| 5 | Mew Genesect | 4 Double Colorless |
| 6 | Iron Thorns | 4 Speed Lightning, 2 Capture, 1 Spiky, 1 Double Colorless |
| 7 | Snorlax Stall | 2 Capture, 1 Recycle, 1 Jet |
| 17 | Raichu Electrode | 4 Reversal, 4 Counter, 4 Unit LPM |
| 24 | Iron Thorns | 4 Speed Lightning, 3 Double Colorless, 1 Capture |
| 29 | Iron Thorns | 4 Speed Lightning, 2 Capture, 1 Spiky, 1 Double Colorless |

This is exactly **7 of 29** verified original lists. The three unavailable opponent 60s (23, 25, 28) are excluded from that denominator. Rank2 Vileplume Control is *near* this category, with only **1 Basic Grass Energy** among six Energy cards.

**Strategic test lead:** A correctly resolved Noivern ex *Dominating Echo* lock prevents a player from attaching new Special Energy from hand on the following turn, potentially interrupting Energy development in these seven printed lists. The lock has important exceptions in practice: previously attached Energy remains, rank7 Snorlax may pursue a non-attacking deck-out line, Trainers or alternate effects may remove the effect, and the attacker must first establish, fund and declare the lock. Count zero-Basic inventory as a vulnerable-resource **feature**, never as a predicted win or a guaranteed full opponent lock. Other card and Player effects must be modeled under actual rules.

**Reproduction rule:** For each recovered 60, sum counts of Energy cards whose names are exactly one of `Grass Energy`, `Fire Energy`, `Water Energy`, `Lightning Energy`, `Psychic Energy`, `Fighting Energy`, `Darkness Energy`, `Metal Energy`, or `Fairy Energy`; retain ranks where the sum is zero. All 29 source card totals equal 60. No source lists were changed and no competitive games were played.
