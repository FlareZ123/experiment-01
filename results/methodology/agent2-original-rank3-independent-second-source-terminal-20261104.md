# Agent 2: Second distinct original rank-3 native source winner, 23 Burrows versus zero opposing attacks

**4 November 2026. Developmental native same-physical-deal mechanism audit. Competitively qualified games: zero.**

## Provenance and falsifiable reproduction

The frozen [32-original-full-60-source cohort](agent2-rank3-fss-float-natural-32-exposure-20261104.md) contained two native rank-3 source victories, including a [12-Burrow ending at seed 290134](agent2-original-rank3-bunnelby-native-burrow-terminal-20261104.md) in which the rank-1 opponent repeatedly used Mimikyu's Filch. This report examines the **other, independent** previously registered seed **290138**, not an additional newly sampled win. The two trials are distinct full physical decks, not treatment variants.

- **Registered opponents:** Aichi original rank-3 Snorlax Stall source seat0 versus original rank-1 Shadow Rider Calyrex seat1, 60 cards each, as converted by the established canonical printing adapter.
- **Fixed initial physical deal:** SHA-256 `e1c3a672fd79c6f80f116f4e3de8b3f59b36c606818e08da05a4336e739bd7f5`; **original source-deal** SHA-256 `c34ceb8378b0766437cee466c53ab2b696eed403ee88259ef469985dfd21a4b4`. Both exactly equal those from the earlier frozen 32-attempt dataset, checked in the executing code.
- **Card deck hashes and engine:** converted source SHA-256 `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`, reference `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Actual code:** [`simulation/evaluation/agent2-rank3-second-native-terminal-source-trace.cjs`](../../simulation/evaluation/agent2-rank3-second-native-terminal-source-trace.cjs), preregistration source commit `bc6489a7edbe9fdb629ba2eebe8a7c62dcfc39c3`, unchanged common canonical actor/root and supporter/energy policies, no treatment hook, action cap260. Only retrospective public attack/decision/board observers were added.
- **PASS:** [GitHub Actions run 41934971616](https://github.com/FlareZ123/experiment-01/actions/runs/41934971616), successful manual existing native workflow, [original machine-readable JSON artifact 13373921339](https://github.com/FlareZ123/experiment-01/actions/runs/41934971616/artifacts/13373921339), ZIP SHA-256 `4d276af53bc22011acacafe4dc27bf0af50f028fcbb27c9ca5b59c30223785a1`, uncompressed JSON SHA-256 `67b4d066a153cc8b24adb96a1ca93514a5258091f647ff9a1c8f7cc45bd68d83`.
- **Hard controls all passed:** exact source initial deal, full physical deal, prior **209-action native terminal with source winner seat0**.

## What the actual original-source native replay did

| Actual returned measurement | Source rank3 | Rank1 reference |
| --- | ---: | ---: |
| Native attack declarations | **23** | **0** |
| Attack name | Burrow (23) | None |
| Public attack transitions for Burrow | **23 actually settled** | Not applicable |
| Physical Energy on attacking Active | One Capture Energy RCL | No attack used |
| Prize cards at terminal | 6 | 6 |
| Deck cards at terminal | 23 | 0 |
| Native winner | **Rank3** | Rank3's opponent |
| Native terminal turn | **47** | **47** |

Rank-3 Bunnelby PRC was Active during all 23 corresponding real attack transitions, with one printed **Capture Energy RCL** providing the Colorless Energy required for Burrow. The real native attack declaration turns were **2, 4, 6, …, 46** (23 source turns), each followed by a settled public Store transition. The opponent's deck was at one card after source turn44 and at zero after Burrow on source turn46. The engine moved to FINISHED at the following player's turn-start, with rank-3 winner seat0, exactly 209 native actions, no Prize changes. This is a **native deck-exhaustion terminal**, not a Prize win.

In the source-player's 23 attack turns, its meaningful root-action audit includes only two other cards: Capture Energy played at turn2 and a Snorlax played onto the Bench at turn16. The printed Ω Barrage second attack was **not used** in this existing native baseline, so it presented only one Burrow per source turn.

## The decisive opponent-competence limitation

Unlike the other winning physical seed, rank1 made **zero native attack declarations throughout this match**. Its final public board nevertheless contained six Pokémon in play: **Active Dialga-GX**, three attached **Psychic Energy** cards, with Trevenant & Dusknoir-GX, Radiant Eternatus, Tapu Lele-GX, Lillie's Clefairy ex and Girafarig on its Bench. No Benched rank1 Pokémon had Energy at the final public snapshot. The source had Bunnelby Active plus Girafarig, two Snorlax and Articuno-GX on its Bench.

Dialga-GX's printed attacking costs include Metal symbols, so attached Psychic Basic Energies alone do not satisfy the attacks shown in the final public board. Dialga-GX is printed with a three-Colorless normal retreat cost, which three Psychic Energy can ordinarily pay, subject to any otherwise applicable retreat prohibition or modifiers. **The trace does not independently establish a legal retreat option at each pass or demonstrate an actual attempted retreat.** It does establish that the chosen bot never performed an attack while Bunnelby repeatedly milled.

A fixed 60 with a substantial number of opponent-favorable baselines can appear strong against this bot despite the absence of realistic combat. This second independent physical game therefore adds **evidence of opponent-policy weakness**, rather than independent evidence of competitive Snorlax Stall or a new candidate's tournament win rate.

## Relevance to the field objective

These two previously registered rank-3 source wins arose from **different opening physical deals** and distinct bad opposing response patterns: one rank1 repeatedly self-drew with Mimikyu Filch, the other rank1 did not attack at all for 47 global turns. Each remains a developmental native Store terminal under the unqualified common bot.

A useful next competence gate is an actual source and opponent root-funnel receipt showing whether rank1 can choose an affordable escape line, move Energy intelligently to a relevant attacker, or deny Bunnelby, plus an opponent decision policy that responds to public deck exhaustion and time. Even an improved bot remains subject to independent owner-hidden-information noninterference, card-text/rule validation, full field provenance, and 25-minute paper clock.

**Release verdict unchanged:** 29/32 authenticated originals (ranks23/25/28 absent), **0 competitively qualified games**, no selected fixed60, and no demonstrated 99.5% win rate. Do not double-count this diagnostic replay as a new game.
