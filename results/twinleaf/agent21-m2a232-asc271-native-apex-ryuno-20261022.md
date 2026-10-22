# Native pinned Store: exact Japanese M2a 232 / English ASC271 Dragonite 330 + one-DDE discard

**Agent 21 | 22 October 2026 UTC | completed manual native receipt [CI 39699837834](https://github.com/FlareZ123/experiment-01/actions/runs/39699837834).** Pinned upstream `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` (current research checkout), manual workflow `.github/workflows/agent21-dragonite-photo-native.yml`, test driver `simulation/twinleaf/agent21-asc271-source-board-receipt.cjs`. Workflow **completed successfully**, head `d6f3ae247106101268d3d6c6574e912050d7e480`. Native artifact name `agent21-source-photo-m2a232-asc271-native`, artifact ID **12392661716**, digest **sha256:bfa16af6325ce5bb32cbd9d09fa7186cfe72f77b86b224f7b9338f96d9446c7b**. No tournament game simulated.

## Authentic printed card / direct Store source context

The independently authenticated source card is the photograph's **Japanese `M2a 232/193`**, **English `ASC 271`**, registered under the pinned actual card-manager key **`Mega Dragonite ex2 ASC`**. The other main print is `ASC 152`, manager key `Mega Dragonite ex M2a`. Both have the same 330-damage Ryuno Glide attack and mandatory two-Energy discard. The original 38-cell 60-card source list and source photo are [documented separately](../aichi-2026/agent21-natsumegu-dragon04-rank21-59overlap-audit-20261021.md).

Using research-owned `preparedRegidrago()` creates an **injected established board** (Regidrago VSTAR Active, 2 Basic Grass + 1 Basic Fire attached, 1 Double Dragon Energy additionally attached, Dragonite donor directly in the discard). It dispatches native `AttackAction(101,'Apex Dragon')`, receives native `ChooseAttackPrompt`, chooses the actual donor's `Ryuno Glide`, then the **real Store-issued** `ChooseEnergyPrompt`, validates proposed energy-payment variants and dispatches native `ResolvePromptAction`. This is deeper than asserting printed card text, because damage, prompt accept/reject and physical discard all pass through the pinned Store.

## Extracted preserved native receipt

| Native observation | Main ASC152 control | Exact photo ASC271 |
| --- | --- | --- |
| `CardManager.getCardByName(card.fullName)` | success, `Mega Dragonite ex M2a` | success, `Mega Dragonite ex2 ASC` |
| Original attached cards | Grass, Grass, Fire, Double Dragon | Grass, Grass, Fire, Double Dragon |
| Printed chosen attack | Ryuno Glide, 330 | Ryuno Glide, 330 |
| Native prompted payment | two Colorless energy units | two Colorless energy units |
| One Double Dragon Energy card accepted | **yes** | **yes** |
| Two Basic Energy cards accepted | **yes** | **yes** |
| One Grass plus one Fire accepted | **yes** | **yes** |
| Native recorded damage to target | **330** | **330** |
| After selected one-DDE discard | Grass, Grass, Fire remain | Grass, Grass, Fire remain |
| Double Dragon card physically in discard | **yes** | **yes** |
| Full shuffled 60 vs named opponent | untested | untested |

All assertions from the driver passed, including `exactPhotoPrint.printedPayload==='Mega Dragonite ex2 ASC'`, `exactPhotoPrint.printedAttack.damage===330`, `oneDdeEffectCompleted===true`, and `discardContainsDoubleDragon===true`. The CI artifact contains the two complete JSON receipts, with native prompt cost and card-by-card `provides` arrays, for direct replay verification. This is a positive **card-translation + copied-attack + two-Energy-effect** compatibility finding.

## Strict limits

This scenario **injected** established Active Pokémon, Energy, discard donor, basic prize fillers and a target; it did not deal a fair physical source 60, search for the singleton, negotiate Supporter/discard costs, execute complete opponent decisions or sample match results. The configuration has *extra* Basic Energy deliberately attached, so it does not test the separate tactical event **exactly one Double Dragon + one Basic on the attacking Regidrago, leaving only one Basic after copied Ryuno**. That exact-3-energy state remains a separate real Store test to add. Even though the native effect is correct in this staged case, it is not competitive strength evidence.

The [photo 60](../aichi-2026/agent21-natsumegu-dragon04-visual-60.json) still belongs to an **unassigned account-level source**, and one official rank cannot be assigned from matching a photograph. Full official Top32 60s remain **29/32**. **Qualified competitive games remain zero; 99.5% remains unsubstantiated**.
