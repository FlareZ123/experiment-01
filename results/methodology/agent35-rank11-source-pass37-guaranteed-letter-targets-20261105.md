# Agent35: source rank11 Pass37 has guaranteed Professor's Letter Energy targets

**Date: 2026-11-05, 18:05 UTC. Class: documented paper-card prerequisite and zone-count inference from original-source state; no native counterfactual action or game win.**

## Independent same-root evidence

Two actual native replay archives independently reproduced the **same printed original-source registration, original entire physical deal, and identical accepted Store action tape** at `11:102:A:champion-reference`, original rank11 owner **seat1**, turn **8**, accepted Pass ordinal **37**:

1. **Agent20 pre-choice actor observation:** [GitHub Actions 42078785352](https://github.com/FlareZ123/experiment-01/actions/runs/42078785352), artifact **13438739276**, zipped SHA256 `0a792a96fe030e30c6a6f5310453985f71d9f07021dbba84a8acb503e3abd3ff`, inner `agent20-source-pass-v5-owner-evidence.json` 52309 bytes SHA256 `bb0a9545ed1d20678a1261478f4e099dcfd8cfa3c71bc5b60b453c0ceae79d6c`. It samples `actorObservation` **before** the real owner decoder chooses `PassTurnAction`, with only owner hand and public board.
2. **Agent35 post-choice, pre-Store observation:** [Actions 42079458048](https://github.com/FlareZ123/experiment-01/actions/runs/42079458048), artifact **13440370610**, zipped SHA256 `c5475bf306f5360efad1e6c8fdfeb2ac59051bba1853575e1560735759596517`, inner `agent35-v5-original-owner-pass.json` 128814 bytes SHA256 `23631b6c2cb8c5a38957167579b1fdcbb6035543ced1665d0e8373ef56bfe73f`. Exact all-eight historical deal and action-ledger hashes, all **33** source owner Pass hand/public-board snapshots, and all 27 candidate Pass snapshots passed native CI gates.
   
The independently captured rank11 owner hand printing arrays match *exactly*. Their source Active/Bench names, energy counts, and Stadium also agree, as do their opponent Active/Bench and visible Energy counts. The two observations independently report:

- Owner hand: **Guzma BUS, Float Stone BKT ×2, Professor's Letter BKT, VS Seeker PHF, Dark Patch ASR, Quick Ball FST**.
- Owner field: **Mega Absol ex** Active, **Squawkabilly ex** and **Oranguru V** Benched; **zero Energy cards** attached on all three Pokémon.
- Owner discarded cards: **Trubbish FST** only; **Lost Zone empty**; resolving Supporter empty; no Stadium.
- Opponent field: Active **Latias ex** with three Psychic Energy; Bench **Lillie's Clefairy ex** and **Mimikyu GRI**, without attached Energy; no Stadium.
- Owner private-zone counts: **43 cards left in deck, seven in hand, six Prizes**. Three occupied own Pokémon and one discarded Trubbish complete the 60 physical cards: 43+7+6+3+1=60. The actual pre-choice public Item-lock flag is **false**, as are the other owner play locks; Energy-attachment quota `energyPlayedTurn=0`.

## Guaranteed basic Energy search targets

The authenticated rank11 original printed sixty in [`results/aichi-2026/full-decklists.json`](../aichi-2026/full-decklists.json) includes **eight Basic Darkness Energy cards**. The pre-choice observed seven-card owner hand, all public attachments, discard and Lost Zone have **zero Basic Darkness Energy cards**. Even if **all six face-down Prize cards** are Darkness Energy, at least

```
8 printed Darkness Energy - 0 observed outside deck/prizes - 6 maximum Prized
= 2 Basic Darkness Energy physically in the remaining 43-card deck
```

This bound does **not** depend on guessing a hidden Prize identity, hidden deck order, mulligan contents, opponent hand, or source K1 search knowledge. In the supplied complete card list `cards/en/xy8.json`, `Professor's Letter` (`xy8-146`, BREAKthrough / BKT) is an **Item** that searches for **up to two Basic Energy cards**, reveals them, and adds them to the hand before shuffling. The supplied Advanced Player's Rulebook permits using multiple Items each turn, requires satisfying card conditions, and allows bounded category searches to choose eligible cards. Two eligible Darkness Energy cards are **guaranteed** to be present.

The real Turn8 opponent's public in-play Abilities (`Skyliner`, `Fairy Zone`; Mimikyu has no Ability) and all public Tools/Stadium shown contain no Item lock. The source owner's `itemPlayLocked:false` and the real owner-held printing establish **a concrete payable paper Item line**:

`Professor's Letter BKT (in own hand) → search two Basic Darkness Energy from own deck → reveal and add to own hand`.

After this search, the owner's `energyPlayedTurn=0`, `energyPlayLocked:false`, and zero-Energy field give a **separate ordinary optional attachment** of one acquired Basic Darkness Energy to Mega Absol ex (or another eligible own Pokémon). The immediate Attack cost of Mega Absol still requires further Energy, so no same-turn attack is asserted.

This is a **constructive paper-card action** for a frozen native source Pass. The Agent20 native necessary-condition screener reported `nativeEnumeratorOffered:true` and `paperPlayable:null` for Professor's Letter because its generic screen does not certify search targets. The independent eight-card zone accounting above resolves **the printed Item's target-availability prerequisite for this exact source state**, while leaving policy preference and gameplay value open.

## Critical limitations and next native experiment

- No **actual alternative Professor's Letter `PlayCardAction` / ChooseCardsPrompt / physical hand increase / attached Energy** has yet been accepted by native Store in this same initial deal. A proof that the printed Item *can* be played must not be reported as proof that the selected current bot *did* play it.
- No account has yet established whether spending Professor's Letter immediately, saving it for a different turn, or playing Guzma or Quick Ball is **strategically optimal** against the real opponent follow-up. The original source Pass was accepted; the opponent continued into an Eon Blade declaration, and the original trial was **root-cap-censored**, not completed.
- The agent20 pre-choice snapshot supplies actor-visible facts; the post-choice snapshot confirms no hand/board discrepancy at these selected checkpoints. Neither proves all other game-state components were untouched by the bot.
- The source original deck itself is an authenticated **rank11 competitor**, not our proposed fixed winning list. A source-policy defect is a benchmark-competence issue, and fixing it can make the candidate's measured win rate **worse** by strengthening opponents.

**Next required test:** freeze a *separate* same-deal rank11 source-only counterfactual: control native Pass37 vs one real owner-held Professor's Letter Play to two owner-deck Darkness Energy, prompt settlement, actual Energy attachment, and full opponent response. Preserve *all negative conditions*, including Store rejection, malformed prompt, unreachable root, or time/cap censor. Never count a new game win until complete paper and policy validation.

**Field-wide status:** 29/32 authenticated original inventories; ranks23/25/28 missing; zero competitively qualified games; 99.5% remains unproven.


## Additional longitudinal evidence from full same-eight source census (18:18 UTC)

The validated Agent35 **33-source-Pass** native observer also shows this exact original rank11 source's single **Professor's Letter BKT** remains in the **owner's actual hand** at *all five* of its selected Pass roots: ordinals **11, 18, 29, 37, 45**, global turns **2, 4, 6, 8, 10** respectively. The same owner-visible public boards at **each** of these five Passes contain **zero Energy attachments** on its Active and all of its Benched Pokémon. These are original native policy and Store records, with the same physical seed, and cannot be construed as five independent games. The count does establish a sustained action-selection problem: the physical source owner repeatedly retained the only basic-Energy search in hand while never attaching any Energy across these recorded Passes.

The **quantitatively complete six-Prize guarantee** above is formally certified for root37 using Agent20's separate pre-choice owner discard/Lost-Zone/turn-quota packet; earlier original Pass roots have post-choice owner hand/board snapshots but no equally complete contemporaneous public discard/Lost-Zone packet, so they are *observed repeated opportunities for inspection*, not separately paper-certified action lines. A higher-value follow-up, after the source rank11 Letter37 positive Store test, may promote the intervention to first reachable source Pass11. It must use a **new** separately frozen initial-state branch, because playing the Item at Pass11 will change all later source hands and accepted-root tapes.
