# EnergyCard attach-trigger exposure in the Aichi Open League 2026 field

**15 November 2026 · source-list/card-text inventory · engine representation unverified**

## Question

Does the potential EnergyCard `useFromHand` / `useWhenInPlay` action-frontier omission affect only an abstract card pool, or do published Aichi opponent lists actually contain Energy cards with meaningful attach-from-hand effects?

## Inputs and method

- Opponent inventories: `results/aichi-2026/full-decklists.json` (29 published lists; ranks 23, 25 and 28 remain unavailable).
- Card text and Expanded legality: `resources/cards/en/swsh2.json` and `resources/cards/en/sv2.json`.
- Action-frontier implementation reviewed: `simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs` at PR #58 head `2112101e4ed6d63ceca94a00e7ee73933258ef1b`.

I counted exact printing identities and quantities by opponent rank. I did not infer missing lists.

## Field inventory

| Energy | Printing | Published ranks | Copies |
|---|---|---|---:|
| Capture Energy | RCL 171 / `swsh2-171` | 2 (2), 3 (3), 6 (2), 7 (2), 15 (1), 24 (1), 29 (2) | **13** |
| Jet Energy | PAL 190 / `sv2-190` | 2 (2), 7 (1), 15 (2) | **5** |
| Speed Lightning Energy | RCL 173 / `swsh2-173` | 6 (4), 24 (4), 29 (4) | **12** |

The union is **7/29 published lists** and **30 copies**. The five cross-format-only lists identified by the current field contract are ranks 3, 6, 7, 24 and 29. Within the 24 strict English Expanded diagnostic lists, only ranks 2 and 15 contain one of these three Energy identities: 3 Capture Energy plus 4 Jet Energy, for **7 copies across 2/24 lists**. The other 23 copies are in the five cross-format-only published lists, which remain part of the tournament-field benchmark even though they are not unchanged international-Expanded lists under the strict deck-construction screen.

## Printed effects and legality

All three records are marked Expanded legal in the bundled card data.

- **Capture Energy (swsh2-171):** when attached from hand to a Pokémon, search the deck for a Basic Pokémon and put it onto the Bench.
- **Jet Energy (sv2-190):** when attached from hand to one of your Benched Pokémon, switch that Pokémon with the Active Pokémon.
- **Speed Lightning Energy (swsh2-173):** when attached from hand to a Lightning Pokémon, draw 2 cards.

These are meaningful attach-from-hand effects that a competent opponent policy must resolve correctly.

## Relationship to the current action frontier

At the reviewed PR head, `agent3-known-cap-free-action-enumerator.cjs` enumerates:
- `useFromHand` powers for Pokémon and Trainers;
- `useWhenInPlay` powers for Pokémon and attached Tools;
- `useFromDiscard` powers for Pokémon, Trainers, and EnergyCards.

It does not enumerate EnergyCard `useFromHand` or attached-Energy `useWhenInPlay` powers.

**Important uncertainty:** the printed attach triggers above may be handled automatically by Twinleaf's native Energy-attachment action rather than represented as EnergyCard powers requiring `UseEnergyAbilityAction`. This inventory alone does not establish the engine representation. It therefore does not prove that Capture, Jet, or Speed Lightning are currently missed by the policy. The exact pinned-engine behavior must be tested before changing the enumerator.

## Actionable validation

1. In the pinned local Twinleaf revision, inspect how these three card printings resolve their printed attach-from-hand effects. Do not infer an action family from the printed wording alone.
2. Add native tests for both physical seats:
   - Capture Energy attached from hand searches a Basic Pokémon and places it on the Bench;
   - Jet Energy attached from hand to a Benched Pokémon switches it with the Active;
   - Speed Lightning Energy attached from hand to a Lightning Pokémon draws 2.
3. If the native attach action resolves all three automatically, keep them out of the `UseEnergyAbilityAction` frontier and document that distinction.
4. If any are represented as EnergyCard powers, add the corresponding hand/attached-Energy enumeration and test target/index metadata.
5. Keep the broad `includesHandAbilities: true` completeness claim conditional until every applicable card class is covered or explicitly excluded.

This is a **field-prioritization result**, not a finding that the current rank-1 vertical slice is invalid. The current Hood candidate uses Basic Psychic Energy only; this gap concerns competent opponent policies across the broader field. No matchup, win-rate, or competitive-strength claim follows.

## Conclusion

The EnergyCard frontier question has concrete Aichi relevance: Capture, Jet and Speed Lightning appear in 7/29 published lists (30 copies), including 2/24 strict Expanded lists and all five cross-format-only lists among the 29 published inventories. The immediate solution is not to assume an action is missing; it is to add three exact native attach-trigger regressions and then either prove automatic resolution or extend the EnergyCard frontier with the correct action shape.
