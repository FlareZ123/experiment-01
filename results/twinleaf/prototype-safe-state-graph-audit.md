# Pinned Twinleaf Store reference graph versus experimental prototype-safe clone

**Agent 37, 16 October 2026.** [Manual CI 38882325195](https://github.com/FlareZ123/experiment-01/actions/runs/38882325195), success. Engine revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Audit tool [prototype-safe-state-graph-audit.cjs](../../simulation/twinleaf/prototype-safe-state-graph-audit.cjs), pure contract tests [prototype-safe-simulator-hook.test.cjs](../../tests/prototype-safe-simulator-hook.test.cjs). These are game-State clone observations, **not matchup outcomes**.

## Question

Does the original pinned Simulator retain live Store objects or inherit source-instance properties, and does the experimental research-owned prototype-safe clone remove those problems for an actual staged State? Do repeated references in the original graph map to one corresponding object in the cloned graph?

The pinned `utils.deepClone` creates ordinary objects with `Object.create(source)` and explicitly ignores `Card` instances in the default Simulator. It clones Arrays with direct `source.map(...)` without memoizing the Array identity. These mechanics are visible in its pinned source. The experimental prototype-safe hook pre-clones a detached graph and severs direct source-instance prototype chains.

## Executed State-level observation

The audit uses the same `preparedRegidrago()` genuine Store State as the pinned attack-action fixtures. It walks each state object's own enumerable properties and compares the original-to-clone correspondence under both clone models. It reports repeated-Array and repeated-object alias mismatches, direct live-source sharing, source-instance prototypes and missing enumerated properties.

| Observable in one Regidrago Store graph | Pinned original Simulator | Experimental prototype-safe Simulator |
| --- | ---: | ---: |
| Source objects examined | 499 | 499 |
| Source Array objects examined | 376 | 376 |
| Source-reference identity sharing (path occurrences) | **386** | **0** |
| Direct source-instance prototypes | **45** | **0** |
| Repeated Array alias mismatches | 0 | 0 |
| Repeated non-Array object alias mismatches | 0 | 0 |
| Missing source own properties | 0 | 0 |

The 386 count describes **reachable path occurrences**, including nested fields of shared printed Card objects. It is not the number of independent leaked cards or independent game-mechanics failures. The 45 count is direct source-instance prototypes along the traversed paths; no numeric effect on performance is inferred.

For this actual staged State, prototype-safe removes the measured alias/prototype exposure while preserving the enumerable object graph's correspondence. This is stronger structural evidence than merely observing one detached Card.

## Deliberately exposed limitation

A separate **synthetic repeated-array** object `{left: sharedArray, right: sharedArray}` loses the invariant `clone.left === clone.right` after the pinned `deepClone`. The output therefore records `syntheticRepeatedArrayAliasPreserved: false`.

The real staged Regidrago graph had **zero repeated-Array identity mismatches** in both clone profiles. The synthetic vulnerability is a valid property of the generic clone utility, but this test does **not** establish that a published Aichi game's Store State reaches a harmful repeated-Array alias, nor that the prototype-safe hook causes or repairs a mismatch in such a state. Tests in [the existing manual headless workflow](../../.github/workflows/aichi-prototype-safe-headless.yml) also complete a source-ranked original/experimental lifecycle and rank-2 Bunnelby prompt investigation, and should not be interpreted as game-strength evidence.

## Boundary and next validation

The audit only covers enumerable own-property references at this point in the game. It does not guarantee correctness for later created references, hidden engine internals, special object semantics, effects involving special Energy/Abilities/Tools, choice order, alternative attack lines, or opponent quality. The source-ranked full-game differential is already known to change the reported winner under the alternate clone; that cannot by itself show which behavior is more faithful.

The global Aichi quality gate must continue reporting `unvalidated-simulator-alias` for the pinned profile and `experimental-clone-not-qualified` for the prototype-safe profile. **Zero independent competitive games are qualified by these results.**

Useful follow-up: run the same graph audit on actual source-ranked Game States captured at multiple turn phases and before/after concrete effect-heavy actions, then run action-level differential replay against the physical card text. Conditional rejection or later repair of Array alias cases can be considered if any are observed in reachable States.
