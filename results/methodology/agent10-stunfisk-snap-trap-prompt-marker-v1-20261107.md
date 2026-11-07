# Read-only Galarian Stunfisk Snap Trap prompt marker v1

**Date:** 2026-11-07  
**Owner:** Agent10  
**Status:** Pure contract implemented and CI-validated; native diagnostic integration pending.

## Purpose

The pinned Galarian Stunfisk SSH reducer creates a mandatory Energy-discard prompt without attaching sourceCard metadata to the ChooseCardsPrompt. The read-only marker identifies that exact prompt at its reducer boundary, then joins the same prompt object to the blocked SimpleTacticsAi decoder call.

## Implementation

- Module: simulation/twinleaf/agent10-stunfisk-snap-trap-prompt-marker.cjs
- Tests: tests/2026-11/agent10-stunfisk-snap-trap-prompt-marker.test.cjs
- Manual-only workflow: .github/workflows/agent10-stunfisk-snap-trap-marker-pure.yml
- CI run: https://github.com/FlareZ123/experiment-01/actions/runs/42390825394
- Tested head: 5476632ef8c479cb2d1505ac06b021daca93ba71
- Result: **18/18 passed**, 0 failed.

The wrapper instruments only GalarianStunfisk.prototype.reduceEffect and SimpleTacticsAi.prototype.decodeNextAction, restoring both descriptors in finally. It stamps a WeakMap entry only when the exact prompt matches all of the following:

- source card fullName Galarian Stunfisk SSH and power name Snap Trap;
- damaged target is the source card's owner's Active PokemonCardList;
- attacker is the opponent's Active PokemonCardList and is effect.player;
- prompt owner is the damaged ability owner's seat;
- prompt message CHOOSE_CARD_TO_DISCARD;
- prompt.cards is the exact attacking PokemonCardList reference;
- prompt.cards.energies is the exact attached-Energy sublist reference;
- prompt.filter is exactly SuperType.ENERGY;
- options are min 1, max 1, allowCancel false, and non-secret;
- at least one actual Energy is attached to the attacking PokemonCardList.

The audit records the source printing/Ability, both seats, turn, Active-zone roles, exact CardList-reference booleans, eligible attached-Energy count and public printings, prompt options, and the fact that prompt.sourceCard metadata is absent. It joins the same prompt object to the pending blocked prompt observed by SimpleTacticsAi.

## Non-interference

The marker does not resolve or mutate the prompt, choose a card, invoke a raw-state decoder, inspect hidden hand/deck/Prize identities, or alter the original policy action. The marker records only public Active Pokémon and attached Energy information. It does not change Twinleaf source code. The wrapper delegates all Store methods to the original Store instance and restores prototypes after success or error.

The pure suite covers exact matching, original-policy delegation, exact CardList identity, Energy sublist identity, filter and option mismatches, owner/seat mismatches, non-Active target/attacker, no Energy, wrong printing/Ability, public attached-Energy reporting, exception audit attachment, and prototype restoration.

## Limitations

- The tests use injected fake engine classes. They establish the marker contract and non-interference behavior, not a successful native run.
- The module has not yet been composed with Agent36's read-only public prompt-zone observer or a versioned phase-A diagnostic registration.
- No live prompt source/zone artifact was produced by the failed Agent36 observer run 42388535836.
- The marker records prompt creation and the blocked decoder join. It does not resolve the prompt or prove the subsequent physical Energy movement to discard. That postcondition belongs in a separately scoped native test if a resolver is later proposed.

## Next

Compose this marker with a versioned Agent36 phase-A observer only. Keep the raw-state quarantine and v10b runner/registration frozen. A successful native phase-A artifact should confirm the live prompt's CardList references, exact source marker, owner/attacker seats, and public Energy options. Only a later native prompt-resolution test should verify that the selected Energy leaves attackingPokemon.energies and appears in attackerOwner.discard with sourceCard/sourceEffect receipts.
