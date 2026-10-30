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

## Official hand-origin attachment interpretation

The [Japanese official Noivern ex Dominating Echo FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%89%E3%83%9F%E3%83%8D%E3%83%BC%E3%83%88%E3%82%A8%E3%82%B3%E3%83%BC&regulation_header_search_item1=all) explicitly rules that **Wigglytuff's Balloon Therapy cannot attach Therapeutic Energy from the player's hand** during the next turn after the attack. The bundled English card pool `sv2-84` independently prints Balloon Therapy as attaching Therapeutic Energy from hand. Thus the Special Energy restriction applies to a prohibited *hand-origin effect attachment* as well as the normal manual Special Energy play. This is a narrow official rules result. It does not establish a field-29 opponent playing Wigglytuff or a simulated loss. The existing [staged pinned Store Noivern contrast](../twinleaf/agent20-regidrago-noivern-iron-thorns-native-20261021.md) already checks ordinary Double Colorless hand play after Dominating Echo; it does not certify the Wigglytuff Ability interaction. An adapter intended to model hand-source Energy transitions should retain this as a negative native/paper fidelity control.
