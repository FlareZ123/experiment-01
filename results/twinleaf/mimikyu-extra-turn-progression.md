# Actual extra-turn transition after Mimikyu Copycat -> Apex Dragon -> Timeless-GX

**Agent 1, 16 October 2026.** Pinned engine: Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Manual CI 38861914912](https://github.com/FlareZ123/experiment-01/actions/runs/38861914912) **passed** at `bdf9c04ae33f1bbf33b69f5c2fa89b8292b0d311`. This is a staged turn-mechanics regression, not a legal-game or Aichi matchup result.

## Previously established pieces

The supplied Advanced Player's Rulebook section II-C-18 states that copying an attack applies the copied effects and damage while retaining the declared printed attack's name. The champion list contains Mimikyu GRI 58, Dialga-GX UPR 100 and Lillie's Clefairy ex; eleven Aichi Top-32 placements are Regidrago archetypes.

Earlier regressions found three independently important engine issues/constraints:

- Mimikyu's code incorrectly refuses to copy a non-GX Apex Dragon because its internal `copycatAttack` metadata is set. An opt-in reversible compatibility hook corrects this specific case.
- Asynchronous copied-attack prompt resolution overwrites originally declared Copycat/Apex Dragon metadata with a nested payload. An opt-in printed-history correction preserves both declared names after prompt completion.
- Missing Prize arrays in earlier fixtures caused sudden-death reinitialization and falsely suggested that `usedGX` was lost. Occupied six-card Prizes prevent this fixture confound.

Those repairs are *opt in*. None alters the pinned vendor source.

## New full turn-transition contract

The expanded [two-declared-attack fixture](../../simulation/twinleaf/regidrago-to-mimikyu-two-attack.cjs) now supports `--verify-bonus` and executes the actual Store dispatch and real WaitPrompt chain on prepared boards:

1. The Regidrago VSTAR player, with enough attached Energy, dispatches a real `AttackAction('Apex Dragon')`, chooses discarded Dratini's Tail Snap, and deals 20 damage to Mimikyu.
2. Three engine WaitPrompts advance to the Mimikyu player's next turn. Persisted opponent history correctly says **Apex Dragon** under the opt-in declared-history hook.
3. A Psychic-Psychic Mimikyu dispatches a real `AttackAction('Copycat')`, legally borrows the prior non-GX Apex Dragon, and chooses its own discarded Dialga-GX's Timeless-GX from the actual `ChooseAttackPrompt`.
4. Regidrago takes 150 damage, Mimikyu's `usedGX` becomes true, `usedTurnSkip` is armed, and persisted attack history remains **Copycat**.
5. The new opt-in test resolves the subsequent real WaitPrompts. The engine advances from turn **5 to 6**, enters `PLAYER_TURN`, and retains the **same Active player index 0** rather than granting a turn to the Regidrago side. It takes three WaitPrompt resolutions.

The comparison between a flag being armed and an actual bonus turn matters: prior fixtures only checked `usedTurnSkip`, without exercising the subsequent engine turn transition.

## Evidence and limits

[Manual-only Copycat regression CI 38861914912](https://github.com/FlareZ123/experiment-01/actions/runs/38861914912) compiled the unchanged pinned Twinleaf server and passed all relevant predecessor tests plus the new bonus-turn assertion. Its logged transition was:

| State | Before turn progression | After real WaitPrompts |
| --- | ---: | ---: |
| Turn counter | 5 | **6** |
| Active player index | 0 (Mimikyu) | **0 (Mimikyu)** |
| Game phase | ATTACK (3) | **PLAYER_TURN (2)** |
| Post-GX WaitPrompts resolved | - | **3** |

The test injects evolved Regidrago, source discard Pokémon, attached Energy, populated Prizes and the prior AttackAction environment. It is **not** proof that those pieces can be established legally or frequently, that the opponent would have chosen the tested line, that all potential flags persist correctly in full games, or that the champion wins any matchup. The script uses an innocuous Dratini attack to keep Regidrago alive. The distinct Fairy Zone 300-damage Knock Out and Prize handling should be verified in another staged test with printed HP and a spare opposing Bench Pokémon before interpreting the actual knockout race.

**Next research gate:** execute the copy-counterline from source-legal 60-card decks and actual setup, with source-representative decisions, both starting seats, correct weakness, Knock Out/Prize handling, and all prompt/history correction options logged. No 99.5% win-rate claim follows.
