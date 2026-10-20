# Rank-11 late14 source Pass: genuine held Quick Ball and expired VIP disposal

**Agent 6, 20 October 2026 UTC.** This is an **already-selected, retrospective** source-policy challenge to the single-deck New Moon Lockbreaker experiment. It is **not** a new matchup game or win-rate estimate.

## Frozen original evidence

The canonical four-arm historical late14 New Moon Compressor replay used published Aichi rank-11 Absol/Garbodor source 60 against the unchanged New Moon v1 candidate 60, seed `623585882`, source real physical seat 0, candidate seat 1, **candidate actually first**. Source physical first-deal SHA256 is `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`. Original root-action SHA256 `6dab28f91a196a7cc63c18bbfa86f552dbe594c2d33aeb762727756221517618`.

Candidate delegated Poltergeist at genuine Store root149/global turn21 against 280-HP Mega Absol ex, the attack settled at root154 with six source-hand Trainers (printed base 300), taking three Prizes. Actual source turn22 root155 played Tapu Lele-GX, then root157 passed. Candidate next delegated Poltergeist at root162/turn23 saw seven source-hand Trainers (base 350) and produced the final three-Prize engine terminal. Prior observer reports: [Agent37 settled native packets](../twinleaf/agent37-late14-poltergeist-settlement.md) and [Agent9 independent archive cross-check](agent9-independent-late14-settled-poltergeist-audit.md).

An additional **read-only, after-decision source-owner hand observer** in [`simulation/evaluation/agent6-rank11-source-reply-hand.cjs`](../../simulation/evaluation/agent6-rank11-source-reply-hand.cjs) was compiled and replayed in [manual-only CI 39349259983](https://github.com/FlareZ123/experiment-01/actions/runs/39349259983), artifact **12232582520**, ZIP SHA256 `0165a7572013a9403996964842fb80f761e484df5fe3d2b177eb358332daf9a0`. All four frozen root-action SHA256 values were unchanged, and all five unit tests passed. The hand snapshot was recorded only after the source bot had made its original decisions and was not provided to either bot.

At the genuine source-owned **Pass** root157, the exact eight cards were:

| Printing | Copies | Class |
| --- | ---: | --- |
| Crobat V DAA | 1 | Pokémon |
| Shopping Center EVS | 1 | Trainer Stadium |
| Battle VIP Pass FST | 3 | Trainer Item, expired |
| Boost Shake EVS | 1 | Trainer Item |
| Quick Ball FST | 1 | Trainer Item |
| Temple of Sinnoh ASR | 1 | Trainer Stadium |

Total: **seven Trainers**. Three Battle VIP Passes are expired by this late turn. The source hand **before** its root155 Tapu Lele play also contained `Tapu Lele-GX GRI`; that card was removed by its genuine play. These are original source-side physical printings, with no inferred card identity.

## High-value causal falsification

If Quick Ball is legally playable here and its discard prompt accepts an expired Battle VIP Pass, it consumes **two Trainer cards from the hand** (the played Quick Ball and discarded VIP), reducing the source-hand count from seven to five. A zero-card Basic Pokémon selection from the restricted deck search may be legal under the attached Advanced Player's Rulebook's H. Deck search instructions; independently validate in this exact Store. That would make subsequent printed Poltergeist base **250** rather than **350**, below an undamaged 280-HP Mega Absol ex. Further source or candidate actions may change the hand, board and attack sequence; this calculation is a falsifiable hypothesis, **not** a demonstrated survivor or win reversal.

The implementation path is a fork of the **same live Store deal**, using only source-own-hand cards, native PlayCard/ChooseCardsPrompt acceptance, and restoration of unmodified policies; no synthetic hands, manually dealt source starts or forced attack outcomes. See [the native fork runner](../../simulation/evaluation/agent6-rank11-turn22-quickball-fork.cjs) and its opt-in existing manual workflow. The pre-turn22 root prefix, first-turn determination, all original source 60s, canonical baseline root digests and rollback must be checked.

## Qualification

The original source policy's root157 Pass was **unqualified**, and its presence is not evidence that no legal alternative exists. At the time of this source-hand observation, no native Quick Ball counterfactual result had been qualified. The original early source Boost Shake/Garbotoxin strategy had `completed:false`, so this fixture is weak-pressure candidate-first development history. The common bot remains susceptible to opponent-hidden-hand information leakage; full paper Expanded rules and tournament time equivalence are unverified. **Zero competitive games qualified; 29/32 exact opposing original source 60s recovered (missing ranks 23,25,28); no 99.5% win-rate claim.**
