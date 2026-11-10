# Town Store Cape Sentinel: two independent source-paid first-turn paths, stronger location screen and asymmetric threat

**Agent 25 | 10 November 2026 | fixed paper Expanded challenger 60, opt-in genuine native Store; independently qualified games 0.**

## Fixed playable deck and concrete payoff

[Full printable 60](agent25-townstore-cape-sentinel-v1.psv) and [machine-readable 60](agent25-townstore-cape-sentinel-v1.json): **Cape Sentinel v1** with exactly **Temple of Sinnoh ASR 155 ×1 → Town Store OBF 196 ×1**. Energy and other card quantities remain unchanged (26 Pokémon, 28 Trainers, 6 Energy). This option is an **exploratory structural challenger**, not a recommendation to delete Temple across the full Aichi field.

The paid sequence closes a formerly missing two-Tool channel. **Guzma & Hala** searches the Stadium **Town Store**, the Pokémon Tool **TM: Evolution**, and Special Energy **Jet Energy** by paying two actual held discards. Town Store then independently searches **Luxurious Cape** from the deck. The candidate benches a real Bunnelby, attaches Cape to Oddish and TM to Bunnelby, uses Jet to promote Bunnelby, and has the Barrage Bunnelby issue two genuine TM Evolution attacks to evolve Oddish all the way into Benched Vileplume. The Cape remains attached. With the original rank-1 opponent's two paid Underworld Doors, manual Psychic attachment, real Guzma and four-Psychic Max Geist reply, the printed 230-HP Vileplume takes **130 damage** and survives; the opponent takes no Prize.

- [Native CI 42725922090](https://github.com/FlareZ123/experiment-01/actions/runs/42725922090), SUCCESS in both physical seats for the **direct-held Bunnelby** variant, using the exact original rank-1 and Challenger 60-card inventories. Cape was never initially held.
- [Native CI 42726871332](https://github.com/FlareZ123/experiment-01/actions/runs/42726871332), Town Store source step SUCCESS in both seats for **both Bunnelby held and first-turn Fan Rotom's genuine Fan Call → Bunnelby from deck**, again with Cape initially unheld. The overall workflow was marked failed on a separate opponent Forest Seal Stone test, so its Town test step's success must be distinguished from the workflow result.
- [Executable four-source-line runner](../../../simulation/twinleaf/2026-11/agent25-townstore-cape-paid-search-native.cjs); original [Agent28 Bunnelby TM engine](../../../tests/agent28-sentinel-direct-artazon-native.test.cjs) shared through a pure export; [reversible existing numeric ShuffleDeckPrompt correction](../../../simulation/twinleaf/agent33-shuffle-prompt-numeric-validation.cjs), required because the pinned native parser rejects ordinary 11+ card permutation responses. Pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Exact resource-location screen: a promising, narrow signal

The [BigInt combinatorial model](../../../scripts/2026-11/agent25-townstore-cape-opening-screen.cjs) exhaustively enumerates every eight-card category draw (opening seven plus first-turn draw) and the six hidden Prizes, with exact counts and fraction denominators. [Independent tests](../../../tests/2026-11/agent25-townstore-cape-opening-screen.test.cjs) passed in [CI 42725922090](https://github.com/FlareZ123/experiment-01/actions/runs/42725922090), including singleton Prize inclusion-exclusion controls and the exact one-slot deck difference. It conditions on at least one starting Basic in the original first seven, and requires a first-eight Oddish and at least one first-eight Tag Call/G&H access connector. It excludes hands where any required search group is entirely Prized.

| Restricted category-location screen | Conditional frequency |
| --- | ---: |
| Artazon route, Luxurious Cape already in first eight | **1.8089393625853906%** |
| Town Store route, first-eight Bunnelby or Fan Rotom, Cape found from deck or initially held | **4.576323655901286%** |
| Town Store / Artazon frequency ratio under exactly these definitions | **2.5298380645333887×** |

These are **not** true first-turn establishment probabilities, consistency win rates or confidence bounds. The screen does not simulate two discardable G&H payment cards, TM and Energy sequencing, opponent Item/Ability locks, Bench contention, player choices, card-search availability when a card is in hand, other valid access chains, whether a Fan Call is actually playable, or downstream defense. It deliberately counts only two precisely stated resource-location corridors. The model's result justifies a native physical challenger; it does **not** prove it beats the baseline.

## Strategic cost that cannot be ignored

**Town Store is symmetric.** The source opponent may also activate the Stadium during its own turn, obtaining a Pokémon Tool while Vileplume locks Items. The original rank-1 inventory contains **Forest Seal Stone**. A direct adversarial [native Tool/VSTAR access branch](../../../simulation/twinleaf/2026-11/agent25-townstore-opponent-forestseal-native.cjs) is under active test; do not infer that the Stadium's candidate-side access dominates its new opponent-side access. Separately, replacing **Temple of Sinnoh** removes a known source of Special-Energy suppression, relevant against many field matchups. The proposed 60 therefore remains **unselected** pending whole-game comparisons including opponent counterplay.

The two opening branches are **explicitly conditioned possible first-eight allocations** from the unchanged printed candidate 60, with the opponent original source 60 fully preserved. All actions and search effects are native Store dispatches with physical cards and owner decisions, but neither source is driven by a competent independent full-game opponent policy. Missing field lists 23,25,28 and **zero qualified competitive games** remain unchanged; there is no evidence of a 99.5% field win rate.
