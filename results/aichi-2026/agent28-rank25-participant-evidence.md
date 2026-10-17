# Agent 28: partial primary-source evidence for missing Aichi rank 25

**17 October 2026. Evidence level: participant-authored public tournament report plus published field roster. The registered 60-card list remains unavailable.**

## Identity and provenance

The official-derived [Limitless CL Aichi Open League 2026 results](https://www.limitlesstcg.com/tournaments/566) identify **rank 25, Kazuki Kumegawa**. The [Limitless decklist collection](https://www.limitlesstcg.com/tournaments/566/decklists) still omits the 60-card inventory. Repository `results/aichi-2026/full-decklists.json` also records that omission explicitly.

The participant's public [14 May 2026 article, “CL愛知2026エクストラ ベスト32 アロライワンショット”](https://note.com/kume_pokeca/n/n6cfd126f5774) identifies its author as **kume**, calls the played deck **Alolan Raichu one-shot**, and reports qualifying 25th in Swiss. [Pokekameshi's Top-32 compilation](https://pokekameshi.com/cl2026aichidec-extra/2/) identifies the same **kume** Alolan Raichu Top-32 report. These independently contextualize the roster's `Raichu Electrode Combo` archetype label without supplying a deck registration or copy counts.

The article's deck-construction discussion is **public before its paywall**. Its private deck-construction section begins at “デッキ構築解説”, after which the page offers a paid continuation. Do not infer the full list, ACE SPEC, printings, or quantities from a prior-era list, deck-archetype label, or rank-4 Raichu list.

## Documented opponent sample from the author's public report

| Swiss round | Opponent archetype named by author | Outcome |
| --- | --- | --- |
| 1 | Regidrago | Win |
| 2 | Regidrago | Win |
| 3 | Lightning toolbox | Win |
| 4 | Regidrago | Loss |
| 5 | Regidrago | Win |
| 6 | Roaring Moon | Win |
| 7 | Regidrago | Win |
| 8 | ADP / Dragonite | Win |
| Top-32 elimination | Mega Absol / Garbodor | Loss |

The firsthand reported Swiss record is **7-1**, including **4-1 against five encountered Regidrago opponents**. These observations are self-reported tournament outcomes without verified opposing exact lists, initial turns or game traces. They are **not** 80% competitive win-rate evidence for a reproducible pair, and do not estimate the rank-25 60-card matchup against our fixed candidate. Selection on Swiss success and finite opponent variation is severe.

## Card-level partial information and matchup mechanism

In the public article, the author explicitly describes the inclusion decision in Japanese as `クレッフィを採用できるデッキにしました`: their choice enabled **Klefki**, prioritizing suppression of opposing **Latias ex** and **Tapu Lele-GX** Basic Abilities. The same public discussion considers Item-lock escape and ability-lock disruption lines, including Ranger, Escape Rope, Canceling Cologne and Marshadow. **Discussion of an option is not evidence it appeared in the registered list.** Even the statement of Klefki adoption does not confirm its printing, count, starting frequency or use in any given game.

`resources/cards` (English card pool) contains Klefki `SVI 96` with the **Mischievous Lock** Ability: as long as it is Active, Basic Pokémon in play on both sides have no Abilities, except Mischievous Lock. This is a contingent Active-Spot interaction, and changes if Klefki leaves Active or its own Ability is suppressed. Its effect cannot simply be modeled as perpetual global Ability lock.

As a concrete reference comparison, the **published rank-1 Shadow Rider deck** has **seven copies of Basic Pokémon with printed Abilities**: 2 Tapu Lele-GX (Wonder Tag), 1 Latias ex (Skyliner), 1 Radiant Eternatus (Climactic Gate), 1 Marshadow (Resetting Hole), and 2 Lillie's Clefairy ex (Fairy Zone). The last five names and counts were extracted from the fixed `full-decklists.json`; the abilities were verified against the card pool at `resources/cards`. Klefki can suppress these Abilities **only while its Active-position lock is actually operative**. Rank-1's 4 evolved Shadow Rider Calyrex VMAX are a separate case whose Underworld Door Ability is not directly removed by a Basic-only lock.

This is a **possible first-turn / early lock threat**, not proof rank 25 routinely establishes Klefki. The specific claim that Klefki can shut down the rank-1 early Radiant Eternatus and Tapu Lele-GX entry lines is rules-conditional, subject to turn sequence, opponent choice and alternate card effects.

## Consequences for the 32-opponent acceptance gate

1. Maintain rank 25 as **`published_full_list=no` / `blocked_missing_list`**. Do not register the rank-4 Alolan Raichu list or any plausible Klefki variant as rank 25.
2. Preserve this article as **partial source evidence** for an independent missing-list search or separate, explicitly hypothetical robustness scenario. The source cannot yet define a fixed 60-card rank-25 trial.
3. Evaluate champion and challenger vulnerability to an Active Klefki via **source-legal board checks** (Klefki in play, position, Abilities not disabled, Basic status, alternative exits). Avoid scoring all Basic Abilities as permanently unusable when the source article merely discusses the threat.
4. Continue pursuing actual 60-card registration evidence for ranks **23, 25 and 28**. A favorable score against 29 known lists cannot establish the requested full Top-32 performance.

**Outcome:** participant-authored partial matchup and lock evidence for previously missing rank 25; **zero new full source lists, zero qualified games, no change to the 99.5% status**.
