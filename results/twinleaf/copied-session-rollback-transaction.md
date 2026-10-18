# Copied-attack session transactions across a late rejected root action

**Agent 12, 18 October 2026.** Pinned vendor Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Compiled manually dispatched [Apex regression CI 39167998596](https://github.com/FlareZ123/experiment-01/actions/runs/39167998596) **succeeded** on research head `68c56103a3ce606f0e3681ad6d4ff803281447db`, including the new negative/positive transaction step and all existing Apex tests.

## Root-cause boundary

The pinned `Store.reduce` makes a backup of the State, then applies root reducers. If a later reducer throws, it replaces `Store.state` with the backup. The copied-attack session is external to State in the pinned copy-prefab; Agent 12's earlier opt-in State-scoped WeakMap variant likewise needs an explicit transfer when the State object changes.

[Earlier rollback correction](copied-session-rejected-action-rollback.md) transferred the *post-failure* session from the old State to the restored backup. That retained a session surviving an early invalid action, but could carry a mutated session lifetime when the failed action had already emitted effects.

## Bounded real Store negative/positive test

[Executable regression](../../simulation/twinleaf/copy-session-rollback-transaction.cjs) constructs an established Regidrago VSTAR SIT / Goodra VSTAR LOR copied-source session. It dispatches an actual `PassTurnAction`. After the source reducer receives one genuine `EndTurnEffect` and decrements its copied-session lifetime, the test introduces a controlled late exception in that Store's `reduceEffect`. The pinned `Store.reduce` consequently restores a distinct backup State and propagates the exact injected error. The test calls five further EndTurn effects from the restored State to measure the session's remaining lifetime.

| Observed measurement | Post-failure transfer (negative control) | Pre-dispatch transaction snapshot |
| --- | ---: | ---: |
| Source callbacks before injected failure | 1 | 1 |
| Source callbacks after restored State | **3** | **4** |
| Total copied-source EndTurn callbacks | 4 | 5 |
| Actual State identity replaced | Yes | Yes |
| Original injected error preserved | Yes | Yes |

The [manual Apex workflow](../../.github/workflows/apex-copy-regression.yml) registered the regression. Its corresponding CI log section `COPY_SESSION_TRANSACTIONAL_ROLLBACK` records the counts above. The existing paid Apex/Goodra, cloned attack-history, rollback-guard and speculative-session tests also passed in the same compiled run.

## Research-side correction

The [State-scoped session loader](../../simulation/twinleaf/copied-session-state-scope-hook.cjs) now exports `snapshotCopyAttackSessionsForState(state)`. It shallow-copies each session record and copies its cloned-attack reference array before a real root action. An optional argument to `inheritCopyAttackSessionsFromState` and `transferCopyAttackSessionsOnRollback` provides the captured pre-action records. The reversible [rollback adapter](../../simulation/twinleaf/copy-session-rollback-hook.cjs) enables pre-dispatch snapshots by default whenever an agent explicitly installs that adapter. Its `snapshotBeforeDispatch:false` switch exists only to reproduce the old behavior in a negative test. The vendor submodule and ordinary headless default are unchanged.

This is **transactional preservation of session lifetime for the tested root rollback boundary**. The copied attack's printed attack identity was unchanged across the injected failed Pass, so the experiment does not establish rebinding when another failed action mutates playerLastAttack. It also does not verify rollback of arbitrary Card object mutations, pending prompt closures, or `ResolvePromptAction` errors that leave the same State identity. The injected exception is a falsification mechanism, **not** proof that an ordinary legal match reaches the path or that full Store rollback is faithful.

## Relation to the fixed-deck objective

A speculative policy could evaluate a different continuation after copied-attack state loss. This bounded correction reduces one research-side source of inconsistency. Until an authentic dealt Regidrago/counterpolicy decision exercises this precise continuation and passes independence, printed-rules, full-replay and opponent policy gates, the impact on candidate strength is **unknown**. Shared field coverage is 29/32 exact opposing 60s. **Zero competitive games qualify**, and no 99.5% performance claim follows.
