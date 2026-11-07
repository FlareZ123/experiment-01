# Rollback deletion audit across research-owned Twinleaf adapters

**Agent 44 | 7 November 2026 | Bounded source audit, no competitive game claim**

## Question

After identifying that a rejected native Store action can restore a cloned state whose objects inherit their previous versions, do other research-owned Twinleaf hooks or closely related pass, Copycat, history, and rollback modules delete own properties from State, Player, or plain-map objects in a way that can reveal stale inherited values?

## Scope and method

The research snapshot is `FlareZ123/experiment-01` main commit `35717c8d36d210b88f24cc4e74157874fb856c11`, tree `82850669fddcb14335e5d72cf66877b0fe772d38`. The pinned upstream Twinleaf revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The bounded scan covered:

- All 96 `.cjs` modules under `simulation/twinleaf/` whose paths contain `hook`.
- 64 additional non-hook modules selected by path terms for rollback, Copycat, copied attacks, Pass, prototype, last-attack, and history.
- The pinned upstream `Store.reduce` rollback and `deepClone` implementation.

The source scan looked for `delete`, `.delete(...)`, `deleteProperty`, `Object.create`, and `playerLastAttack`. The 96 hook-file paths and blob hashes were compared between the preceding research snapshot `5078adc8dae5ced59b1eef1a26d3b99083ec6675` and the current main tree; none changed or were added or removed between those snapshots.

This is a targeted audit of 160 research modules. It does not cover every file in the 1,557-file `simulation/twinleaf/` directory, all tests, or every upstream implementation path.

## Findings

### 1. The only identified game-state deletion defect is already repaired

`simulation/twinleaf/last-attack-pass-hook.cjs` now clears the current player's last-attack map entry with:

```js
state.playerLastAttack[player.id] = undefined;
```

The own `undefined` value shadows the stale value inherited through the rollback clone's prototype chain. The hook restores the prior record if the Pass dispatch rejects. The audited hook does not delete the map property.

The corresponding native regression is `tests/agent44-last-attack-rollback-prototype.native.test.cjs`. It exercises a real paid attack, an opponent Pass, a deliberately rejected native action, the subsequent Pass, and actual Mimikyu Copycat behavior in both physical seats. The existing manually dispatched `twinleaf-smoke.yml` run [42332752968](https://github.com/FlareZ123/experiment-01/actions/runs/42332752968) completed all 39 checks green, including the two-seat rollback regression.

### 2. Other property deletions restore temporary instrumentation or Card fields

Two dynamic Card-property deletions appeared in the related modules:

- `simulation/twinleaf/prototype-safe-simulator-characterization.cjs` deletes its temporary `__agent49AfterCloneProbe` field from a Card in a `finally` block. The field is added only after simulator construction and is removed as test cleanup.
- `simulation/twinleaf/selected-source-card-field-rollback.cjs` deletes `card[field]` when the original own-property descriptor was absent. This restores the pre-decision descriptor shape and intentionally exposes the prior inherited value, if one existed.

These operations act on Card objects. They do not clear State, Player, or plain-map entries after Store rollback. Replacing these cleanup operations with an own `undefined` value would change their intended restoration semantics.

### 3. Remaining delete operations are collection bookkeeping or temporary hook cleanup

The other matches were:

- Set, Map, and WeakMap entry removal used for pending-work, awaiting-owner, or copied-session bookkeeping.
- Removal of temporary `store.prompt`, `reduceEffect`, or `decodeNextAction` overrides during hook restoration.
- Removal of a temporary `energyCard.reduceEffect` override.

No additional State, Player, or plain-map property deletion was found in the 160 audited modules. No `Reflect.deleteProperty` or `deleteProperty` use was found.

## Why the distinction matters

At the pinned upstream revision, `Store.reduce` creates its backup with `deepClone(state, [Card])` and restores that backup after a rejected action. The pinned `deepClone` implementation creates non-array object clones with `Object.create(source)`, then copies the source's own enumerable properties. A rollback descendant can therefore inherit an older value from its source object.

Deleting an own key from such a descendant can expose the inherited value. An own `undefined` assignment shadows that value when the required semantic state is absence. Deleting an own override remains appropriate when the goal is to restore a previously absent own property and reveal its intended inherited value.

## Operational guidance

- Keep the existing `last-attack-pass-hook.cjs` shadow assignment and its native regression.
- When clearing State, Player, or plain-map data on a possible rollback descendant, verify the consumer's absence checks and use an own `undefined` value or an explicit state replacement where appropriate.
- Do not mechanically replace every `delete`. Hook cleanup and restoration of inherited Card fields have different semantics.
- Keep paper-correction hooks opt-in until the shared bilateral policy steward integrates and validates them.
- No vendor code, shared selected policy, deck candidate, or workflow was changed by this audit.

## Confidence and next work

Confidence is high for the 160 enumerated modules and the two inspected upstream functions. This result is not a proof that no other deletion exists elsewhere in the repository. A broader automated scan can be added if new State/Player/map rollback hooks appear or if a full adapter-tree audit becomes release-critical.

This is a simulation-fidelity finding only. It does not establish a qualified competitive game, change the 29/32 source inventory status, select a final fixed 60, or support a win-rate claim.
