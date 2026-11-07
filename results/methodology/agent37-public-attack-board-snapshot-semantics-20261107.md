# Agent37: pre-attack board snapshot semantics and prompt-chain boundaries

**7 November 2026 | Read-only instrumentation review, with a backward-compatible settlement receipt extension.**

## Data flow in the pinned research adapter

In `simulation/twinleaf/headless.cjs`, each Store action is observed in this order:

1. Before dispatch, the adapter captures `publicAttackBefore = publicBoardSnapshot(state)`.
2. The actual Store action is dispatched.
3. Newly emitted attack-log declarations are attributed to that same action ordinal.
4. When a declaration exists, `publicAttackTransitions` records the pre-dispatch `before` board, the immediate post-dispatch `after` board, whether a prompt remains open, and a later `settled` snapshot.
5. If a later `ResolvePromptAction` closes the same initiating prompt chain, the event's `settled` snapshot is filled with the final board and Prize counts.

The settlement projection in `simulation/evaluation/agent37-candidate-attack-settlement.cjs` previously returned the pre-dispatch board as `publicBoardBefore` and the prompt-closed board as `publicBoardAfter`. It omitted the event's immediate post-dispatch `after` board.

## What the existing field proves

`publicBoardBefore` is a genuine detached snapshot from immediately before the Store action that first emitted the attack declaration. It is suitable as the pre-attack board when damage and the KO occur during that dispatch.

It is not a universal proof of the board immediately before damage. An attack effect can emit its declaration, leave a prompt open, and apply damage during a later prompt-resolution root. In that case `publicBoardBefore` precedes the later damage root. The final `settled` board proves prompt closure and final state, but cannot by itself locate when damage was applied.

For the common KO path where the attack root applies damage and then opens Prize or promotion prompts, the immediate post-dispatch board should already show the KO before those follow-up choices. That timing should be checked from the actual root receipt for each attack.

## Added receipt fields

Commit `36f97b7fbeb0f4317cc7f48b8bba08feda786c08` adds these fields to each settlement row:

- `publicBoardImmediatelyAfterDeclarationRoot`: the event's immediate post-dispatch board, or `null` for historical events that did not retain it.
- `declarationRootPromptPendingAfter`: whether the declaration root left a prompt open, or `null` for older records.
- `declarationRootTurnAfter`: the native turn counter after that root, or `null` when absent.
- `initiatingRootActionOrdinal`: the root that initiated the prompt chain, when captured.

The existing `publicBoardBefore`, final `publicBoardAfter`, settlement status, Prize counts, and epoch veto remain unchanged. Two regression cases distinguish a delayed prompt-chain damage state from the declaration-root board and ensure older archives remain explicitly unknown. The targeted manual native workflow run **42369574376** completed successfully. Its Agent37 step ran the updated settlement tests and paired native runner; the `agent37-first-divergent-native-attack-pair` artifact was preserved as artifact **13573123058**. This validates the instrumentation and regression harness, not paper legality or the separate v29 eight-row join.

## Guidance for the v29 KO and Prize join

For each of the eight v29 attack-to-Prize rows:

1. Join the declaration root by exact registered trial, physical actor seat, attack name, turn, and action ordinal.
2. Inspect `publicBoardImmediatelyAfterDeclarationRoot`.
3. Confirm that the victim is already Knocked Out or that the relevant damage has already been applied before the accepted Prize-selection root.
4. If the target remains in play and undamaged after the declaration root, classify the attack as a multi-root effect and capture the actual later damage root before using the cumulative KO damage to infer an attack-damage delta.

This preserves `publicBoardBefore` as a trustworthy pre-declaration snapshot while avoiding a broader pre-damage claim than the instrumentation supports.

## Copycat lineage caution

The existing `delegatedCopy` field is derived from `triggerAction === 'ResolvePromptAction'`. That is a useful trigger-location signal, but it is not standalone proof of Copycat: other attack declarations can also be logged during prompt resolution. A Copycat audit should additionally require the physical Mimikyu Active, its preceding Copycat `AttackAction`, the selected donor and attack from the corresponding prompt, and the opponent's matching prior-turn attack.

The root ledger already records `initiatingRootActionOrdinal`. For the copied attack, require the declaration root's initiating ordinal to equal the exact Copycat `AttackAction` ordinal. The new settlement field exposes the same linkage directly.

## Evidence boundary

These changes improve provenance and timing attribution. They do not certify attack payment, all card-specific modifiers, complete paper rules, the official tournament clock, a full competitive game, or a matchup win. The repository's zero competitively qualified games and no-selected-final-deck status remain unchanged.
