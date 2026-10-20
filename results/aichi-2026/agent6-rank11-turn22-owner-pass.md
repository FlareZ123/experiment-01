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

## Validated native source-side Quick Ball intervention, 20 October 00:58 UTC

The exact conditional intervention above **was executable** in the pinned Store. [Existing manual-only CI 39350415586](https://github.com/FlareZ123/experiment-01/actions/runs/39350415586), source head `9be17e088fd3677029455996e185935cae094aa9`, successfully ran [the same-source replay](../../simulation/evaluation/agent6-rank11-turn22-quickball-fork.cjs); artifact **12232604457**, ZIP SHA256 `3e347d70f7e3d235443676f377f9e6b90d6fe99cefa428dcf84d5e7820c74372`. The established old four-action fingerprints, real source physical deal, both physical initial starts, all pre-turn22 Store actions, and all three unaffected historical arms were unchanged. No native reject occurred.

On true global turn22, source seat0 **played its actual Quick Ball** from hand at Store root155, selected a real source-owned `Battle VIP Pass FST` for its discard cost at root156, selected **zero** cards from its own restricted deck search at root157, and closed shuffle/wait prompts. The source then naturally played its held Tapu Lele-GX at new root160 and **passed** at root162. The one successful three-prompt-cycle intervention recorded `completedBalls:1`, `blocked:null`, and no synthetic cards.

This **did alter the next candidate decision sequence**: the second copied Poltergeist declaration was delayed from original root162/global turn23 to **root174/global turn25**, after another source turn. Unfortunately, the weak source bot again retained six Trainers, having obtained `Secret Box TWM`, so that second attack dealt a **300 printed base** to a fresh 280-HP Mega Absol ex and settled a 3-Prize KO. Both original and alternative ended as candidate-winning **engine terminals**, with original 164 actions/turn23 and alternative 176 actions/turn25. The changed root hash was `af3b4d65980e96edc96464f126255718a1e2f04a95c2303f0d3751f63ec8c06f`.

The key observed finding is therefore narrower and stronger: an expired VIP *could be legally discarded via native Quick Ball*, an action missed by the source's original policy; the resulting hand-burn changed the timing but by itself **did not reverse the engine outcome**. A strategically adequate source requires multi-turn replanning, because replacement Trainers can be drawn before the opponent's next attack. At the new second attack, Shopping Center EVS and Temple of Sinnoh ASR were still in the source hand. Testing whether either source-owned Stadium was legally playable on the intervening turn is the next concrete action-fidelity question.

All treatments above are selected after observing this historical deal and remain unqualified for strength inference. No early Garbotoxin pressure, human-level policy, hidden-information parity, full paper-time model, 32-list coverage or 99.5% competitive claim is established.
