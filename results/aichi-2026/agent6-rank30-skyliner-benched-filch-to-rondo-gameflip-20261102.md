# Rank-30 original-source Skyliner Bench creates a native three-attack Rondo Prize sweep

**Agent 6 | 2 November 2026 | one retrospectively selected original source physical deal; unqualified development evidence.**

## Tested ALS and observation

Against the unchanged New Moon Lockbreaker candidate, the **original rank-30 source 60** is playing at physical seat **0** on the previously inspected source slot B, seed **233633536**. At genuine global turn **33** the source has:

- Active **Mimikyu GRI**, with one **Telepath [P] Energy M3**, whose default source bot would choose **Filch**;
- a Benched **Latias ex SSP**, with face-up **Skyliner** (its printed Ability says *Your Basic Pokémon in play have no Retreat Cost*, with no Active-only restriction);
- Benched **Lillie's Clefairy ex JTG** holding **two actual Psychic Energy MEE**;
- the candidate's Active **Duskull VIV** and a full five-Pokémon candidate Bench;
- both players' Benches full, making Clefairy's printed Full Moon Rondo **220 base damage** (20 + 20 for each of 10 Benched Pokémon). Weakness may increase damage to eligible targets.

The native Store's **CheckRetreatCostEffect** returned **0 Energy**, despite Mimikyu holding a Special Energy. The source had not previously retreated this turn; source `retreatedTurn=0`. A reversible native Store fork allowed the original owner Pass-equivalent attack decision at this exact state to be replaced by real **RetreatAction(101,0)**. The Store accepted it. The subsequent unchanged two-seat bot **independently declared Full Moon Rondo** against Duskull, which the native Store resolved for a Knock Out and Prize.

The intervention is a **retrospective source action counterfactual**. No card or decklist was changed. The original headless action ledger records the originally proposed Filch even when the Store actually executes Retreat; that recorded Filch must not be interpreted as a second executed attack. The independent Store receipt and later native attack settlements are the physical evidence.

## Native 4-game A/B result

[GitHub Actions run 41386142870](https://github.com/FlareZ123/experiment-01/actions/runs/41386142870), [archived full JSON 13114964620](https://github.com/FlareZ123/experiment-01/actions/runs/41386142870/artifacts/13114964620), ZIP SHA256 `0fd55be5791ec28704395429ffe1ea22c747f0535968a66f42fc55d68302e366`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, source commit `5d4c5fafde767284798113973f32ce4720fd8023`.

Exact source slot B, unchanged original source printed 60, same opponent and candidate 60s, common owner-public Psychic Bench attachment policy in both arms, **two candidate games × control/treatment = four native Store games**, **two physically identical paired deal fingerprints**, **zero native Store errors**, **zero competitively qualified games**.

| Opponent candidate | Original owner choice (control) | Native Store retreat and Rondo (treatment) |
| --- | --- | --- |
| Champion reference | Source game already terminated before turn 33; no eligible fork; untimed native winner candidate | Same candidate winner; no fork |
| New Moon Lockbreaker v1 | Mimikyu Filch on turns 29, 31, 33 and 35; **no Prizes taken**, untimed native winner **candidate seat 1** | Genuine native Skyliner zero-cost retreat at turn 33, then Full Moon Rondo on turns 33, 35, 37; native winner **original source seat 0**, **6 Prizes taken** |

The recorded unqualified engine result changes from **candidate victory [source 6, candidate 6 Prize cards remaining]** to **source victory [source 0, candidate 6 Prize cards remaining]**. A meaningful single-deal winner flip was observed. The printed attack and source Prize evidence show a coherent sequence:

| Global turn | Source attack | Opposing Pokémon Knocked Out | Source Prizes remaining |
| --- | --- | --- | --- |
| 33 | Full Moon Rondo | Duskull VIV | 5 |
| 35 | Full Moon Rondo | Mewtwo & Mew-GX | 2 |
| 37 | Full Moon Rondo | Squawkabilly ex | 0 |

The candidate made genuine subsequent actions, including `PlayCardAction Duskull` and `PlayCardAction Telepathic Psychic Energy` on turn **34**, and `PlayCardAction Trevenant & Dusknoir-GX` on turn **36**, then Passed. The final Rondo sequence ended the game. The source's first extra Prize came from Duskull and the largest single swing was **3 Prizes** from Mewtwo & Mew-GX.

## Reliability and limits

This is the opposite of a claim that the source or any candidate now achieves the field objective. The experiment used a **previously inspected source seed** and its original 60, so it is subject to retrospective selection. The two players still use a partially generic headless policy; an external real opponent may choose much stronger actions. The game is **untimed** and has no game-level paper-rule, full-information-set, or tournament-clock qualification. The bot initially fails to choose the winning-looking retreat; we forced one legally accepted Store action at the source's original attack decision. The native action ledger's first attack label is stale under Store override, requiring the independent Store acceptance audit and settled-board records.

The card-pool text and native CheckRetreatCostEffect together establish **why Bench Latias ex matters**: Skyliner protects this mobility route without Latias occupying the Active Spot. Native settle/prize continuity separately establishes why Clefairy's Rondo is materially better than the source's original Filch in this **particular** state. It does not generalize to all opponent positions or all Mimikyu/Latias/Clefairy draws.

## Code, next playable-policy work

- `simulation/twinleaf/agent6-rank30-native-filch-rondo-fork.cjs` runs the reversible source-only actual Store fork with the real cost and acceptance receipt.
- `simulation/evaluation/agent6-rank30-filch-vs-rondo-native.cjs` executes the four archived original-deal games; the workflow remains manual-only and default-off.
- `simulation/twinleaf/agent6-owner-public-skyliner-rondo-frontier.cjs` and canonical root option are a first-generation **actor** policy initially scoped to uncharged Active Latias, already verified on source slot A. For this newly discovered stronger B case, extend the **detached owner-view policy** to permit a zero-cost retreat when **Benched Latias ex grants Skyliner**, an Active Mimikyu is doing Filch, and Rondo can take an immediate publicly estimated Prize. Preserve stronger Active attacks. Require a real `RetreatAction` at the native root ledger, Store-confirmed energy preservation, Rondo declaration, settled Prizes and true opponent replies on matched original deals.
- Then validate new prospectively registered original deals and assess other source matchups. Preserve game-level engine aborts as failures, not omitted trials. Do not report a field win rate until the 29/32 original list roster is completed and a credible qualified two-seat policy exists.

**Conclusion:** The original rank-30 source has a native-proven **Bench Latias Skyliner → funded Clefairy Rondo** ALS that the current common bot misses. In one exact historical deal that miss reverses the engine winner. The strongest next step is implementing an authentic actor-owned, matchup-sensitive option and testing it without using opponent concealed information.
