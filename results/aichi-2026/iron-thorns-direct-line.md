# Iron Thorns: exact first-turn DCE + Thunder Mountain direct-line access

## Objective and sources

This audit isolates the **direct first-attack resource line** for the three published Aichi 2026 Iron Thorns ex decks, using the actual card counts in [full-decklists.json](full-decklists.json) and the card text from `resources/cards/en`.

The attack **Volt Cyclone** on Iron Thorns ex costs Lightning + Colorless + Colorless. **Thunder Mountain ◇** removes the Lightning requirement from attacks by Lightning Pokémon; **Double Colorless Energy** supplies the remaining two Colorless. **Guzma & Hala** can obtain the Stadium and, on discarding two other cards, the Special Energy. **Tag Call** can obtain Guzma & Hala from the deck. The [human concepts](../../resources/human_concepts.md) identify this as an archetype-specific line, but the exact accessibility was unmeasured.

The reproducible finite hypergeometric enumerator is [`scripts/iron_thorns_direct_line.cjs`](../../scripts/iron_thorns_direct_line.cjs), with [exact-value regression tests](../../tests/iron_thorns_direct_line.test.cjs). The [manual GitHub Actions workflow](../../.github/workflows/aichi-opening-audit.yml) ran successfully at [run 38819877604](https://github.com/FlareZ123/experiment-01/actions/runs/38819877604).

## Exact model

We condition on a **valid seven-card opening** containing an Iron Thorns ex. There are four copies, the only Basic Pokémon in these three decks. Six Prize cards are set aside; one card is drawn at the start of the player's first turn going second. No opponent bonus cards are drawn in this model.

Partition the 60-card list into six groups: Iron Thorns ex, Thunder Mountain ◇, Double Colorless Energy, Guzma & Hala, Tag Call, and everything else. Enumerate possible eight-card hands; weight the case with exactly one Iron Thorns among the eight by **7/8**, since that one must be in the first seven. Then enumerate Prize configurations of the three relevant search targets. A hand passes the direct-access test if it either:

1. Already holds Thunder Mountain and Double Colorless Energy; or
2. Holds Guzma & Hala, or holds Tag Call with an unprized Guzma & Hala available in the deck, and can access whichever of Thunder Mountain and Double Colorless Energy are missing from its hand through that Supporter.

The probability calculation includes all six Prize cards, including the possibility of both copies of Guzma & Hala being Prized. It assumes the Supporter's optional two-card discard can be paid whenever the Special Energy is searched.

## Results

| Published rank | Copies of DCE | In-hand Stadium + DCE | Via Guzma & Hala / Tag Call | Combined direct access |
| ---: | ---: | ---: | ---: | ---: |
| 6 | 1 | 1.278% | 32.503% | **33.782%** |
| 24 | 3 | 3.500% | 35.608% | **39.108%** |
| 29 | 1 | 1.278% | 32.503% | **33.782%** |

All three lists contain four Iron Thorns ex, one Thunder Mountain ◇, two Guzma & Hala, and two Tag Call.

An independent randomized enumeration with 250,000 deals per DCE count, seeded 628104, yielded **33.792%** (one DCE, 99,759 valid openings) and **39.082%** (three DCE, 99,910 valid openings), consistent with the exact probabilities.

## Interpretation and limitations

The rank-24 list's two additional Double Colorless Energy cards increase this **particular direct-line access measure by 5.326 percentage points** compared with ranks 6 and 29. This quantifies a resource-access difference between published Iron Thorns builds; it does not establish which deck is stronger.

**This is neither an upper bound nor a lower bound on actual first-turn attack rates.** The modeled line may fail when two strategically acceptable discard targets are unavailable, when another Supporter or Item is required, or because of opponent effects. Conversely, Trainers' Mail, additional draws, other search cards, mulligan-bonus cards, Prize recovery, or other action sequences may enable attacks beyond the model. Actual match play and later-turn control dynamics are omitted.

The result should be used as a transparent submodel and an integration check for richer simulations. It is not evidence of achieving the 99.5% overall win-rate target.
