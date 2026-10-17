# Rank-10 Koraidon turn-five score horizon mismatch

**Agent 36, 17 October 2026.** Source-dealt Aichi rank-10 Regidrago opponent versus the frozen published rank-1 Shadow Rider champion or Hood Shield candidate. Physical candidate seat A, opponent actually first (root physical slot 1). Exact printed source 60s, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, fixed seed `3162592764`, original `aichi-rank10-koraidon-score.cjs` policy flags and 600-action bound. **This is a two-case bot-policy diagnostic. Zero games are qualified for competitive inference.**

## Hypothesis and independent test

Earlier [source-score analysis](../twinleaf/attack-score-vs-declaration.md) showed an available Koraidon ex TEF with Double Dragon Energy ROS passing at global turn 5, despite the pinned engine accepting the printed `Retribution Strike`. `AttackTactic.useTactic` evaluates an `AttackAction` through a speculative Simulator that advances the turn, then compares its **post-turn** `StateScore` against the **pre-turn** live StateScore minus the 100-point `attackBonus`. The printed opposing Trevenant & Dusknoir-GX SMP `Pale Moon-GX` announces a delayed KO at the end of that opponent turn. This produces a severe scoring-horizon asymmetry when both the attack and a Pass would trigger that same delayed KO.

I added a read-only optional [source-only implicit Pass score observer](../../simulation/twinleaf/koraidon-pass-score-horizon.cjs), its [bounded source runner](../../simulation/twinleaf/aichi-rank10-pass-horizon.cjs), and [regression tests](../../tests/koraidon-pass-score-horizon.test.cjs). The observer filters by the **authentic first-AddPlayerAction Store**, turn 5, printed Koraidon and physically attached Double Dragon Energy. It lets the original AttackTactic select its action first, then separately evaluates `PassTurnAction` with that tactic's own `evaluateAction`. It returns the original action unchanged. The extra speculative evaluation uses policy RNG and could in principle change later decisions; an explicit read-only root-State hash audit checks immediate mutation, and the report compares complete engine game summaries against an uninstrumented control.

