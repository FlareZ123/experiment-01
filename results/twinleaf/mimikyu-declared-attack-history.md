# Mimikyu Copycat records the wrong declared attack after a nested prompt

**Agent 1; 16 October 2026.** Pinned engine `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Evidence: [manual CI 38847516877](https://github.com/FlareZ123/experiment-01/actions/runs/38847516877) and [corrected counterfactual CI 38847849107](https://github.com/FlareZ123/experiment-01/actions/runs/38847849107), both passed. These are controlled injected-board engine tests, not legal full-game simulations or matchup win-rate evidence.

## Reproduced mechanism

The pinned `player-turn-reducer.ts` saves `state.playerLastAttack[player.id]` from the originally declared `AttackAction` after `store.reduceEffect(UseAttackEffect)`. The Mimikyu GRI Copycat handler delegates to the opponent's non-GX Regidrago VSTAR Apex Dragon only if an opt-in research hook removes Twinleaf's overbroad copy-tag exclusion. Apex Dragon opens an asynchronous `ChooseAttackPrompt` for a Dragon attack in Mimikyu's own discard.

The pinned `copy-attack-delegation.ts` `openCopyAttackSession` writes `state.playerLastAttack[player.id] = {attack:selectedClonedAttack, sourceCard:copycatCard}`. In the nested Timeless-GX case, it overwrites the printed **Copycat** attack with the borrowed **Timeless-GX** after the `AttackAction` reducer already returned. This contradicts the supplied Advanced Player's Rulebook 3.4, II-C-18 explanation that a borrowed attack leaves the attack's original declared name unchanged.

The [new staged declared-action regression](../../simulation/twinleaf/mimikyu-apex-action-test.cjs) calls real `Store.dispatch(new AttackAction(..., 'Copycat'))`, supplies two Psychic Energy, unprized own discarded Dialga-GX, opponent prior Apex Dragon record, two occupied six-card Prize groups and nonempty decks. It then resolves the real `ChooseAttackPrompt` via `ResolvePromptAction`.

In [CI 38847516877](https://github.com/FlareZ123/experiment-01/actions/runs/38847516877), the record was **Copycat immediately after declaration** and **Timeless-GX after nested choice**. At the same time, the 150 damage, consumed GX allowance, and bonus-turn flag were all correct.

## Reversible compatibility probe

Added [`simulation/twinleaf/copycat-declared-history-hook.cjs`](../../simulation/twinleaf/copycat-declared-history-hook.cjs), an opt-in patch on the pinned Store's `dispatch` method. Only while an original Mimikyu GRI in the Active Spot has a pending `ChooseAttackPrompt` during its `Copycat` attack does it restore the pre-resolution printed attack record after calling the upstream dispatch. It leaves copied attack damage and other state unchanged, and returns an uninstall function. It never edits vendored files.

[Counterfactual CI 38847849107](https://github.com/FlareZ123/experiment-01/actions/runs/38847849107) passed baseline and corrected scenarios using equal staged boards:

| Field | Pinned baseline | Opt-in history correction |
| --- | --- | --- |
| Declared AttackAction | Copycat | Copycat |
| Recorded after declaration | Copycat | Copycat |
| Recorded after Timeless-GX prompt | **Timeless-GX** | **Copycat** |
| Timeless-GX damage | 150 | 150 |
| `usedGX` | true | true |
| `usedTurnSkip` | true | true |

Both runs preserve the `Regidrago VSTAR` Apex Dragon copy metadata after completion and expose a residual WaitPrompt for the engine's turn transition.

## Remaining qualifications

The test bypasses setup and genuine prior turn actions, although it uses actual AttackAction and attack-choice dispatch with sufficient Energy. It does not validate complete bonus-turn progression, realistic copying policy, opponent inference, damage against Fairy Zone, status interactions, or prior GX usage. The hook repairs the persisted attack record *after* the selected prompt dispatch; effects that inspect the transient record *during* the delegated attack's own resolution could still see the borrowed payload. Any wider compatibility patch should test those cases before replacing the scoped repair. No result supports an actual Regidrago matchup win probability.

The separate stale-attack-after-pass bug remains open: Twinleaf retains an opponent's last copied attack even if that opponent passed their most recent turn, so printed Mimikyu Copycat can act on an attack that no longer qualifies.
