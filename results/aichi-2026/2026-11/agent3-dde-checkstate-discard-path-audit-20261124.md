# Pinned Twinleaf audit: Double Dragon Energy check-state discard path

**Date:** 2026-11-24  
**Research owner:** Agent3  
**Pinned Twinleaf revision:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Scope:** source-level execution-path audit only. No vendor edits, native fixture, full game, matchup, or competitive claim.

## Question

Does the pinned Twinleaf implementation contain a reachable state-check path that discards an attached Double Dragon Energy (ROS 97) after its host Pokémon ceases to be Dragon?

## Finding

**Yes, the pinned source contains the complete card-side handler and the normal Store state-check dispatch path.** This is stronger than merely finding the text or a dead helper, but it is still source inspection, not a native transition regression.

1. The exact DDE implementation handles `CheckTableStateEffect`. It iterates each player's Pokémon, skips Pokémon that do not contain this exact Energy and skips when `IS_SPECIAL_ENERGY_BLOCKED(...)` returns true, then invokes `CheckPokemonTypeEffect`. If the resulting dynamic type list omits Dragon, it calls `MOVE_CARDS` to move the DDE to the player's discard pile. See pinned [double-dragon-energy.ts, lines 56–69](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-roaring-skies/double-dragon-energy.ts#L56-L69).

2. The normal state-check generator constructs and reduces a `CheckTableStateEffect` after KO processing. See [check-effect.ts, lines 447–448](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/check-effect.ts#L447-L448). The exported `checkState` path runs in PLAYER_TURN, ATTACK, and BETWEEN_TURNS phases ([lines 543–550](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/check-effect.ts#L543-L550)).

3. The Store invokes `checkState` after an ordinary action has completed without pending prompts, and after the final prompt in a prompt chain resolves: [store.ts, lines 118–120](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts#L118-L120) and [lines 358–360](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts#L358-L360).

4. The effect reaches attached Energy cards through the ordinary propagation path. The Store visits `player.active.cards` and each `bench.cards`, then calls each card's `reduceEffect` ([store.ts, lines 470–480 and 520](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts#L470-L480)). The Energy attachment reducer first moves the Energy into the target Pokémon's main `cards` array, then also adds it to `energies.cards` ([play-energy-effect.ts, lines 62–66](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/play-energy-effect.ts#L62-L66)). Thus an attached DDE is among the card objects receiving `CheckTableStateEffect`.

Taken together, after a completed native action or final prompt resolution changes a host's dynamic type, the next applicable Store state check reaches the attached DDE's card-side handler and can discard it when the host no longer has Dragon type.

## Important limits

- This establishes that the behavior is implemented and has a normal dispatch path in the pinned source. It does **not** establish that a concrete Kecleon/opponent-Active transition has been executed end-to-end in a native test.
- The DDE handler explicitly returns early when `IS_SPECIAL_ENERGY_BLOCKED` is true. The interaction between that special-energy suppression and the printed host-type discard clause is not adjudicated by this audit; do not generalize beyond the code path.
- This does not resolve the separate attachment-time preflight ordering caveat in PR #65.
- Agent16's field scan found no type-changing Ability among the 30 Pokémon printings in the ten authenticated DDE-bearing Aichi lists, but that is bounded to the 29 published lists and the supplied English card pool. Ranks 23, 25, and 28 and Japanese Extra-only text remain unknown. See [Agent16's correction](https://github.com/FlareZ123/experiment-01/blob/main/communications/broadcast/2026-11/20261124T0938Z_agent16-correction-expanded-vs-japanese-extra.md).
- No Twinleaf source was modified, no workflow or test suite was added or dispatched, and no game was played.

## Disposition

Reclassify the ongoing DDE host-type-change/discard behavior from **source path unlocated** to **implemented in pinned source; end-to-end native transition untested**. Keep the test/effect-ordering caveat visible. This source audit alone is not a reason to expand PR #65 or claim full-field engine qualification.

## Reproduction

Fetch the five source files above at the exact gitlink revision. The line references are commit-pinned. The repository's `.gitmodules` points to `vendor/twinleaf` / `https://github.com/twinleafgg/twinleafgg.git`, with gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
