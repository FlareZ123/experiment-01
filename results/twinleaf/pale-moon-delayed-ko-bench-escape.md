# Pale Moon-GX delayed Knock Out persists after the Defending Pokémon retreats

**Agent 36, 17 October 2026. Confirmed pinned Twinleaf fidelity defect in two exact Aichi source games.** Engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is a mechanically reproduced error and a research-only correction, **zero qualified competitive games**.

## Paper rule and pinpointed code paths

The supplied Advanced Player's Rulebook section **A-03 Retreat** says that after an Active Pokémon moves to the Bench, all effects of attacks affecting it disappear. Trevenant & Dusknoir-GX SMP's `Pale Moon-GX` creates an attack effect scheduled to Knock Out the Defending Pokémon at the end of its player's next turn. The Defending Koraidon ex TEF may retreat normally using attached Double Dragon Energy ROS, which provides two Energy to a Dragon Pokémon.

The pinned vendor stores this delayed KO in the **defending Player's** `pendingEndOfTurnEffects` array with a reference to the original `PokemonCardList`, via `ScheduleDefendingPokemonEndOfTurnEffect`. Its `Player.switchPokemon` swaps that exact CardList to the Bench and clears ordinary CardList attack effects without clearing this pending entry. The `RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS` reducer later consumes the pending entry and generates `KnockOutOpponentEffect` for that CardList, even when it is now Benched.

Traceable pinned source: [Pale Moon card](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts), [scheduled effect](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effects/effect-of-attack-effects.ts), [Player.switchPokemon](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/player.ts), [pending-effect resolution](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/attack-effects.ts).

## Direct source-State reproduction

[Compiled manual CI 38990149556](https://github.com/FlareZ123/experiment-01/actions/runs/38990149556), head `2576e15b7fed16ba101f1839bb85571534351be3`, successfully executed a source-preserving original versus corrected comparison in two source-dealt **physical candidate-A** rank-10 Regidrago matchups, against the rank-1 champion Shadow Rider and Hood Shield v1. The real opponent goes first; fixed seed `3162592764`. Both games used their exact source-resolved printed 60-card lists and unchanged setup/gameplay before turn-five Koraidon's Pass. No cards or game states were staged. Every arm replaces that real turn-five Pass with an actual legal `RetreatAction` into the source Benched Regidrago VSTAR.

The runner asserts that original and corrected branches have **identical pre-retreat source-State digests and deck hashes**. The root recorder captures actual before/after `RetreatAction` and subsequent `PassTurnAction`, including pending-queue target location and whether Koraidon is in its owner's discard. The opt-in research wrapper removes a pending effect only when its target was the departing Active CardList, leaving other targets untouched; it is restored after the game. [Complete JSON artifact 12084449589](https://github.com/FlareZ123/experiment-01/actions/runs/38990149556/artifacts/12084449589).

| Exact source candidate | Uncorrected post-retreat pending target | Uncorrected after end-turn Pass | Corrected post-retreat and post-Pass |
| --- | --- | --- | --- |
| Published champion | `Koraidon ex TEF` now on **Bench**, `Pale Moon-GX` KO still queued | **Koraidon in discard; Bench slot empty** | Queued KO removed; **Koraidon still Benched** |
| Hood Shield v1 | Same wrong queued KO on Benched Koraidon | **Koraidon in discard; Bench slot empty** | Queued KO removed; **Koraidon still Benched** |

Both games began turn five with **6/6 Prize cards remaining**. A Prize selection prompt may remain unresolved at the immediate end-turn dispatch boundary, so the snapshot's 6/6 *at that specific boundary* does not by itself establish whether or when Prizes are eventually taken. The reproducible difference in **Koraidon's survival** is already decisive evidence of the paper-rule mismatch.

The correction removed **exactly one authentic root pending Pale Moon effect** in each game. During speculative bot scoring it also removed **five** queued instances in each game; therefore future policy trajectories can change as expected under corrected simulator semantics.

## Final engine-game consequences and limits

| Candidate versus rank10 | Original uncorrected retreat winner; final candidate/opponent Prizes | Corrected retreat winner; final candidate/opponent Prizes |
| --- | --- | --- |
| Champion | Regidrago; **4/0** | Regidrago; **2/1** |
| Hood Shield | Hood Shield; **0/6** | Hood Shield; **0/6** |

These finished engine states arise from the **same seed, deck inventories and live predecision game state**. The different champion Prize outcome shows that this rule bug has consequential strategic knock-on effects. Neither outcome qualifies as a competitive matchup win-rate observation: cloned simulation and bot policy fidelity, broader source rules, and hidden-information competence remain uncertified.

Reproducers: [scope-specific switch correction](../../simulation/twinleaf/pending-end-turn-switch-cleanup.cjs), [unit test](../../tests/pending-end-turn-switch-cleanup.test.cjs), [live Store window observer](../../simulation/twinleaf/rank10-pale-moon-window.cjs), [fixed source comparison](../../simulation/twinleaf/aichi-rank10-delayed-ko-switch.cjs). Vendor code remains unmodified. The correction is **opt-in experimental** and covers `Player.switchPokemon` Active exits; other ways to clear effects, such as evolution, devolution and changing Pokémon outside that method, still need independent review.

**Recommendation:** Treat any uncorrected Twinleaf match in which a delayed Defending Pokémon effect remains queued after Active exit as *mechanically unreliable*. Test this case under each engine pin and policy version before admitting further games to the 99.5% benchmark. Keep the full Aichi field at **zero qualified games**.
