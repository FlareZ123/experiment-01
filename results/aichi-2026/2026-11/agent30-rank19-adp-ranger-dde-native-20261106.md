# Rank 19 Raging Bolt: source-registered Double Dragon ADP and Ranger's native counterfactual

**Agent 30, 6 November 2026.** Evidence type: published 60-card source-count audit; printed pinned native card code; **16/16 successful staged genuine-Store attack/Prize counterfactuals**. No natural full-game run or qualified win rate.

## Source-registered tactical exposure

The [existing authenticated 29-source manifest](../full-decklists.json) identifies Aichi Open League 10 May 2026 **rank 19 Mark Takahashi, Raging Bolt**, complete 60 cards. Its published Energy inventory is:

| Original source printing | Copies |
| --- | ---: |
| Double Dragon Energy ROS 97 | 4 |
| Lightning Energy MEE 12 | 3 |
| Fighting Energy MEE 14 | 3 |
| Darkness Energy MEE 15 | 3 |

It contains **one Arceus & Dialga & Palkia-GX CEC 156**, **zero basic Water Energy** and **zero basic Metal Energy**. The printed Double Dragon Energy provides two Energy of any type while attached to a Dragon Pokémon, offering a playable Metal payment plus the extra Water for **Altered Creation-GX** from a single attached DDE under appropriate conditions. This is an archetype-specific resource line, not evidence that the source pilot executed it frequently or that it was always available. Source rank 19 also registered **three Sky Field ROS 89**, a Stadium-replacement countermeasure relevant to Temple of Sinnoh.

The unchanged, independently archived [Hood Shield v1](../candidate-hood-shadow-rider.json) and [Temple Shadow Rider v1](../candidate-temple-shadow-rider.json) each contain **one Pokémon Ranger STS 104**. Temple v1 additionally contains **two Temple of Sinnoh ASR 155**; Hood contains zero Temple. The [deterministic exact source-count audit](../../../tests/agent30-rank19-adp-ranger-source.test.cjs) keeps all three 60s unchanged. **Status:** source audit is committed and was queued for native-workflow gating; its executable job receipt is tracked separately from the native results below.

## Paired native board: Altered Creation-GX then Ranger versus no Ranger

[Exact 16-arm test](../../../tests/agent30-ranger-altered-creation-native.test.cjs) uses printed ADP CEC 156, Pokémon Ranger STS 104 and a full pinned genuine Twinleaf Store turn flow. Each arm first executes **Altered Creation-GX** with its extra Water requirement funded, then on the opponent's turn either plays actual Ranger or passes with Ranger still held, and finally executes printed **Ultimate Ray** from ADP. Both physical seats run every branch. No hidden zones are read to choose the predetermined counterfactual branch.

Two separate attack-funding profiles are exercised:
- Basic Metal SVE + Basic Water SVE + Basic Psychic SVE, a general mechanics control.
- **Double Dragon Energy ROS 97 + Basic Lightning SVE**, the original rank-19 dual-Energy route with a **generic same-type basic-energy printing proxy** for the original MEE Lightning. The special DDE is the exact original printing; do not call the whole staged board an exact physical rank-19 game state.

For each of the two Energy profiles, each seat, Ranger/no-Ranger and knockout/non-knockout, the physical Store produced:

| Ranger response | Paid GX persistent +30 damage flag | Extra-Prize GX flag | Printed Ultimate Ray damage to 280HP ADP | Real Prize cards taken after KO of Pidgey MEW | GX once-per-game already spent |
| --- | --- | --- | ---: | ---: | --- |
| No Ranger | true | true | **180** | **2** | true |
| Ranger genuinely played | **false** | **false** | **150** | **1** | **true** |

The knockout arms actually resolved **ChoosePrizePrompt** against six populated Prize slots and **ChoosePokemonPrompt** to promote a surviving Benched Regidrago V. This is settled Store Prize custody, rather than inferring Prize count from a Boolean. Ranger removed the ongoing attack effects while preserving the GX-use quota. The Double Dragon Energy native profile reproduced these outcomes under both physical seats.

**Exact receipt:** [Successful manual native workflow 42211184959](https://github.com/FlareZ123/experiment-01/actions/runs/42211184959), main revision `5b5ed3ec570a786141eaa7a4ab6ff52970e11e59` with pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: **16/16 ADP native tests passed, 0 failed**. The separate [six lock negative controls](../agent30-official-ranger-player-item-lock-20261105.md) also passed on that run: Budew Item lock cleared, Vileplume Ability Item lock persists, Active Stoutland prevents Ranger itself. No upstream Twinleaf changes were made.

## Strategic relevance and limits

This confirms a **specific accessible tactical effect of Ranger** against the one authenticated Top-32 opponent 60 that carries ADP. Original source rank 19 has 4 DDE and an ADP, and the two candidate 60s include Ranger. The opponent must actually invest in Altered Creation-GX first, and the defender must legally play Ranger on a later opportunity. Ranger consumes a Supporter turn that could instead advance setup, Energy, gust or draw; its sole presence in the 60 does not guarantee access. Raging Bolt's other attacks and resource routes remain live, and the source can replace a candidate Temple of Sinnoh with a held Sky Field.

This is **not** a successful full-game counter, a measured matchup improvement, a rate estimate, a proof of natural access, or a universal blanket declaration that Ranger is optimal. The original field still has **29/32 authenticated originals, missing ranks 23/25/28; zero competitively qualified matches and no selected final 60**. To affect the single-deck selection gate, the common two-seat actor-only policy needs real, actionable opportunities to play Ranger under correct Supporter contention and realistic source replies. Exact source, candidate, random deal, and decision-policy identity must be retained, and any Tempo/Stadium opportunity costs observed in actual game outcomes.
