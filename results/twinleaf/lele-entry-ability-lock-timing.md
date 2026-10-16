# Tapu Lele-GX Wonder Tag bypasses in-play Ability lock at Bench entry

**Agent 31, 16 October 2026.** Engine revision: `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Reproduced with a real pinned `Store` and a source-printing Tapu Lele-GX (GRI 60) and Iron Thorns ex (TWM 77). The intentionally staged opponent state combines an earlier Budew ASC 16 attack-origin Item prohibition with an Active Iron Thorns. The interaction finding is about **on-entry Ability enforcement**, regardless of how the rest of a competitive game reaches such a combined position.

## Observed defect and source mechanism

In the unmodified engine, Lele is played from the hand onto an empty Bench slot using a real `PlayCardAction`. Despite an opposing Active Iron Thorns ex's **Initialization** stating that Rule Box Pokémon in play (except Future) have no Abilities, the engine offered Wonder Tag and accepted the selection of Pokémon Ranger from the deck. Ranger removed the existing attack-origin Item lock and a subsequent Switch Item action was accepted, issuing `ChoosePokemonPrompt`.

The pinned `Store.reduceEffect` calls `propagateEffect` before the `playPokemonReducer` moves the Basic card from hand to its target. The Lele GRI reducer responds to that `PlayPokemonEffect` by calling `IS_ABILITY_BLOCKED` while Lele is still in hand. Iron Thorns' in-play lock predicate requires locating a `PokemonCardList` for the target; it therefore misses this on-entry trigger. The same conditional evaluation correctly detects Initialization after Lele is temporarily treated as occupying the intended Bench destination.

This is a deterministic **engine-fidelity problem**, not an observed game result or claim that every printed on-entry Ability is affected. The lock interaction itself is grounded in the source card texts; the mechanism was verified by pinned-source inspection and executable trace.

## Research-side correction and CI evidence

[`LeleEntryAbilityLockGuard-v1`](../../simulation/twinleaf/lele-entry-ability-lock-hook.cjs) temporarily stages the relevant Lele in the intended Bench slot for the pinned engine's existing `IS_ABILITY_BLOCKED` check, then restores the hand and target exactly before continuing normal processing. When that destination-zone probe reports suppression, the Lele reducer skips Wonder Tag while the normal action still puts Lele on the Bench. The modification is opt-in, reversible and entirely outside the vendor submodule.

The [five-case exact `Store` fixture](../../simulation/twinleaf/ranger-lele-itemlock-action.cjs) covers:

1. Ordinary previous Budew lock: Lele enters Bench, Wonder Tag fetches Ranger, Ranger is played, Item restriction ends, Switch produces the actual selection prompt.
2. Iron Thorns Initialization: raw engine wrongly permits Wonder Tag and the full Item escape; opt-in correction suppresses the prompt and Ranger access.
3. Ranger among the six Prize cards: Wonder Tag cannot supply Ranger.
4. Supporter turn already spent: Wonder Tag can find Ranger but Ranger cannot be used on the same turn.
5. Lone Lele forced Active without another Benched Lele: Wonder Tag cannot trigger from starting Active.

**Manual CI:** [run 38841912883](https://github.com/FlareZ123/experiment-01/actions/runs/38841912883) intentionally failed the initial expectation when raw Initialization failed to suppress Wonder Tag. After adding explicit raw-versus-guarded characterization, [run 38842492779](https://github.com/FlareZ123/experiment-01/actions/runs/38842492779) succeeded and recorded the incorrect raw Ranger play, followed by all five corrected cases passing. Its unchanged earlier board-effect tests also passed.

## Consequences and limits

The [restricted source-deck Ranger availability](../aichi-2026/ranger-candidate-early-access.md) for Hood and Temple remains exact conditional combinatorics, but any simulated Item-lock recovery involving Lele and opposing Initialization must include correct entry timing to avoid false strategic conclusions. No source-field matches or win-rate estimates were measured by this fixture.

The test exercises real pinned card effects and `Store` transitions on prepared legal-effect positions; it does not establish that the combined Budew/Thorns timing occurs naturally from the named starting states, nor validate policy decisions or every Ability-lock interaction. Before larger match trials, expose the correction as a versioned, expressly enabled option in the headless runner and test restoration on termination.
