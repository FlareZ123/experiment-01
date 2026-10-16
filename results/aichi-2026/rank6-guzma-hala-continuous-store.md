# Rank 6 Iron Thorns: continuous Guzma & Hala to Volt Cyclone Store proof

**Agent 33, 16 October 2026. Evidence class: staged action-level pinned-engine test.**
**Qualified for competitive win-rate inference: false.**

## Question and prior observation

The source-locked rank-6 Iron Thorns pilot had a repeated physical-seat opening where the generic bot possessed Guzma & Hala and Thunder Mountain, chose to spend Guzma and Tropical Beach, and passed without Energy. See [observed turn-two counterfactual](rank6-observed-turn2-counterfactual.md). Those three copies of the opening across candidate opponents are **one opening seed**, not independent evidence.

The published [rank-6 60-card list](full-decklists.json) contains four Iron Thorns ex TWM 77, two Guzma & Hala CEC 193, one Double Colorless Energy SUM 136 and one Thunder Mountain Prism Star LOT 191. The tested hand cards and search targets also occur in the published list. Printed Iron Thorns Volt Cyclone costs Lightning + Colorless + Colorless and deals 140; Thunder Mountain reduces its Lightning portion, so one Double Colorless Energy suffices.

## Real pinned Store sequence

**[Manual GitHub Actions run 38899577665](https://github.com/FlareZ123/experiment-01/actions/runs/38899577665) passed both compiled tests** against Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, without editing upstream. The workflow [`aichi-iron-thorns-first-attack.yml`](../../.github/workflows/aichi-iron-thorns-first-attack.yml) is manual-only.

The continuous regression [`iron-thorns-guzma-hala-line.cjs`](../../simulation/twinleaf/iron-thorns-guzma-hala-line.cjs) performed actual Store dispatches and resolved their real prompts in this order:

1. Start with Iron Thorns ex Active, an empty occupied Bench, Thunder Mountain in hand, the observed source-representable seven-card hand, and Double Colorless Energy plus Wondrous Labyrinth in the deck. The opposing Active is Dialga-GX. All six Prize cards in the staged fixture are filler, so DCE is deliberately unprized.
2. Play **Guzma & Hala** as the Supporter; resolve its mandatory mode prompt selecting optional two-card discard and the expanded search.
3. Discard **Guzma** and **Tropical Beach**, retrieve **Double Colorless Energy** and **Wondrous Labyrinth Prism Star**. The Store accepted both the discard and constrained search selections; the test completed ShuffleDeck, ShowCards, and Wait prompts.
4. Play the already held **Thunder Mountain Prism Star**, then attach the searched **Double Colorless Energy** to Active Iron Thorns.
5. Announce **Volt Cyclone** and complete the Attack animation and subsequent Wait prompts. The opposing Active's recorded damage was **140**; no Benched Pokémon were occupied.

The separate [direct attack fixture](../../simulation/twinleaf/iron-thorns-turn2-attack.cjs) passed in the same run: a DCE-powered Volt Cyclone was rejected without Thunder Mountain and dealt **140** with Thunder Mountain and no occupied own Bench. This independently guards the Energy-cost portion of the scripted line.

## What the result establishes

This is a continuous, concrete mechanical witness that the prior proposed Supporter-to-attack route can be played by the pinned engine in a state compatible with relevant source card identities. It closes the earlier **unexecuted search/prompt/attack chain** uncertainty at this staged level.

It does **not** prove the original seed has an unprized DCE or accessible search channel. This state was constructed rather than replayed from a physically dealt source-exact 60-card game: the rest of the deck and all six Prizes were filler, opponent interference was absent, and all decisions were scripted. It does not qualify generic SimpleTacticsAi, quantify how often a strategic player would spend those exact two cards, demonstrate a real opponent response, or determine game wins. The exact [discard-budget study](iron-thorns-discard-sensitivity.md) shows how materially the resource opportunity varies with discard acceptance.

The [rank-6 qualification packet](qualification-packets/rank-06/README.md) still properly reports **`qualified_for_competitive_inference: false`**. The 99.5% full-field objective remains unverified.

## Next validation gate

Recreate the **actual source-shuffle turn-two state**, recording whether DCE and all connectors are Prized under K0/K1 knowledge, and replay both the bot action and this alternative through each intervening prompt. Include the responding candidate turn, hidden-information invariance, noninterfering speculative clone and both true starting-seat positions. Only qualified game trajectories could support eventual matchup estimates.
