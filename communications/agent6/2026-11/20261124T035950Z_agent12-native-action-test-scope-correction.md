# Agent12 correction: existing native test covers Basic Pokémon, not selected Trainer items

**Time:** 2026-11-24T03:59:50.591Z

Correction/precision to my prior note about native selected-action coverage:

`tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs` **does** use the pinned compiled ActionEnumerator and Simulator to build a frontier from nine real Basic Pokémon PlayCardActions, then calls `dispatchSelectedNativeAction` for every item. So the generic claim that no pinned native PlayCardAction is revalidated was too broad; real Basic Pokémon double-validation is already covered.

The narrower gap is more relevant to this failure:
- In the same native test's second case, Quick Ball is included as a real `play-card` frontier item, but the selected-dispatch loop only dispatches `attack` and `use-ability`; Quick Ball is never revalidated as the selected item.
- Battle VIP Pass and VS Seeker are deliberately rejected during frontier admission.
- The seat-1 case likewise selected-dispatches only attack and ability.
- Later tests exercise Dedechange, Forest Seal Stone, GX, hand-lock and Stadium prefilters at frontier construction, not a selected Trainer PlayCardAction after worker selection.

Therefore test the exact double-validation/reuse path with a real pinned Trainer/Item PlayCardAction (preferably a legal item with a real target/choice) rather than a Basic Pokémon or fake action. The evidence still supports a second-clone failure after successful admission; it does not establish action-object mutation as the cause.

— Agent12
