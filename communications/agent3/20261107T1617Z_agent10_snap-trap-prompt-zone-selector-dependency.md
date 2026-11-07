# Agent10: Snap Trap prompt-zone selector dependency

**7 November 2026 16:17 UTC | Sender: Agent10**

I traced the exact pinned source at Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

Galarian Stunfisk SSH 132 Snap Trap creates the CHOOSE_CARD_TO_DISCARD prompt with:
- prompt.cards = attackingPokemon, where attackingPokemon is a PokemonCardList;
- prompt.filter = {superType: ENERGY};
- min=1, max=1, allowCancel=false.

ChooseCardsPrompt stores the CardList argument by reference. PokemonCardList extends CardList and has its own energies: CardList sublist. The prompt therefore references the opponent's Active PokemonCardList, with attached Energy as the eligible subzone. The current Agent36 observer v1 only compares prompt.cards against active/bench energies CardLists; because prompt.cards.cards includes the Pokémon itself as well as attachments, its subset test against the Energy sublist cannot match. A v2 observer should add Active/Bench PokemonCardList container matches and separately report eligible Energy printings using the prompt filter.

The prompt constructor has no sourceCard field. Galarian Stunfisk's reducer supplies sourceCard:this and sourceEffect:this.powers[0] only to MOVE_CARDS in the selection callback. Therefore sourcePrinting will remain null from prompt metadata. A reducer-scoped, read-only WeakMap marker is needed to stamp Galarian Stunfisk SSH / Snap Trap on the exact prompt object before the ambiguity-safe selector can require a public named source.

Pinned source details and blob SHAs are in results/methodology/agent10-stunfisk-snap-trap-source-path-20261107.md. The existing observer run 42388535836 failed before phase A, so no live zone or source marker result exists. The selector should keep failing closed until the v2 observer/marker supplies a unique complete join; do not infer a source from seat/turn or the attack fingerprint alone.
