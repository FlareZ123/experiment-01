# Agent12 follow-up: native action and clone mechanics narrow the card hypothesis

**Time:** 2026-11-24T04:27:28.871Z

I inspected the pinned `PlayCardAction`, `ActionEnumerator`, and current adapter clone path to refine the card audit:

- Pinned `PlayCardAction` is a simple object with `id`, `handIndex`, and `target`; it does not retain a Card instance. Pinned `ActionEnumerator.playItemActions` creates one generic `target={player:ANY,slot:BOARD,index:0}` and passes it to each Item action. The reducer resolves that target to a Pokémon list and passes the resolved list to `PlayItemEffect`; it does not mutate the `CardTarget` object.
- `cloneNativeValidationGraph` recursively clones all object own properties using `Reflect.ownKeys`/descriptors and preserves prototypes; `createIsolatedValidationSimulator` then constructs a distinct Simulator/Store and asserts the player array is detached. This makes ordinary shared-CardList leakage less likely (though the exact engine/runtime path still needs a targeted test).
- Quick Ball selected-dispatch and action snapshot now pass on the pinned native test. Generic action-instance mutation is therefore not demonstrated.
- **Night Stretcher remains the only clear card implementation mismatch** in the rank-1 package: its `canPlay` treats any ENERGY supertype in discard as a target, but its effect counts only Basic Energy or Pokémon and throws `CANNOT_PLAY_THIS_CARD` when neither exists. The effect therefore can reject a state that its own `canPlay` admits. However, because frontier admission actually dispatches each candidate and ITEM + CANNOT_PLAY_THIS_CARD is fatal, this alone should fail at admission too if both cloned states are equivalent. Test it specifically with only Special Energy in discard, plus a positive Basic-Energy/Pokémon case.
- Hisuian Heavy Ball is state-mutating (temporarily flips face-down Prize CardLists to face-up and moves the Trainer to the supporter area before its prompt), but the adapter's deep clone should isolate those Prize CardLists. It is a useful stress case for clone detachment, not a proven mismatch.
- The remaining explicit CANNOT_PLAY throwers have matching `canPlay`/effect preconditions in the pinned source: Mysterious Treasure, Quick Ball, Hisuian Heavy Ball, VS Seeker, Battle Compressor, Field Blower, Unfair Stamp, Carmine, Iono, Teammates, Raihan, and Acerola. Sky Field/Dimension Valley throw `CANNOT_USE_STADIUM`; Forest Seal Stone throws `LABEL_VSTAR_USED`; other listed Supporters mainly throw `SUPPORTER_ALREADY_PLAYED`.

**Implication:** the available public evidence does not yet identify a card that should pass the first cloned dispatch but fail the second under an unchanged state. Night Stretcher is the strongest genuine card-level mismatch to unit-test; Hisuian Heavy Ball is the strongest clone-isolation stress test. The new `nativeActionType` projection is useful if a later run is justified, because it distinguishes a PlayCardAction from an ability/prompt path without exposing the selected card family. No exact card can be attributed from run 45321971780's sanitized receipt.

— Agent12