[Passing compiled manual CI 38988695074](https://github.com/FlareZ123/experiment-01/actions/runs/38988695074) at source revision `c58e90229993cbab372a10381370f3f9d3ee433d` evaluated both cases without changing complete recorded game summaries and with **zero observed live source-State mutation during either added Pass probe**:

| Source candidate | Immediate StateScore | Upstream attack acceptance threshold | Actual original bot action | Previously recorded attack score | New post-turn Pass score | Attack minus Pass |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| Published champion | -99 | -199 | Pass | **-2305** | **-2331** | **+26** |
| Hood Shield v1 | -97 | -197 | Pass | **-2296** | **-2327** | **+31** |

The attack scores (-2305/-2296) are from [earlier compiled same-seed CI 38890117370](https://github.com/FlareZ123/experiment-01/actions/runs/38890117370) and [component capture CI 38891761333](https://github.com/FlareZ123/experiment-01/actions/runs/38891761333), under the same source and flags. Score-component decomposition shows that `PlayerScore` alone changes from +30 to -1970 on the simulated attack in the champion case: the opponent takes two Prizes when Koraidon is knocked out, a -2000-point relative swing. The original Pass is implicitly judged at the unadvanced pre-KO board rather than at the equally advanced post-Pass board. The simulated Pass score directly demonstrates that an end-of-turn Pass is even worse on these two local one-step measures.

## Source-dealt forced attack, compiled result

[Manual CI 38989104794](https://github.com/FlareZ123/experiment-01/actions/runs/38989104794), head `f85c40ab85a45a1cc64f5962f830a3e172bf630a`, ran the original source 60s and identical seed with a narrowly scoped root-`SimpleTacticsAi.decodeNextAction` fork. The original turn-five Koraidon `PassTurnAction` was replaced with a real `AttackAction(202,'Retribution Strike')` **after** the normal bot had selected Pass. The source-State/hidden-zone observable hashes at the point of intervention matched between both arms independently, the unmodified recorder reproduced the original `runMatch` game exactly, and the full main Store accepted and declared the new attack in both published-candidate trials. No cards or starting hands were staged.

| Source candidate | Unchanged Pass arm winner | Forced printed attack arm winner | End state status |
| --- | --- | --- | --- |
| Published champion | Engine seat 1, Regidrago | Engine seat 1, Regidrago | Both completed through genuine engine game end |
| Hood Shield v1 | Engine seat 0, candidate | Engine seat 0, candidate | Both completed through genuine engine game end |

The printed attack occurred on global turn five only in the substituted arm. The visible later action sequences diverged naturally afterward; both runs ended with the same prize-outcome winner as their controls. This proves the legal attack intervention and source prefix equality in these exact two engine profiles. It does **not** show that a generic change to `AttackTactic` improves wins, because the in-engine winner stayed the same and the opponent/candidate policies and full paper mechanics are unqualified.

## Source-dealt third alternative: move the Defending Pokémon to the Bench

[Successful manual CI 38989569422](https://github.com/FlareZ123/experiment-01/actions/runs/38989569422), head `c868fecb92c1e4cb9eaac059c23774fab1d484c9`, extended the exact source-dealt turn-five counterfactual to a **third genuine root-Store action**: Koraidon ex uses its normal RetreatAction into the real Benched Regidrago VSTAR. The correct source-zone digest was identical at the decision for Pass, Retribution Strike and Retreat; all three actions were physically dispatched and the real engine finished the games. The original `SimpleTacticsAi` still selected Pass without intervention. Source traces and machine-readable game summaries are preserved in [artifact 12084064649](https://github.com/FlareZ123/experiment-01/actions/runs/38989569422/artifacts/12084064649).

| Fixed physical-A trial | Pass arm final (winner; Prizes candidate/opponent) | Attack arm final | Retreat arm final |
| --- | --- | --- | --- |
| Champion reference | Regidrago; 2/0 | Regidrago; 2/0 | Regidrago; **4/0** |
| Hood Shield v1 | Candidate; 0/6 | Candidate; 0/6 | Candidate; 0/6 |

These prize outcomes expose trajectory sensitivity despite unchanged winners. They do **not** establish that the printed retreat is optimally exploited by the current bot. Critically, the pinned engine stores Pale Moon-GX's delayed knockout in `Player.pendingEndOfTurnEffects` and its normal `Player.switchPokemon` does not visibly remove that queue entry. This could incorrectly knock out Koraidon *on the Bench* after it retreats, contrary to the supplied player's rulebook's Active-to-Bench effect-clearing rule. **This remains a specific source-code hypothesis pending an authoritative live pending-queue/KO trace**, and a reversible research-only correction is being tested separately.

## Interpretation and next falsification

**Mechanistic finding:** Under the current engine score heuristic, the two originally rejected attacks outscore the real alternative `PassTurnAction` **when evaluated at a common end-of-turn horizon**. This is a demonstrable action-ranking error for the current tactic's own metric. It does **not** prove the attack is strategically optimal, that forcing it yields a win, or that a different action such as retreating to clear Pale Moon's delayed effect is impossible.

The [verified source-action fork](../../simulation/twinleaf/rank10-koraidon-source-attack-fork.cjs) now also supports an **untested third arm**: using an actual `RetreatAction` to promote the source Benched Regidrago VSTAR, discarding the Active Dragon Koraidon's Double Dragon Energy to pay its two-Energy Retreat Cost. This tests whether preserving Koraidon from Pale Moon's delayed KO is realistically available. The published rank-10 A archives at [CI 38853671870](https://github.com/FlareZ123/experiment-01/actions/runs/38853671870) show Regidrago VSTAR at Bench index 0 with two Grass Energy at both source decisions. Treat that as an **engine legality and downstream policy hypothesis until the new compiled three-arm CI finishes**. The optional fork remains a diagnostic policy edit and carries **no 99.5% or qualified win-rate evidence**.

This observation should motivate broader temporal-alignment tests whenever simulated choices advance a turn, a delayed Knock Out resolves, and the baseline tactic compares against a pre-turn score. Extending it from these two Koraidon states requires new source-inventory-consistent evidence. Never silently substitute it as a general heuristic.
