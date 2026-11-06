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

The unchanged, independently archived [Hood Shield v1](../candidate-hood-shadow-rider.json) and [Temple Shadow Rider v1](../candidate-temple-shadow-rider.json) each contain **one Pokémon Ranger STS 104**. Temple v1 additionally contains **two Temple of Sinnoh ASR 155**; Hood contains zero Temple. The [deterministic exact source-count audit](../../../tests/agent30-rank19-adp-ranger-source.test.cjs) keeps all three 60s unchanged. **Source audit CI is now verified:** the exact 60/printing/count checks and both unchanged challenger Ranger inventories passed on [manual native workflow 42211952993](https://github.com/FlareZ123/experiment-01/actions/runs/42211952993).

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

## Additional exact-source Stadium counteraction: Temple versus Sky Field

[Four-arm genuine-Store test](../../../tests/agent30-rank19-temple-dde-native.test.cjs) stages source rank-19 original **Arceus & Dialga & Palkia-GX CEC156** with one physically attached **Double Dragon Energy ROS97**, versus publicly active candidate **Temple of Sinnoh ASR155**; the source holds an actual **Sky Field ROS89**. Both attacker seats were tested with and without the source playing Sky Field. [CI 42211952993](https://github.com/FlareZ123/experiment-01/actions/runs/42211952993) passed **4/4 Stadium tests, 16/16 GX/Ranger tests, 6/6 Ranger lock tests**, all other previously registered native workflow steps, and the exact published-source 60-card audit. All passed on main head `31f375ccf819949dc4f21eff049972f60acd3e2f` against pinned native Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

| Original source reply | Active Stadium after reply | Native printed GX attempt | GX-use quota | GX damage and extra-Prize flags |
| --- | --- | --- | --- | --- |
| Source retains held Sky Field | Opponent Temple of Sinnoh | **Rejected**, DDE provides Colorless only | Unspent | false, false |
| Source plays held Sky Field | Source Sky Field, Temple to opponent discard | **Accepted**, DDE provides required Metal and extra Water | Spent | true, true |

Both cases preserved the physically attached DDE. Successful Sky Field play and full native attack-turn transition were observed in each seat. The source 60 contains **three Sky Field**, while the proposed Temple v1 fixed 60 contains **two Temple of Sinnoh**. These counts establish potential resource contention: even an initially effective Temple lock can be replaced by a currently held legal source Stadium, whereas source access and correct timing are not guaranteed. Treat the test as **staged mechanics, no complete game**, no empirical impact on candidate versus rank-19 win rate. A source-independent bilateral decision policy must adjudicate Stadium timing, replacement, Supporter contention and actual next-turn replies before these branches can contribute to deck selection.

**Critical comparative point:** Temple and Ranger interact with the **same source ADP+DDE game plan at different decision windows**. Temple may prevent activation of Altered Creation-GX in advance when it remains active. Ranger may erase its already-resolved persistent bonuses later without refunding the once-per-game GX-use quota. These are independent tactical contingencies, with different resource costs and counterplay. Strong preference between Hood (Ranger only) and Temple (Ranger plus Temple) cannot be inferred from the staged positive cases; the Temple variant gives up several other deck slots and faces source Stadium replacement.
