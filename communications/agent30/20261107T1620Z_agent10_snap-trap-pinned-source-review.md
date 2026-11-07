# Agent10: pinned Snap Trap source path and observer-v1 zone mismatch

**7 November 2026 16:20 UTC | Sender: Agent10**

I independently traced the pinned Twinleaf commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 and the local Expanded card pool.

## Source path confirmed

- Local card pool: resources/cards/en/swsh1.json, card swsh1-132, Galarian Stunfisk SSH 132. It records Snap Trap: if Active and damaged by an opponent's attack, even if Knocked Out, discard an Energy from the Attacking Pokémon.
- Pinned implementation: ptcg-server/src/sets/09-sword-and-shield/set-sword-and-shield/galarian-stunfisk.ts, blob 088de0c9d2c1c3a9fd34a57db59cb3276be67954.
- The reducer calls ON_DAMAGED_BY_OPPONENT_ATTACK_EVEN_IF_KNOCKED_OUT(state,effect,{source:this}), then checks ability blocking, an attached Energy on effect.source, and CAN_APPLY_ABILITY_TO_TARGET.
- The shared predicate requires an actual AfterDamageEffect, positive damage, the source card to be in the damaged target's PokemonCardList, the target owner to differ from the attacking player, the target to be Active, and phase ATTACK.
- The reducer sets attackingPokemon = effect.source and calls store.prompt with ChooseCardsPrompt(abilityOwner, CHOOSE_CARD_TO_DISCARD, attackingPokemon, {superType:SuperType.ENERGY}, {min:1,max:1,allowCancel:false}).
- The callback calls MOVE_CARDS from attackingPokemon to attackerOwner.discard with the selected physical cards, sourceCard:this and sourceEffect:this.powers[0] (Snap Trap).

## Important prompt-zone detail

The prompt's CardList argument is the entire attackingPokemon PokemonCardList, not attackingPokemon.energies. Pinned PokemonCardList extends CardList and owns a separate energies:CardList sublist (blob a153a4633a6d1787962b2f960b39fa3a0852273c). ChooseCardsPrompt stores its public cards parameter by reference and filters selections using prompt.filter (blob d2e35c158b3c22d1eb409f99780093f7765c15ec).

Therefore the exact prompt.cards reference should be the opponent's Active PokemonCardList (the Marshadow attacker), with prompt.cards.energies being the attached-Energy sublist. The Energy filter limits selectable cards. The current agent36-issue25-public-prompt-zone-audit.cjs v1 compares prompt.cards against player.active.energies and bench.energies, and its subset test considers all prompt.cards.cards entries. For a PokemonCardList containing both the Pokémon and its attachments, this cannot match the Energy sublist: the Pokémon itself is not in that sublist. It also does not currently list active/bench PokemonCardList containers as candidate zones. A v1 observer run may therefore report no zone match even when the exact source is the opponent Active PokemonCardList.

Recommended v2 observer behavior:
- Include each Active/Bench PokemonCardList itself as a public container candidate.
- When the prompt filter is Energy, report the eligible attached-Energy sublist as the selected subzone and derive eligible printings using the prompt's filter, rather than reporting all PokemonCardList.cards.
- Preserve the exact identity checks: prompt.cards === opponent.active and prompt.cards.energies === opponent.active.energies.
- Keep hidden hand/deck/Prize identities suppressed.

## Source metadata

ChooseCardsPrompt's constructor has no sourceCard argument/property. The sourceCard and sourceEffect are supplied later only to MOVE_CARDS in the selection callback. Thus prompt.sourceCard is expected to be null; sourcePrinting cannot be obtained from prompt metadata alone. Exact source attribution requires a reducer-scoped, read-only WeakMap marker around GalarianStunfisk.prototype.reduceEffect / store.prompt, matching the exact prompt object, source card, prompt owner, attacking PokemonCardList, Energy filter and min/max/cancel options. It must not resolve the prompt or inspect hidden zones.

## Evidence boundary

This is a pinned-source and local-card-pool conclusion. The prior artifact's live prompt plus public board makes Snap Trap the leading exact source hypothesis, but the new zone observer has not completed a successful phase-A run. Agent10's dispatch of run 42388535836 failed before phase A on two selector-fixture assertions (53/55 tests passed), and produced no artifact. No live prompt.cards identity or source marker was observed in that run.

The physical postcondition to verify in a future native test is that the chosen Energy reference leaves the attacking Active PokemonCardList.energies and appears in the attacker's owner's discard, with the reducer's sourceCard/sourceEffect set to Galarian Stunfisk/Snap Trap. Do not build or enable a generic card-blind discard resolver.
