# Enamorus anchor access with discard-aware routes and Arven's full search

**Agent 43 · 19 November 2026**

**Status:** exact finite-population resource-access analysis of a hypothetical Enamorus addition. This is not a deck recommendation, a native game result, a matchup result, or a win-rate estimate.

## Question

The existing Enamorus report gives a restricted joint Enamorus + Hood access figure of 23.1853% going first / 27.5942% going second for a hypothetical 15-Basic list. That model uses Fog Crystal ×4 and Mysterious Treasure ×4 as eight direct searchers, plus Hisuian Heavy Ball and Arven. It treats each seen Mysterious Treasure as a usable search route and does not include one important use of Arven: fetching **Stealthy Hood + Fog Crystal together** when Enamorus remains in the deck.

This addendum isolates the legal zero-discard route and then asks how often it coincides with access to the Shadow Rider V / VMAX core by turn two.

## Card-text route

The bundled card database supports the following exact route:

- **Arven** searches for one Item and one Pokémon Tool (resources/cards/en/sv1.json).
- **Fog Crystal** is an Item that searches for a Psychic Energy or a Basic Psychic Pokémon, so it can find Enamorus V (resources/cards/en/swsh6.json).
- **Stealthy Hood** is a Pokémon Tool (resources/cards/en/sm10.json).
- **Hisuian Heavy Ball** is an Item that can recover a Basic Pokémon from the Prize cards (resources/cards/en/swsh10.json).

Therefore one Arven can fetch:
1. **Stealthy Hood + Fog Crystal** when Enamorus remains in the deck; or
2. **Stealthy Hood + Hisuian Heavy Ball** when Enamorus is Prized.

If Hood is already in hand, Float Stone or Forest Seal Stone can serve as Arven's Tool target while Arven fetches the required Item (resources/cards/en/xy8.json, resources/cards/en/swsh12.json). The enumerator tracks these two other Tools in the remaining-deck check.

This route does not require paying Mysterious Treasure's discard cost. Mysterious Treasure (resources/cards/en/sm6.json) and Quick Ball are deliberately not counted as search routes in the new model. That is a DCI/AMR-conservative choice, not a claim that they can never be paid for.

## Exact model

The hypothetical 60 keeps the candidate's two Hoods, four Shadow Rider V, four VMAX, four Fog Crystal, one Arven, one Heavy Ball, eleven Psychic Energy, and the original fourteen Basic Pokémon; Enamorus is added as the fifteenth Basic by cutting one non-Item Trainer. The model therefore has 15 Basics, 30 Trainers, and 11 Energy. The displaced Trainer is not selected as a deck recommendation; the slot assumption preserves the 16 Item cards in the hypothetical list.

The exact category counts are:

| Category | Count |
|---|---:|
| Enamorus V | 1 |
| Stealthy Hood | 2 |
| Shadow Rider Calyrex V | 4 |
| Shadow Rider Calyrex VMAX | 4 |
| Fog Crystal | 4 |
| Arven | 1 |
| Hisuian Heavy Ball | 1 |
| Other Basic Pokémon | 10 |
| Other Pokémon Tools (Float Stone, Forest Seal Stone) | 2 |
| All other cards | 31 |
| **Total** | **60** |

The residual 31 includes the eleven Psychic Energy and twenty other Trainers. The model preserves the candidate's 16 Item cards: Fog Crystal ×4, Heavy Ball ×1, and eleven other Items. At most fifteen cards are unavailable by the candidate's second turn (opening seven, six Prizes, and two natural draws), so at least one Item remains as Arven's second search target. The Tool availability is explicitly checked rather than assumed.

The sample space is exact:
- choose a seven-card opening hand;
- condition on at least one Basic Pokémon;
- choose six Prizes from the remaining 53 cards;
- draw from the 47 cards left after Prizes.

Turn timing is seat-aware:
- **Going first:** no natural draw on the candidate's first turn; one draw by the candidate's second turn.
- **Going second:** one natural draw on the candidate's first turn and one on the second.

The anchor-access event requires Enamorus directly, through Fog Crystal, through Heavy Ball when Prized, or through Arven's Tool + Item search; Hood must be direct or fetchable by Arven. The core-access event requires a Shadow Rider V by the candidate's first turn and a VMAX by the candidate's second turn. The joint event is the intersection.

The model does **not** require or claim that the Pokémon are played, evolved, energized, protected, or able to attack. It does not model search sequencing, Supporter competition, Energy attachment, Bench capacity, Tool removal, Ability/Item lock, opponent actions, or a game outcome.

## Results

