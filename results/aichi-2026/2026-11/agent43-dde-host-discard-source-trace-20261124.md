# DDE host-type-change discard: pinned Twinleaf source trace

**Date:** 2026-11-24  
**Author:** Agent43  
**Pinned Twinleaf revision:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

## Question

Does the pinned Twinleaf implementation contain a state-check path that discards Double Dragon Energy (DDE) when its attached Pokémon is no longer Dragon, or would research need to add a separate adapter hook?

## Source trace

The pinned source contains an implementation path:

1. [`DoubleDragonEnergy.reduceEffect`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-roaring-skies/double-dragon-energy.ts) handles `CheckTableStateEffect`. It iterates both players' Pokémon, finds this DDE in the Pokémon's attached `cardList.cards`, checks whether the Energy's Special Energy effect is blocked, evaluates the Pokémon's current type with `CheckPokemonTypeEffect`, and sends DDE to that player's discard pile with `MOVE_CARDS` when the host is not Dragon.
2. [`executeCheckState`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/check-effect.ts#L446-L448) constructs `CheckTableStateEffect([5, 5])` and passes it through `store.reduceEffect`.
3. [`Store.dispatch(ResolvePromptAction)`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts#L118-L120) invokes `checkState` after the final prompt resolves. Normal [`Store.reduce`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts#L358-L361) invokes `checkState` after each top-level action when no prompts remain.
4. The same [`propagateEffect`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts#L467-L522) path enumerates Active and Bench card lists and invokes attached cards' `reduceEffect`, so DDE receives the state-check effect.

This is an existing upstream implementation path at the pinned revision. It does not require a second research-side hook merely to duplicate the later discard clause.

## Special-Energy blocking

DDE's discard branch returns while `IS_SPECIAL_ENERGY_BLOCKED` is true. Agent16's [Temple of Sinnoh cross-check](../../../../communications/agent41/2026-11/20261124T052519Z_agent16-temple-of-sinnoh-dde-cross-check.md) explains the intended interaction: Temple makes Special Energy provide Colorless and removes their other effects; DDE remains attached while blocked, and a later state check after Temple leaves can discard it if its host remains non-Dragon. This report records that independent cross-check; it does not re-run it.

## Cross-reference to the available Aichi field

The ten currently known DDE-bearing source ranks are **10, 12, 13, 14, 18, 19, 20, 21, 27, and 32**. The three Japanese-only promotional identities in the available 29-list manifest—Palace Belt BWP 153, Palace Book SMP NAN25, and Player's Ceremony SP 127—occur only in ranks **3, 6, 7, 24, and 29**. There is no rank overlap between those promo-bearing lists and the ten DDE-bearing lists. The documented effects of these three promos do not change Pokémon type.

This narrows the known promo-identity concern for the ten DDE lists. It does not prove identical text for every Japanese printing, exclude other non-promo Japanese-only interactions, or cover the missing ranks **23, 25, and 28**.

## Disposition and limitations

- **Source implementation path identified:** DDE's own reducer handles the discard on `CheckTableStateEffect`; the pinned Store dispatches that check after top-level actions and final prompt resolution.
- **Not regression-qualified:** no native test in this investigation performs a real Pokémon type-changing transition and observes DDE leave play. The source trace does not establish timing equivalence for every effect chain.
- **Keep the full-field gate unqualified** until a real-transition regression is authorized and passes, or the repository owner explicitly accepts the source-level evidence. Under the current Critic stopline, this investigation adds no test, fixture, workflow, or direct-state workaround.
- [PR #65](https://github.com/FlareZ123/experiment-01/pull/65) is separate: it fixes attachment-time action-frontier rejection for DDE→non-Dragon candidates. It does not establish this later host-type-change discard behavior.
- No competitive game, matchup, policy-competence result, or deck win-rate evidence is produced here.

## Reproduction

Inspect the four pinned source paths above at commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No upstream files were changed.
