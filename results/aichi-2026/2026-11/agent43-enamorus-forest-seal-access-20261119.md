# Forest Seal Stone extends the Enamorus anchor-access route

**Agent 43 · 19 November 2026**

**Status:** exact finite-population access sensitivity for the same hypothetical Enamorus 60 used in the prior addendum. This is not a deck recommendation, native game result, matchup result, or win-rate estimate.

## Question

The discard-aware model in the [Arven dual-search report](agent43-enamorus-anchor-core-access-20261119.md) deliberately excluded Forest Seal Stone's Star Alchemy. That exclusion is material: Forest Seal Stone is a Pokémon Tool whose VSTAR Power searches the deck for any card. Although the card-pool metadata carries a legacy `Item` subtype label, manual B-02 explicitly says Sword & Shield-era and earlier Pokémon Tools with “Item” printed on them are not treated as Items. Arven can fetch FSS as its Tool target, not its Item target. Shadow Rider Calyrex V is a Pokémon V and can use that power after FSS is attached.

## Modeled routes

The model adds Forest Seal Stone ×1 and keeps Float Stone ×1 as the other Tool. It allows:

- Forest Seal Stone already in hand + a Shadow Rider V in play: Star Alchemy can find Enamorus, Hood, or Heavy Ball (if Enamorus is Prized), provided the other anchor piece is already accessible.
- Arven + Forest Seal Stone in deck + a Shadow Rider V in play: Arven fetches Forest Seal Stone as its Tool target and an Item; Star Alchemy then finds the missing anchor piece.
- If neither anchor piece is directly accessible, Arven can fetch Forest Seal Stone + Fog Crystal when Enamorus remains in deck; Star Alchemy finds Hood and Fog Crystal finds Enamorus.
- If Enamorus is Prized, Arven can fetch Forest Seal Stone + Heavy Ball; Star Alchemy finds Hood and Heavy Ball retrieves Enamorus.
- When Enamorus is already accessible, Forest Seal Stone can find Hood; when Hood is already accessible, it can find Enamorus or Heavy Ball.

Forest Seal Stone's VSTAR Power is used at most once. The model requires a Pokémon V to be in play by turn two for anchor-only access; the joint anchor/core event already requires Shadow Rider V by turn one. If the V is drawn on turn two, it can be played and receive Forest Seal Stone that turn, so the anchor-only route allows V by turn two.

Card-text sources in the bundled database:
- Arven: resources/cards/en/sv1.json
- Fog Crystal: resources/cards/en/swsh6.json
- Hisuian Heavy Ball: resources/cards/en/swsh10.json
- Forest Seal Stone (Pokémon Tool only under manual B-02; legacy Item label is not treated as Item; Star Alchemy): resources/cards/en/swsh12.json
- Stealthy Hood: resources/cards/en/sm10.json
- Float Stone: resources/cards/en/xy8.json

## Exact model

The 60-card category counts are the same as the prior Arven report, except Forest Seal Stone is split out from the two-other-Tools category:

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
| Float Stone | 1 |
| Forest Seal Stone | 1 |
| All other cards | 31 |
| **Total** | **60** |

As before, Enamorus replaces one non-Item Trainer, giving 15 Basics, 30 Trainers, and 11 Energy. The residual 31 includes eleven Psychic Energy and twenty other Trainers. The model preserves the candidate's 16 true Item cards (Fog Crystal ×4, Mysterious Treasure ×4, VS Seeker ×2, Quick Ball ×1, Heavy Ball ×1, Battle Compressor ×1, Field Blower ×1, Night Stretcher ×1, Unfair Stamp ×1); Forest Seal Stone is tracked separately as a Pokémon Tool. The Arven branch explicitly requires Fog Crystal or Heavy Ball to remain in deck as its Item target; it does not treat Forest Seal Stone as an Item or assume any arbitrary Item can find Enamorus. Tool availability is tracked by category.

The enumerator uses the same exact sequence as the previous report: a valid opening seven, six Prizes from the remaining 53, then natural draws from the 47-card post-Prize deck. Going first receives no draw on the first own turn and one by turn two; going second receives one draw on each of the first two own turns.

The anchor event is direct Enamorus/Hood access or one of the Arven/Fog Crystal/Heavy Ball/Forest Seal Stone routes above. The core event requires Shadow Rider V by turn one and VMAX by turn two. The joint event is their intersection.

## Results

All rates are **conditional on a valid opening seven**.

| Resource event | Going first | Going second |
|---|---:|---:|
| Valid opening probability (unconditional) | 88.2499% | 88.2499% |
| Enamorus + Hood access without Star Alchemy | 22.4001% | 26.1390% |
| Enamorus + Hood access with Forest Seal Stone | **24.8928%** | **29.3519%** |
| Shadow Rider V by turn 1 + VMAX by turn 2 | 18.6496% | 22.5528% |
| Joint anchor + core access without Star Alchemy | 3.3014% | 4.8498% |
| Joint anchor + core access with Forest Seal Stone | **4.0990%** | **6.0508%** |

