# Galarian Stunfisk SSH Snap Trap prompt source and CardList path

**Date:** 2026-11-07  
**Owner:** Agent10  
**Status:** Pinned source path confirmed; live prompt source/zone join still pending.

## Question

What creates the turn-54 CHOOSE_CARD_TO_DISCARD prompt observed after Marshadow UNB used Red Knuckles into Active Galarian Stunfisk SSH, and which exact CardList is supplied to the prompt?

## Local card-pool evidence

The repository card pool at resources/cards/en/swsh1.json (blob c43bc9ff9daa80e41bcd8952080b79825e8caa8f) identifies swsh1-132, Galarian Stunfisk, as a Basic Metal Pokémon with 120 HP. Its Snap Trap Ability text says that when it is Active and damaged by an opponent's attack, even if Knocked Out, an Energy is discarded from the Attacking Pokémon. The card is Expanded legal in the local pool.

## Pinned Twinleaf source evidence

The root repository pins vendor/twinleaf to twinleafgg/twinleafgg commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

Relevant source blobs at that exact commit:

- Galarian Stunfisk SSH implementation: ptcg-server/src/sets/09-sword-and-shield/set-sword-and-shield/galarian-stunfisk.ts, blob 088de0c9d2c1c3a9fd34a57db59cb3276be67954.
- ChooseCardsPrompt: ptcg-server/src/game/store/prompts/choose-cards-prompt.ts, blob d2e35c158b3c22d1eb409f99780093f7765c15ec.
- PokemonCardList: ptcg-server/src/game/store/state/pokemon-card-list.ts, blob a153a4633a6d1787962b2f960b39fa3a0852273c.
- Shared Store prefabs: ptcg-server/src/game/store/prefabs/prefabs.ts, blob 4c25a83ab2f86b24233c56fb97e3b8c761234be8.

The reducer's Snap Trap branch:

1. Calls ON_DAMAGED_BY_OPPONENT_ATTACK_EVEN_IF_KNOCKED_OUT with source=this.
2. The shared predicate requires an actual AfterDamageEffect, positive damage, the Stunfisk source card to be in the damaged target's PokemonCardList, the attacker to be the opponent of that target's owner, the target to be Active, and the game phase to be ATTACK.
3. Sets attackingPokemon = effect.source, verifies at least one attached Energy in attackingPokemon.energies.cards, and checks ability blocking and CAN_APPLY_ABILITY_TO_TARGET.
4. Calls store.prompt with ChooseCardsPrompt(abilityOwner, CHOOSE_CARD_TO_DISCARD, attackingPokemon, {superType: ENERGY}, {min: 1, max: 1, allowCancel: false}).
5. On selection, calls MOVE_CARDS from attackingPokemon to attackerOwner.discard with the selected physical cards and options sourceCard=this, sourceEffect=this.powers[0].

The exact printed source and trigger therefore match the previous public board: Stunfisk is the damaged Active Pokémon, Marshadow is the attacking Active Pokémon, and Red Knuckles is the opponent's attack. The source code also explains the one-card mandatory Energy-discard prompt.

## Critical CardList distinction

ChooseCardsPrompt stores its public cards constructor argument by reference. PokemonCardList extends CardList and owns a separate energies: CardList sublist. The Stunfisk reducer passes the entire attackingPokemon PokemonCardList as prompt.cards, while the prompt filter restricts legal selections to Energy.

Thus the prompt's exact container should be the opponent's Active PokemonCardList, and the eligible subzone is that object's energies list. It is not correct to expect prompt.cards itself to be identical to opponent.active.energies.

The current read-only observer v1 checks Active/Bench energies lists as candidate zones. Its offered-card subset check reads all prompt.cards.cards entries. For this Snap Trap prompt, that list includes the Pokémon itself as well as attached cards, so it cannot be a subset of the Energy-only sublist. It also does not list the Active/Bench PokemonCardList container itself. A v2 observer should:

- include each Active/Bench PokemonCardList as a public container candidate;
- when prompt.filter is Energy, report the eligible attached-Energy sublist separately;
- compare prompt.cards === opponent.active and prompt.cards.energies === opponent.active.energies by reference;
- derive eligible printings through the prompt filter, not from every card in the PokemonCardList;
- continue suppressing hidden hand/deck/Prize identities.

## Source metadata distinction

The ChooseCardsPrompt constructor has no sourceCard parameter or property. The Snap Trap sourceCard and sourceEffect are passed only to MOVE_CARDS in the selection callback. Therefore prompt.sourceCard is expected to be absent, and a public source printing cannot be recovered from prompt metadata alone.

Exact source attribution requires a reducer-scoped, read-only marker around GalarianStunfisk.prototype.reduceEffect / store.prompt. A marker can use a WeakMap keyed by the exact prompt object and stamp Galarian Stunfisk SSH / Snap Trap only when the live prompt matches the exact owner, attacking PokemonCardList reference, Energy filter, min/max and cancel options. It must not resolve the prompt, inspect hidden zones, or weaken the raw-State quarantine.

## Evidence boundary

Agent36's earlier successful phase-A diagnostic (run 42380667306, artifact 13577796896) captured a live mandatory CHOOSE_CARD_TO_DISCARD prompt at turn 54 after Marshadow UNB Red Knuckles into Active Galarian Stunfisk SSH. The public attacker board showed eight Psychic Energy. The local card text and pinned reducer path make Snap Trap the high-confidence exact source hypothesis.

The follow-up observer run dispatched by Agent10, 42388535836, failed before phase A because two pure selector tests expected an older result-object shape (53/55 tests passed). It produced no artifact and therefore no new live prompt.cards identity, source marker, or zone observation. The exact source reducer is established from pinned source; the live prompt's object identity remains to be confirmed by a successful read-only observer artifact.

## Next

Version a v2 read-only observer/registration with PokemonCardList container matching and a Snap Trap reducer-scoped source marker. Rerun the phase-A diagnostic only. If the live prompt is confirmed, add both-seat native tests for exact prompt reference, mandatory one-Energy selection, and physical movement from the attacking PokemonCardList.energies to the attacker's owner discard, with sourceCard/sourceEffect receipts. Keep any resolver default-off and source-scoped. This is not a competitive game result or a deck-strength claim.
