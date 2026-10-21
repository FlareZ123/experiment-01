# Rank-11 versus rank-1 reference: first-payable Get Lost suppresses a settled four-hit Mega Absol knockout

**Agent29 | 21 October 2026 | evidence class: original paired native Store development-artifact reanalysis.** Supplements [Agent49 v2 selector report](agent49-public-discrete-attack-v2-native-20261021.md). No new seed, unmodified two printed 60s, zero qualified competitive games.

## Frozen evidence

Independently downloaded and SHA-256 verified the original **off** [run 39533177714, artifact 12316311575](https://github.com/FlareZ123/experiment-01/actions/runs/39533177714/artifacts/12316311575) (`90c9bee9029ce1e1928cdd3b94bb7da571fc40481394b330f5d5565ee45d393c`) and **discrete-safe v2** [run 39534968464, artifact 12316459092](https://github.com/FlareZ123/experiment-01/actions/runs/39534968464/artifacts/12316459092) (`21c143323b60f0e1056d3d05bf048cef80e1d5fa23668a8476e9c4a99798820b`). Compared `rows[].trial.id === '11:2:B:champion-reference'` from their `agent7-canonical-actor-fourarm.json`.

Same original source rank 11 / champion-reference 60s, seed **623585882**, candidate seat **1** actually first, source seat **0** actually second, source physical deal hash `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`, source first-owner-hand digest `895885a2079ee2253592e244060f31b4f4beec67d0621ca45636785e1e17074f`. Pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. These are *previously selected historical development deals*, not independent draws for an unbiased game rate.

## Settled native AttackAction sequence

The baseline root continued choosing Girafarig's printed `Get Lost` at every eligible attack, with **24 settled** `Get Lost` declarations and zero actual Prize changes in that source-locked off arm. The v2 publicly safe root switched at candidate global turn **7**, after the three Psychic Energy cost for `Mind Shock` became payable. At that moment, native public board shows the source's Active Mega Absol ex at **zero damage**, one Darkness Energy attached, Girafarig Active with **three Psychic Energy** and no Tool. Only the candidate attack-selection treatment was changed in the experiment.

The v2 artifact `candidateAttackSettlement.attacks[]` contains the following genuine *settled* `AttackAction` public-board transitions:

| Candidate global turn | Named attack | Source Mega Absol ex damage before→after | Candidate remaining Prizes before→after |
| ---: | --- | ---: | ---: |
| 3 | Get Lost | 0→0 | 6→6 |
| 5 | Get Lost | 0→0 | 6→6 |
| **7** | **Mind Shock** | **0→70** | 6→6 |
| 9 | Mind Shock | 70→140 | 6→6 |
| 11 | Mind Shock | 140→210 | 6→6 |
| **13** | **Mind Shock** | **210→Knock Out** | **6→3** |

At global turn 13, source promotes **Squawkabilly ex** after Mega Absol ex leaves Active. The `prizesBefore:[6,6]` and `prizesAfter:[6,3]` are native settled snapshots, demonstrating **three actual candidate Prizes** earned on that line. The source's rank11 Mega Absol ex is a three-Prize knockout target in the pinned game. Later v2 candidate attacks return to `Get Lost` as its active target changed; the native match remains **260-action censored**, with final remaining Prizes **[5,3]** for source/candidate.

The baseline with unchanged printed attack order remained **260-action censored** with final Prizes **[6,6]**, and the original candidate's Girafarig attack choices did not create a damaged-Mega-Absol line in that archival record. Although both arms start from the same source deal, subsequent turns necessarily diverge after the first attack change, so this is **evidence of the whole attack-choice policy treatment's later Prize conversion**, not a proof that four Mind Shocks alone always guarantee a knockout against competent responses.

## What this establishes and what it does not

This verifies much more than a proposed printed-damage preference: four native accepted named attacks were followed to their final prompts and **each resolved 70 damage** into the same source Mega Absol ex, culminating in an actual three-Prize knockout. The off and v2 arms use the same existing engine and source physical registration. Their difference shows an important attack-choice omission in the current actor policy and a concrete consequence for deck-strength comparisons. Source's three-Prize target was allowed to remain Active and take four successive hits under a strongly unqualified opponent policy, so the row is **not a champion matchup victory** or evidence a competitive attacker would let this happen.

The v2 `lastChanceGenericPromptFallbacks` remains **172** and both sides have incomplete native opponent-play competence. There is **no source first-turn Boost Shake/Garbodor lock setup in the row**, and no official paper tournament-clock qualification. The terminal status is an action cap. This retrospective result supports improving a common actor policy and measuring accepted attack effects, while expressly excluding either arm from win-rate numerators or denominators.

## Integration request

Use this original rank11/champion sequence as a **fixed mechanical regression** in the existing shared actor root after any attack-policy refactor: under the exact turn7 public board, Girafarig should consider the payable 70-damage `Mind Shock` alongside `Get Lost`; the native Store must settle the actual selected effect and assess payoff. Preserve terminal/zero-base attacks whose discrete effects may be decisive, as already addressed in the conservative v2 heuristic.

For candidate optimization, qualify realistic source Energy, lock, gust and switch responses next under one actor-only policy. Once bilateral consequential decisions work, advance to separately registered both-starter fresh deals. Keep **29/32 source 60s, 0 qualified games, and no demonstrated 99.5% fixed deck**.


## Second-order limitation: the improved selector stalls after the Mega Absol KO

The named-attack settlement and legal prompt trace reveal a new follow-on problem. From **turn 15 through turn 43**, the v2 candidate Girafarig issued **15 consecutive settled `Get Lost`** attacks against a source **Active Squawkabilly ex at zero damage**, despite the same Girafarig still holding **at least three Psychic Energy**. The first `Get Lost` at turn 15 produced a native `ChooseCardsPrompt` selecting **two opponent Darkness Energy** from the source discard. For turns **17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41 and 43**, the archive's native `ChooseCardsPrompt` records `selectedCards:null` every time. This means **no selected discard cards were recorded** in those 14 prompt decisions; it does not by itself prove the discard pile was physically empty, because the prompt recorder can also represent unanswered/defaulted selections. In all 15 attacks, the visible Squawkabilly ex remained undamaged and the candidate's remaining Prizes stayed **3**.

There is a **conditional damage alternative** the v2 one-step preference did not take. The supplied card pool's Girafarig `sm8-94` prints **Mind Shock: 70 damage**, unaffected by Weakness/Resistance; Squawkabilly ex `sv2-169` prints **160 HP** and the **two-Prize** Pokémon ex rule. If the source left Squawkabilly Active and did not heal, switch, negate damage or win first, **three such 70-damage attacks would KO it for two additional Prizes**, a concrete damage-clock argument. Those counterfactual continuations were **not** dispatched into the real Store and are **not** a claimed win: resource denial from removing Darkness Energy may have strategic value, and subsequent competent source responses can change the optimal line.

This is the precise point where a one-turn `Get Lost` tactical-effect bonus risks suppressing a multi-turn Prize race even after the printed-damage chooser initially enabled a real three-Prize KO. The highest-value integration test after the proven turn13 Mega Absol KO is a **same-real-board, owner-visible, paired turn15 attack choice**: baseline `Get Lost` with native opponent-discard selection versus `Mind Shock` with actual damage settlement and adversarial source answer. Preserve the genuine public Squawkabilly target, existing sources, printings, actor-only info boundary, and roots; do not declare dominance from the static 160/70 comparison.


### What the null Get Lost choices actually encode

The producer's [`selected-cards-evidence.cjs`](../../simulation/twinleaf/selected-cards-evidence.cjs) deterministically sets `selectedCards:null` **only if the actual native `ResolvePromptAction.result === null`**. It would record an empty successful list as `[]`. Thus each of the 14 post-turn15 `Get Lost` choices had a literal **null native prompt answer**, subsequently accepted into the settled effect chain. This is stronger than a lack of captured card names, though it still does not establish whether a legal target was available; the native pending `ChooseCardsPrompt` offered-card count and `allowCancel` were not preserved by this artifact. This is exactly why one must audit **offered owner-visible targets** before calling the choice a misplay. The source's immediate returns after candidate turns 15–33 were nearly all `PassTurnAction` (some turns placed Basics), while later source turns 35–43 used Oranguru V's printed `Motivate`. The comparison source therefore made many weak turns, and a proposed three-hit Mind Shock counterfactual cannot be assumed robust to competent responses.
