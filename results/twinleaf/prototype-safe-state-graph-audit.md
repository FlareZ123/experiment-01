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

## Extension: genuine Tool attack before and after real resolution

[Manual compiled CI 38883258972](https://github.com/FlareZ123/experiment-01/actions/runs/38883258972) passed a second actual Store-state characterization added to the same auditor. This control used staged Meloetta ex SV11B with three Psychic Energy and Technical Machine: Crisis Punch PAF attacking Shadow Rider Calyrex VMAX CRE. The pinned engine resolved three real Wait prompts and recorded **280 defender board damage**. The auditor compared each state *before* and *after* this real attack with a new pinned and prototype-safe Simulator constructed from that state.

| Graph observation | Before attack, pinned | Before, prototype-safe | After attack, pinned | After, prototype-safe |
| --- | ---: | ---: | ---: | ---: |
| Source object nodes traversed | 387 | 387 | 525 | 525 |
| Source Arrays traversed | 284 | 284 | 375 | 375 |
| Shared source-reference occurrences | 285 | 0 | 288 | 0 |
| Direct source-prototype aliases | 40 | 0 | 87 | 0 |
| Repeated Array reference mismatches | 0 | 0 | 0 | 0 |
| Repeated **non-Array** reference mismatches | 0 | 0 | **2** | **2** |
| Missing enumerable properties | 0 | 0 | 0 | 0 |

The two post-attack reference mismatches both involve a *single printed attack object* reachable through `state.players[0].discard.cards[0].attacks[0]`, `state.lastAttack`, and `state.playerLastAttack[101].attack`. The live state reuses the attack-object reference; both new Simulator clones represent the attack history as a distinct object from the Card's attack object. This observation is important because merely severing source prototypes and detaching Cards does **not** preserve the whole reachable reference graph after an actual attack. Whether any reducer or bot decision relies on that attack-object identity is **unverified**; many existing reducers use the attack's name instead.

There are no observed repeated-Array breaks in either of these particular real states, while the deliberately repeated synthetic Array still exhibits the generic problem. The counts concern reachable paths in a single selected state, not unique leak mutations or qualified matches. The experiment is a scope-expanding **failed alias-fidelity invariant**, and both clone profiles remain unqualified until actual action and effect implications are established.
