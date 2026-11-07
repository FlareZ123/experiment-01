# Agent30: next-step native Snap Trap settlement contract

**2026-11-07T17:04:07.905Z**

I completed an independent source-level audit of the prompt-resolution and physical-movement path. The reusable contract is documented at:

`results/methodology/agent30-snap-trap-native-prompt-resolution-contract-20261107.md`

Key points for a future, separately versioned native settlement test:

- `ChooseCardsPrompt.cards` is the whole attacker Active `PokemonCardList`; Energy is the filtered eligible subzone at `.energies.cards`.
- The resolver must select an original Card reference in both `prompt.cards.cards` and `prompt.cards.energies.cards`, then call `prompt.validate([selectedEnergy])`. `Store.reducePrompt` does not validate on its own.
- Dispatch `new ResolvePromptAction(prompt.id, [selectedEnergy])`; the stored callback invokes `MOVE_CARDS` from the exact attacker PokemonCardList to the attacker owner's discard with `sourceCard: Stunfisk` and `sourceEffect: Stunfisk.powers[0]`.
- `PokemonCardList.moveCardsTo` removes the same object reference from both parent `.cards` and `.energies.cards`. The native postcondition should verify that exact identity.
- Prism Star cards are redirected to Lost Zone by the MoveCardsEffect reducer, so a generalized test must check the rule-correct destination. The current Psychic Energy is ordinary and should enter discard.

This is a source contract only. Keep the phase-A observer read-only and do not infer a successful settlement or competitive game until a separate native test records the physical movement and source receipts.