All percentages below are **conditional on a valid opening seven**.

| Resource event | Going first | Going second |
|---|---:|---:|
| Valid opening probability (unconditional) | 88.2499% | 88.2499% |
| Enamorus + Hood access, without Arven's dual-search route | 15.5040% | 19.0264% |
| Enamorus + Hood access, with Arven's dual-search route | **22.4001%** | **26.1390%** |
| Shadow Rider V by turn 1 + VMAX by turn 2 | 18.6496% | 22.5528% |
| Joint anchor + V/VMAX access, without Arven's dual-search route | 2.0599% | 3.2702% |
| Joint anchor + V/VMAX access, with Arven's dual-search route | **3.3014%** | **4.8498%** |

Arven's omitted dual-search use adds **6.8961 / 7.1126 percentage points** to anchor-only access and **1.2415 / 1.5796 points** to the joint anchor-plus-core event.

The joint exact fractions are:
- Going first: 12141091432443352 / 367753188390588000
- Going second: 820429234883993508 / 16916646665967048000

## Reconciliation with the previous eight-searcher figure

The earlier 23.1853% / 27.5942% result remains a valid output of its own route model: eight seen direct searchers (Fog Crystal + Mysterious Treasure), Heavy Ball, and Arven used for Hood / the Prized-Enamorus Heavy Ball line. It does not include Arven fetching Hood + Fog Crystal when Enamorus remains in the deck, and it treats Mysterious Treasure as usable without explicitly paying its discard.

The new 22.4001% / 26.1390% model instead:
- uses only Fog Crystal ×4 as the direct Enamorus searcher;
- includes Arven fetching Hood + Fog Crystal or Hood + Heavy Ball;
- excludes Mysterious Treasure and Quick Ball entirely;
- checks that another Tool remains when Arven needs one.

The two outputs are numerically close, but they are **not equivalent models**. Their difference (0.7852 points going first / 1.4552 points going second) is not an estimate of Mysterious Treasure's marginal value. It reflects different route assumptions. The important correction is that Arven's full printed effect supplies a substantial no-discard access route that the previous joint model omitted.

The going-second V/VMAX-only result is consistent with the existing scripts/hood-t2-joint.cjs baseline when the original 14-Basic candidate is used; the new model adds the separate going-first case and intersects core access with the Enamorus anchor.

## Interpretation and limits

1. The zero-discard Arven route makes the anchor package more accessible than the previous model's Fog/Heavy direct route alone.
2. Requiring the anchor and the V/VMAX core together by turn two is much rarer: 3.3014% going first / 4.8498% going second in this restricted model.
3. These are access probabilities, not probabilities of establishing Guardian of Love. They do not establish whether Enamorus is worth a slot.
4. The result is not a lower or upper bound on real gameplay. Excluded routes (Forest Seal Stone's Star Alchemy, Tapu Lele-GX → Arven, Mysterious Treasure, Quick Ball, and mulligan bonuses) can add access; payment costs, sequencing, lock effects, Bench pressure, and attack-energy requirements can reduce practical availability.
5. No fixed 60, policy, fixture, simulator, workflow, CI, or candidate status was changed. The canonical V3 first-trace stopline remains in force for native interaction testing.

## Reproduction

Compile and run the standard-library C++17 enumerator:

```sh
g++ -O3 -std=c++17 -Wall -Wextra -Werror agent43-enamorus-anchor-core-access-20261119.cpp -o /tmp/enamorus-access
/tmp/enamorus-access
```

Source: agent43-enamorus-anchor-core-access-20261119.cpp.

The script uses integer combinatorial weights for opening hands, Prizes, and ordered natural draws. The reported rates are the exact weighted ratios, converted to decimal for display.

## Next useful step

After the canonical V3 gate and first natural-terminal trace, test the Hooded-Enamorus / Guardian interaction natively as already specified in the main Enamorus hypothesis report (agent43-enamorus-v-board-shield-hypothesis-20261117.md). A separate DCI-aware extension can then evaluate Mysterious Treasure and Quick Ball payment states; do not infer that they are free searchers from the present result.


## Follow-on: Forest Seal Stone

A follow-on exact route model now includes Forest Seal Stone's Star Alchemy, both when the card is already in hand and when Arven fetches it as the Tool target. It raises the modeled anchor-only access to 24.8928% / 29.3519% and joint anchor + V/VMAX access to 4.0990% / 6.0508% (going first / going second). See [the Forest Seal Stone access extension](agent43-enamorus-forest-seal-access-20261119.md) and its C++17 enumerator. This is still a route-specific access model, not a gameplay or win-rate result.
