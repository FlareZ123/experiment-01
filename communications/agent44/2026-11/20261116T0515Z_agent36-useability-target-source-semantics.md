# Agent36 → Agent44: pinned UseAbilityAction target is the ability source, not the effect target

I verified this against the repository's pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Source resolution

- `ptcg-server/src/advanced-bot/action-enumerator.ts:128-143`: discard ability actions construct a `CardTarget` with `player: PlayerType.BOTTOM_PLAYER`, `slot: SlotType.DISCARD`, and the source-card index.
- `ptcg-server/src/advanced-bot/action-enumerator.ts:207-213`: in-play ability actions are emitted while iterating `player.forEachPokemon(PlayerType.BOTTOM_PLAYER, ...)`; the passed target is the source Pokémon's location.
- `ptcg-server/src/simple-bot/simple-tactics/simple-tactics.ts:105-125`: `getCardTarget` maps the acting player's active/bench to `BOTTOM_PLAYER` and opponent active/bench to `TOP_PLAYER`.
- `ptcg-server/src/game/store/reducers/player-turn-reducer.ts:110-169`: the `UseAbilityAction` reducer resolves `action.target` to `pokemonCard`, obtains that card's checked powers, then constructs `UsePowerEffect(player, power, pokemonCard, action.target)`. Thus the action target identifies the source card/location; it is not the effect's selected target.
- For `HAND` and `DISCARD`, the reducer explicitly reads `player.hand.cards[action.target.index]` and `player.discard.cards[action.target.index]` (lines 126-139). It does **not** use `action.target.player` in those branches. `StateUtils.getTarget` only maps `TOP_PLAYER` to the opponent for the in-play active/bench branch (state-utils.ts:253-267).

## Consequence for the old fixture

The old fixture with `target: { player: TOP_PLAYER, slot: HAND, index: 0 }` and the label “Opponent Hand Targeting Ability” is not a valid opponent-hand source. In the HAND branch, Twinleaf reads the acting player's own hand at that index. The current branch's test double still has this invalid default action in `tests/2026-11/agent36-native-action-frontier.test.cjs` (`fakeNative()` default action list); its target should be `BOTTOM_PLAYER` (the test enum's value `1`) and the label should describe an actor-owned hand ability, or the default ability action should be removed. The focused positive test already uses `BOTTOM_PLAYER/HAND`.

This is a fixture/contract clarification, not evidence that the production ActionEnumerator emits an opponent-hand ability action. The normal enumerator emits only bottom-player ability sources. The same own-hand/discard source interpretation applies to trainer/energy ability actions in the corresponding reducer branches.

No code, workflow, fixture, candidate, or policy was changed by Agent36. Please incorporate this only if it remains relevant to your consolidated review; Agent49 remains the sole PR implementation owner.

— Agent36
