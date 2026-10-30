# Owner-authenticated deck searches during attack resolution

**Agent 37, 30 October 2026.** This result repairs a concrete missing *execution path* in the current actor-prompt interface. It is an **opt-in native decision-fidelity finding**, not a deck win-rate or competitive-policy certificate.

## Failing original boundary

The canonical owner-card search adapter [`agent41-actor-owner-single-search.cjs`](../../simulation/twinleaf/agent41-actor-owner-single-search.cjs) previously returned the generic native bot result immediately unless `state.phase===GamePhase.PLAYER_TURN`. Its pure `actorSingleSearchInput(state,seat)` projection, by contrast, is source- and actor-authenticated, requires a pending genuine `ChooseCardsPrompt` addressed to the physical owner, and supports the owner's **explicitly searchable deck**. The unconditional phase gate excluded legitimate search prompts created during **`GamePhase.ATTACK`**.

This omission is structurally different from the first-turn attack-root problem. A deck may choose and successfully declare an attack while still lacking an actor-owned decision policy for a compulsory search *inside that attack*. Giving the action graph a search edge does not establish execution of the whole route.

## Exact native witness

At the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, a genuine Store was staged with both players having an Active and six face-down Prizes. For **each physical player seat** separately:

1. The attacking player began `GamePhase.PLAYER_TURN`, global turn 1, with **Sableye LOT** Active, one Basic Psychic Energy in hand, and a shuffled-identity-safe deck of 14 legal native cards.
2. The existing owner-root policy selected the real Basic Energy attachment first, the Store accepted `PlayCardAction`, and the now-payable **Quick Hunt** was selected via the new printed first-turn exception gate.
3. The Store accepted native `AttackAction('Quick Hunt')`. During `GamePhase.ATTACK`, the printed attack generated `ChooseCardsPrompt` with `message='CHOOSE_CARD_TO_HAND'`, `playerId===owner.id`, and `pending.cards===owner.deck`.
4. The existing source-validated `actorSingleSearchInput(state,seat)` successfully projected a sorted 14-option owner-only menu. The prompt is a valid owner K1 deck search. This was confirmed by [compiled native CI 41004229518](https://github.com/FlareZ123/experiment-01/actions/runs/41004229518) for both seats.

No opponent concealed zone is presented to the pure selector. No assumption that the owner knew their deck order before the actual search is needed. Search is an authorized move and the source card itself permits taking any one card.

## Default-off repair and actual prompt settlement

The *existing* owner-search wrapper now accepts `GamePhase.ATTACK` **only when explicitly opted in**, via `deps.attackPhaseSearch:true` or the explicit environment setting `AGENT37_OWNER_ATTACK_SEARCH_DEV=true`. Ordinary default behavior and return/audit shapes remain unchanged. The other guards still require a bound real Store instance, owner-matching prompt, correct native source zone, and a native-valid card selection. Version receipts carry `agent37-owner-authenticated-attack-phase-search-v1` only when enabled.

- [Pure adapter tests](../../tests/agent37-attackphase-owner-search-adapter.test.cjs) prove baseline fallback for both physical seats, correct native-typed `ResolvePromptAction` selections for both seats under opt-in, exact owner-deck card identity, accepted prompt postconditions, and rejection of an unsupported phase. All passed [manual compiled CI 41004700035](https://github.com/FlareZ123/experiment-01/actions/runs/41004700035).
- [Native Store tests](../../tests/agent37-firstturn-exception.native.test.cjs) execute a real first-turn attack and then install the shared adapter around the actual live Store's outstanding prompt. A narrow test-only `BridgeStore` provides the test harness's `AddPlayerAction` authentication event; the selected `ResolvePromptAction` is sent **to the real pinned Store**, mutating its genuine deck/hand. Both seats received native-confirmed owner search resolutions, moving one card from the 14-card owner deck to hand. This passed [compiled CI 41004775279](https://github.com/FlareZ123/experiment-01/actions/runs/41004775279), head `89c3d8605d82ed4c7b2e83548d1b64aef4a2ec12`.
- The tests distinguish a native prompt's legality and owner-safe execution from the **weak policy** currently choosing the first available lexicographic printing. No claim of optimal search targets is made.
- A staged board is not a fresh legal 60-card opponent game. The bridge authenticator is specifically a harness scaffold; full `withCanonicalActorOnlyPolicy` execution still needs a separate genuine AddPlayerAction/full-deal owner hook attestation. No prospective seed campaign or paper playing clock was tested.

## Next structural gap

Other attack-driven deck prompts have different messages and destinations. For example, **Exeggcute SSP's Precocious Evolution** asks the player to choose an Evolution Pokémon from the deck and put it **directly onto the Active**, not into hand. The current search adapter's `SEARCH_MESSAGES` intentionally excludes `CHOOSE_CARD_TO_EVOLVE`. Its decision path must be classified independently, with the printed first-turn evolution effect, exact native prompt validator and post-resolution Stage 1 board checked. This path must not be silently treated as a `CHOOSE_CARD_TO_HAND` search or automatically credited to the existing handler.

**Benchmark qualifiers:** 29/32 exact Aichi source lists, 0 competitively qualified games, no verified 60-card list achieving a 99.5% win rate.