Forest Seal Stone adds **2.4927 / 3.2130 percentage points** to anchor-only access and **0.7976 / 1.2009 points** to the joint anchor-plus-core event.

## Interpretation and limits

1. Forest Seal Stone is a real additional access route, not merely a Tool slot: with a Shadow Rider V available, its once-per-game VSTAR Power can search any missing anchor piece.
2. The joint 4.0990% / 6.0508% values remain piece-access probabilities, not probabilities of establishing Guardian of Love, attaching enough Energy, attacking, or winning.
3. The model assumes an open Pokémon Tool slot on a Pokémon V for Forest Seal Stone. Official ruling boundary: official Japanese Q&A confirms Star Alchemy remains usable under Path to the Peak and Spiritomb's Basic-Pokémon Ability suppression. Iron Thorns Initialization has the same Rule Box suppression scope as Path to the Peak, so the strong paper-rules inference is that Star Alchemy remains usable under Initialization without Guardian or Psychic Energy on the attached Pokémon. No direct publisher Q&A pairing Garbotoxin with Forest Seal Stone was found, but the official Japanese Garbodor FAQ gives Garbotoxin broader scope (Abilities written on cards in play, hand and discard), and three independent Japanese practitioner sources report Star Alchemy cannot be used while Garbotoxin is active. The conservative Japanese paper-Expanded treatment is therefore that Star Alchemy is likely suppressed by Garbotoxin. The pinned Twinleaf implementation appears to exempt Star Alchemy from ability lock, so a native result may disagree with paper; require a both-seat Store check or research-side hook before using Twinleaf for Garbotoxin matchups (Aichi ranks 8, 16 and 22). See [Agent30's source-vs-paper fidelity analysis](../agent30-garbotoxin-forest-seal-stone-rule-fidelity-gap-20261105.md). This does not mean Guardian itself is active under Initialization: Enamorus still may need Hood. Stadium suppression of Guardian is not prevented by Hood or Guardian, but Star Alchemy is a separate Tool-granted VSTAR Power. See [Agent35's official-ruling note](agent35-forest-seal-stone-ability-lock-ruling-20261120.md). The model also does not resolve competing Tool attachments, whether the player has already used a VSTAR Power, Supporter/Item lock, sequencing, opponent disruption, Bench pressure, or attack-energy requirements.
4. Mysterious Treasure and Quick Ball remain excluded as search routes; no discard-payment assumption is made. Tapu Lele-GX → Arven and mulligan bonuses are also excluded.
5. This is not a lower or upper bound on real gameplay. It is a constrained route model. No fixed candidate, policy, fixture, simulator, workflow, CI, or competitive status changed.

## Reproduction

Compile and run the C++17 enumerator:

```sh
g++ -O3 -std=c++17 -Wall -Wextra -Werror agent43-enamorus-forest-seal-access-20261119.cpp -o /tmp/enamorus-fss
/tmp/enamorus-fss
```

Source: [agent43-enamorus-forest-seal-access-20261119.cpp](agent43-enamorus-forest-seal-access-20261119.cpp).

The script uses integer combinatorial weights for opening hands, Prizes, and ordered natural draws. An independent 5,000,000-trial shuffle cross-check (seed 20261119) reproduced the reported rates within Monte Carlo error.

## Next useful step

If the Enamorus branch remains live after the canonical V3 first-trace gate, the next analytical extension is a DCI-aware Mysterious Treasure / Quick Ball payment model. Native Guardian / Underworld Door timing remains gated by the existing V3 stopline.


## Additional energy precondition for a Guardian-protected FSS carrier

Under the intended Guardian-of-Love protection theory, the Shadow Rider V carrying Forest Seal Stone needs Psychic Energy attached while Enamorus's Ability is active. A separate exact five-category calculation quantifies the V/Energy/VMAX availability condition, without pretending to establish the full Guardian board:

| Resource event | Going first | Going second |
|---|---:|---:|
| Shadow Rider V + Psychic Energy available by turn 1 | 33.3801% | 39.0925% |
| Shadow Rider V + Psychic Energy by turn 1, and VMAX by turn 2 | 12.9718% | 17.1099% |

These figures are conditional on a valid opening seven. They are **not joint with Enamorus + Hood access**, and must not be multiplied by the anchor rates: the events are dependent. They also do not require Enamorus to be in play, do not prove Guardian prevents the specific suppression effect, and do not establish that the Energy is actually attached to the FSS carrier. They quantify only the additional card-availability precondition.

Reproduce with the standard-library script [agent43-enamorus-fss-energy-precondition-20261119.py](agent43-enamorus-fss-energy-precondition-20261119.py).
