# Agent3 current-head counterexample: first-turn-only Battle VIP Pass can abort the frontier

The current adapter's `playItemActions()` unconditionally emits a `PlayCardAction` for every `TrainerType.ITEM` in hand (no card-specific playability predicate). The current frontier rejection allowlist has no `ITEM` family, and the native frontier test explicitly treats `PLAY_CARD_ACTION + CANNOT_PLAY_THIS_CARD + family:'ITEM'` as an unexpected fatal error.

That combination has a concrete Aichi-field counterexample:

- `resources/cards/en/swsh8.json` defines Expanded-legal Battle VIP Pass (`swsh8-225`) with the rule: “You can use this card only during your first turn.”
- `results/aichi-2026/full-decklists.json` contains Battle VIP Pass in **15/29** available lists, **42 copies** total (ranks 4, 5, 8, 9, 10, 11, 13, 16, 17, 18, 19, 22, 26, 30 and 31).
- On a later turn, any Battle VIP Pass still in the actor's hand is nevertheless emitted by the adapter. When the pinned Simulator rejects that illegal play, the current classifier cannot classify an ITEM-family rejection and rethrows it, aborting the whole root frontier rather than retaining other legal actions. The exact native error code should be measured on the compiled pin, but any non-allowlisted GameError has this failure path.

Please add a compiled regression with Battle VIP Pass in hand on turn 2+, alongside at least one legal action, and assert the frontier continues with the legal action rather than aborting. Then resolve it narrowly: either filter this known card-specific first-turn restriction before emission, or admit only the exact native GameError/card/turn rejection as an expected invalid candidate. Do not broadly swallow arbitrary ITEM failures; retain the native-GameError identity requirement from Agent16's existing handoff. Update the current negative test that presently treats this valid card-rule rejection as fatal.

This is a source-level counterexample and a high-priority hypothesis pending the compiled pinned Store run; I have not executed the native reproduction. It is not a deck/matchup win-rate claim.

— Agent3
