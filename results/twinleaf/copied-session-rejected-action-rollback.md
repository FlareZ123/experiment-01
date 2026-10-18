# State-scoped copied-attack session loss after a rejected root action

**Agent 12, 18 October 2026.** Engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Evidence from an injected Regidrago VSTAR SIT copied Goodra VSTAR LOR state using the research-only opt-in State-scoped session loader. No legal complete game, matchup, or win-rate inference.

## An initial false-positive fixture was rejected

[Manual compiled CI 39086353628](https://github.com/FlareZ123/experiment-01/actions/runs/39086353628) failed an assertion that a rejected root action replaced `Store.state`. The fixture had already resolved `EndTurnEffect` and left an unresolved prompt. Pinned `Store.dispatch` rejects an action while such a prompt exists **before** `Store.reduce` creates its rollback backup. The failure was a fixture error and cannot count as evidence of a session rollback defect.

## Verified State rollback witness

The corrected [prompt-free regression](../../simulation/twinleaf/copy-session-rollback-loss.cjs) calls one directed copied-source `AfterDamageEffect`, then attempts Regidrago's `Apex Dragon` using Grass + Grass with no required Fire. It asserts the root action is rejected, the Store replaces its State with a different object, and the physical Pokémon Card remains reference-identical in the backup. It then sends another directed `AfterDamageEffect` through the replacement Store state.

[Manual compiled CI 39086681980](https://github.com/FlareZ123/experiment-01/actions/runs/39086681980) **passed** at `112a3975ed299ee8bf63ca6940d23d4b9cdf0a5c`. Results: `rollbackChangedStateIdentity:true`, `physicalCopycatIdentityPreserved:true`, copied source callbacks `['original']`. The post-rollback event was not delegated. This is a narrow direct regression that proves a **State-keyed session lifetime loss on the tested invalid root-action path**. It does not prove how often the engine or bot takes that path in a natural game.

## Optional rollback-aware adapter

A new opt-in [dispatch wrapper](../../simulation/twinleaf/copy-session-rollback-hook.cjs) detects when an invalid root action replaces `Store.state`; it transfers currently registered copied sessions into the replacement State and rebinds the most recent selected Attack identity through the already validated session-copy helper. The adapter preserves the original invalid-action exception and is reversible. The existing State-scope loader exports `transferCopyAttackSessionsOnRollback` only inside its in-memory compiled CommonJS patch, with no vendor edit.

The intended positive gate is [rollback guard](../../simulation/twinleaf/copy-session-rollback-guard.cjs) in the manual Apex workflow. **CI confirmation remains pending** for that guard, so this report only claims the negative witness so far.

## Limits

Session transfer derives from post-failure source State. It has not been proven to roll back modifications to the registry made during a partially executed invalid action. Other private Store continuation metadata and changes in arbitrary effect closures remain outside this test. The correction is opt-in and must not be promoted to a certified default simulator profile. Source-dealt rank10 policy and comparable opponent response need separate validation. Current full-field status remains 29/32 exact opponent lists and zero independently qualified competitive games.