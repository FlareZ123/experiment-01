# Agent 8: Shadow Mist and original source Energy inventory

**5 November 2026.** Source-derived name/count census, no qualified games, no deck selection.

The [source data](../aichi-2026/full-decklists.json) contains 29 authenticated original Aichi 2026 Top32 inventories. Ranks 23,25,28 lack full verified source inventories. The [reproducible classification](../../simulation/evaluation/agent8-shadowmist-all-special-source-matrix.cjs) uses explicit Basic and Special Energy name whitelists and fails closed on unknown printings; [tests](../../tests/agent8-shadowmist-all-special-source-matrix.test.cjs) require exact original 29-rank counts.

## Seven authenticated source 60s contain no Basic Energy

| Rank | Archetype | Basic Energy | Special Energy |
| ---: | --- | ---: | ---: |
| 4 | Raichu Electrode Combo | 0 | 12 |
| 5 | Mew Genesect | 0 | 4 |
| 6 | Iron Thorns | 0 | 8 |
| 7 | Snorlax Stall | 0 | 4 |
| 17 | Raichu Electrode Combo | 0 | 12 |
| 24 | Iron Thorns | 0 | 8 |
| 29 | Iron Thorns | 0 | 8 |

Exactly **7/29 authenticated source 60s** contain exclusively Special Energy in the Energy category. The other 22 include at least one Basic Energy. The missing three original inventories are unknown and are excluded.

## One precise opponent-hand constraint

Printed Shadow Rider Calyrex V Shadow Mist prevents the opponent playing Special Energy or Stadium cards **from hand during their next turn**, conditional on that attack actually resolving and its restriction remaining active. This prevents ordinary manual attachment from hand of the eight Special Energy cards in rank6's original source 60. Rank6 has four Speed Lightning, two Capture, one Spiky and one Double Colorless; it has zero Basic Energy.

In the verified [same-source 96-root retrospective native trace](../aichi-2026/2026-11/agent7-original-rank6-shadowmist-96root-lock-window-20261105.md), rank6 publicly plays Speed Lightning Energy at turn1 and then Passes after ten consecutive Shadow Mist declarations by the opposing champion reference. The public trace is **consistent with an effective Special Energy lock** but does not establish effect-flag persistence, actual held cards, adequate payment for other actions, or forced Pass. No genuine rank4/rank5/rank7/rank17/rank24/rank29 Shadow Mist effect is tested here.

Snorlax Stall may not need to attack. Raichu Electrode can use other Energy-attachment channels. Trainer plays, preattached Energy, other Pokémon, switching, control removal, and the official 25-minute clock materially affect game strength. An all-Special inventory alone cannot establish a winning matchup.

## Concrete next native evidence

The next paper-relevant diagnostic is a read-only observation at the original-source acting Pass after a genuine settled Shadow Mist: native cannotPlaySpecialEnergyCards and cannotPlayStadiumCards flags, owner-held Energy/Stadium category counts, the printed attack recipient and actual damage, and legally payable alternative owner actions. Each recording must stay in the original-source owner's information set and keep the frozen deal/seat/root history. Proving that a Special Energy is held and legally blocked confirms a restricted channel. Forced turn denial requires independent proof that other payable actions are unavailable.

**Evidence status:** structural susceptibility established for seven authenticated source inventories. Zero certified competitive games, zero demonstrated field wins, no chosen final 60, three missing original lists and multiple unresolved native/paper fidelity gates.
