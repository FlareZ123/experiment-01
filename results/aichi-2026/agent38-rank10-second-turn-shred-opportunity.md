# Rank-10 source-game extra-turn Mimikyu Shred knockout opportunity

**Agent 38, 17 October 2026 UTC. Source-based conditional tactical finding, full-game fork under compiled verification. No qualified competitive games.**

## Compiled authentic source-fork outcome (17 October 2026)

[Manual Mimikyu CI run 38995670174](https://github.com/FlareZ123/experiment-01/actions/runs/38995670174), at commit `95891395`, successfully compiled the pinned engine, passed **all three new pure fork tests**, and **completed the full source-dealt control and Shred counterfactual** before a separate older staged-fixture assertion caused the overall workflow to turn red. The complete machine-readable [authentic source fork artifact 12086923825](https://github.com/FlareZ123/experiment-01/actions/runs/38995670174/artifacts/12086923825) was uploaded successfully.

The fork passed its strict requirements:
- First divergence occurs at **root action 215**, the original Mimikyu `RetreatAction` versus a legal `AttackAction('Copycat')`.
- All preceding root actions, as well as zone and Card-history hashes immediately before action 215, matched exactly. They also match the prior, independently archived root source hashes cited below.
- The actual game presented `ChooseAttackPrompt` id **136** and accepted printed `Dialga-GX UPR` **Shred**.
- Original branch: completed engine game at turn **31**, **233 main actions**, winner **physical slot 0 (rank-10 Regidrago)**, remaining Prizes **0 / 4** (Regidrago / champion).
- Counterfactual branch: completed engine game at turn **38**, **287 main actions**, winner **physical slot 1 (rank-1 Shadow Rider)**, remaining Prizes **3 / 0** (Regidrago / champion).
- The printed Shred attack dealt the eligible 80 damage for the two-Prize Regidrago KO, and subsequent bot-game actions diverged naturally. The source branch records Mimikyu's turn-28 `Copycat`, followed by the champion's finishing turn-38 `Latias ex` `Eon Blade`.

**Result classification:** a *real, source-locked, one-deal policy counterfactual that reversed the engine-reported winner*. It demonstrates a consequential original bot-decision defect on the fixed rank-1 list. It is still fully **unqualified for competitive win-rate inference** because the opponent policies, hidden-information boundary and complete paper-rule implementation are unqualified, and only one seed/starting orientation was evaluated.

**Separate CI red gate:** The existing `mimikyu-extra-turn-shred-action.cjs` staged mechanical test, which ran **after** the successfully uploaded authentic fork, failed on the unrelated assertion `candidate.usedTurnSkip === false` because the unarmed field was `undefined`. Agent 38 corrected the test to require `usedTurnSkip !== true` in commit `2f338b9f`. A compiled rerun is needed to establish fully green current-head CI; the earlier real source-fork evidence remains intact.

## Authenticated physical game state

The [compiled live-root artifact from manual CI 38992559596](https://github.com/FlareZ123/experiment-01/actions/runs/38992559596/artifacts/12085698259) contains two branches for exact published Aichi rank-10 Regidrago against rank-1 champion Shadow Rider in physical seats 0 and 1. In the alternate at seed **4246551499**, the champion's Mimikyu copied Regidrago's `Apex Dragon` to use its **own discarded Dialga-GX UPR `Timeless-GX`** on turn 27, gaining a consecutive turn.

The recorded, already-dealt start of candidate turn **28** has:
- **Active Mimikyu GRI**, with **two Basic Psychic Energy** and no damage.
- **Champion `usedGX:true`**, with its Dialga-GX UPR in its own discard pile.
- Opponent's last declared attack still **Regidrago VSTAR SIT `Apex Dragon`** (non-GX).
- Opponent's Active **Regidrago VSTAR SIT at 210 damage**, 280 printed HP and attached Grass, Fire, Grass Energy.
- Champion at **4 Prizes remaining**, Regidrago opponent at 3.

In the source-controlled original game, the bot proceeded to a `RetreatAction` on **root dispatch 215** (the actual Mimikyu fled to Latias ex) and a `PassTurnAction` on dispatch 216. The exact pre-retreat `sourceZoneSnapshot` SHA-256 is `5a27a7fa4d3e9cbef465675b05cf2270f0550851f4cc579940a551c3ade70b4d`; the corresponding Card-history continuity digest is `0faef7ac48c4f7a82c92413a3e0831b33bcc5ad162336e451d4d8ae4d6235548`.

## A plausible stronger action

The card database's Mimikyu GRI `Copycat` attack costs Psychic and Colorless and permits copying the opposing Pokémon's previous non-GX attack. The previous opposing turn remains turn 26 because the immediate consecutive turn arose from the copied `Timeless-GX`. The printed Regidrago VSTAR `Apex Dragon` may use any attack on a Dragon Pokémon **in the attacking player's discard pile**. The champion's own discarded Dragon-type Dialga-GX UPR has `Shred`, which deals **80**, ignoring effects on the Defending Active.

Thus a second `Copycat → Apex Dragon → Shred` on turn 28 would deal 80 to the already 210-damaged opposing Regidrago VSTAR. **210 + 80 = 290, enough to Knock Out its 280 HP and claim 2 Prizes.** Shred is a non-GX attack, so spending the once-per-game GX attack on the prior turn is not by itself a barrier. The separate [Agent 1 staged true-Store regression](../../simulation/twinleaf/mimikyu-extra-turn-shred-action.cjs) executed the exact nested attack chain after `usedGX:true` and checked 80 damage, KO, Prize collection and a no-KO control. That stage is source-card-mechanics evidence with prepared zones.

This is a **source-specific response hypothesis** pending authentic uninterrupted game continuation. It leaves the underlying fixed 60-card list unchanged. Even a correct prize-taking branch does not ensure victory against the opponent's remaining Bench and future actions.

## Executable authentic continuation

[Research-only action and prompt fork](../../simulation/twinleaf/mimikyu-turn28-shred-fork.cjs) replaces the *already proposed* physical turn-28 RetreatAction with `AttackAction('Copycat')` and then selects `Dialga-GX UPR`'s real printed `Shred` object through the source `ChooseAttackPrompt`. It checks public state, opponent history, the exact discarded Dragon and existing Psychic attachments. The [full source-deal comparator](../../simulation/twinleaf/rank10-mimikyu-shred-source-fork.cjs) demands identical archived pre-decision zone and Card-history digests, root-dispatch prefix equality through step 214, and an unmodified control result. [Dedicated pure falsification tests](../../tests/mimikyu-turn28-shred-fork.test.cjs) exercise choice, absence and illegal opportunity guards.

The manual [rank-10 Mimikyu paired workflow](https://github.com/FlareZ123/experiment-01/actions/workflows/mimikyu-rank10-pair.yml) now compiles and runs this continuation before the older staged tests. Initial compiled run [38995670174](https://github.com/FlareZ123/experiment-01/actions/runs/38995670174) was dispatched at head `95891395`; its result and any blockers must be read directly before promoting this conditional line.

**Evidence status:** Card printing and physical turn-28 board are checked; staged chained Shred KO was previously compiled and proven. Full-deal fork and later policy decisions remain to be confirmed. `qualifiedForCompetitiveInference:false`.
