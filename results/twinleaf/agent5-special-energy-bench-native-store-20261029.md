# Double Dragon Bench-target physical settlement, pinned Twinleaf Store (29 October 2026)

**Agent 5. Evidence type:** Staged genuine native Store effect and actor-owned root receipt in both physical seats. **Competitive-qualified games: 0.**

## Exact reproducible stage

The research-owned script `simulation/twinleaf/agent5-special-energy-bench-native-gate.cjs` uses pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `initializeCards()`, printed `Double Dragon Energy ROS`, `Regidrago V SIT`, and `Mewtwo & Mew-GX UNM`. In both physical orientations, the owner has a face-up Mewtwo & Mew-GX Active, a Regidrago V at **Bench index 1**, and Double Dragon Energy in hand. Both players have independently initialized five native `PokemonCardList` Bench slots, deck and Prize zones and a native `Player`. It is a deliberately injected, fully revealed development position with `state.turn=2`, `GamePhase.PLAYER_TURN` and `Format.EXPANDED`, not a naturally dealt game.

At the actual owner root, `actorObservation` removes the native Store and hidden deck identities from the policy input. The default `chooseActorRootIntent` remains unmodified. The experimental `{publicContextSpecialEnergy:true}` option must select the exact physical intent:

```js
{
  kind: 'attach-special-energy',
  printing: 'Double Dragon Energy ROS',
  handIndex: 0,
  slot: 'bench',
  index: 1
}
```

The native Store then receives a real `PlayCardAction` with `PlayerType.BOTTOM_PLAYER`, `SlotType.BENCH`, and index 1, under both physical owner seats. The native receipt asserts: no exception; target Regidrago V has exactly one attached printed Double Dragon Energy; owner's hand no longer contains that card; Active's Energy count is unchanged; the player's turn and active seat are unchanged; no pending prompts remain; and the shared `rootPhysicalWitness` returns `confirmed-public-effect` only after the true native attachment. The identical no-op pre/post snapshot is explicitly negative.

## Compiled outcome and failure retention

- [Native manual CI **40965068000**](https://github.com/FlareZ123/experiment-01/actions/runs/40965068000): the pinned compilation and pure tests succeeded, but the new fixture failed before dispatch because a raw `new Player()` has no initialized Bench slot at index 1. The failure was not a rejected Special Energy play.
- [Native manual CI **40965351409**](https://github.com/FlareZ123/experiment-01/actions/runs/40965351409), head `9572218d50178e80646f0c8115594cc17bc6e36a`: **success**. Pure actor-root tests, pinned submodule compile, previous native Stadium and Steven controls, and both physical seats of the new native Special Energy Bench receipt all passed.
- The corrected stage adds `new PokemonCardList()` for each physical Bench slot, matching an existing pinned native setup pattern. Both runs used the existing manual-only `agent5-owner-root-native.yml` workflow. No new permanent CI trigger or change to the original opponent 60s was introduced.

## Scope and qualification

This closes the specific **actual Store recipient-attestation** gap documented in [the Agent 5 snapshot/witness correction](agent5-special-energy-bench-recipient-witness-20261029.md). The native test additionally demonstrates that the common actor-owned option can choose and execute a printed Special Energy attachment to a Benched Pokémon on either side.

It does **not** establish the frequency of natural hand opportunities, correct tactical priority against competing Supporter and Attack alternatives, proper response by a live opponent, complete field-game resolution, or performance against any of the 32 original Aichi opponents. The trigger remains opt-in. No 99.5% result is supported. The next meaningful test is the Critic-requested **same-root alternative-action arbitration** on a naturally observed deal, followed by a common owner-visible both-player continuation.

**Status unchanged:** 29/32 exact printed source 60s recovered (missing 23, 25, 28); zero competitively qualified games; no validated fixed winning 60.
