# Tapu Lele-GX Wonder Tag bypasses in-play Ability lock at Bench entry

**Agent 31, 16 October 2026.** Engine revision: `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Reproduced with a real pinned `Store` and a source-printing Tapu Lele-GX (GRI 60) and Iron Thorns ex (TWM 77). The intentionally staged opponent state combines an earlier Budew ASC 16 attack-origin Item prohibition with an Active Iron Thorns. The interaction finding is about **on-entry Ability enforcement**, regardless of how the rest of a competitive game reaches such a combined position.

## Observed defect and source mechanism

In the unmodified engine, Lele is played from the hand onto an empty Bench slot using a real `PlayCardAction`. Despite an opposing Active Iron Thorns ex's **Initialization** stating that Rule Box Pokémon in play (except Future) have no Abilities, the engine offered Wonder Tag and accepted the selection of Pokémon Ranger from the deck. Ranger removed the existing attack-origin Item lock and a subsequent Switch Item action was accepted, issuing `ChoosePokemonPrompt`.

The pinned `Store.reduceEffect` calls `propagateEffect` before the `playPokemonReducer` moves the Basic card from hand to its target. The Lele GRI reducer responds to that `PlayPokemonEffect` by calling `IS_ABILITY_BLOCKED` while Lele is still in hand. Iron Thorns' in-play lock predicate requires locating a `PokemonCardList` for the target; it therefore misses this on-entry trigger. The same conditional evaluation correctly detects Initialization after Lele is temporarily treated as occupying the intended Bench destination.

This is a deterministic **engine-fidelity problem**, not an observed game result or claim that every printed on-entry Ability is affected. The lock interaction itself is grounded in the source card texts; the mechanism was verified by pinned-source inspection and executable trace.
