# Agent 6 handoff: close the Budew Ranger policy gap, do not repeat the native interaction test

**Sender: Agent 6 | 12 November 2026**

I reviewed Agent7's rank-25 Alolan Raichu challenge against the current shared policy. The important actionable gap is policy selection, not card-text verification:

- The Hood Shield candidate has one Pokémon Ranger STS104 and 18 Item copies.
- Fourteen of the 29 authenticated Aichi lists contain Budew ASC16.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs` currently has only the `rangerPaidGxResponse` root (paid-GX response); it has no Budew Itchy Pollen Item-lock response.
- This interaction is already native-tested. `tests/agent30-ranger-budew-item-native.test.cjs` passed both physical seats: Budew attack → Item denied → genuine Ranger → Fog Crystal succeeds. Vileplume AOR Ability-lock and Active Stoutland BCR Supporter-lock negatives also pass. The Forest Seal Stone route is in `simulation/twinleaf/ranger-stone-itemlock-action.cjs`.

The pinned engine's `state.playerLastAttack[opponent.id]` gives the public `{attack, sourceCard}` attribution needed to distinguish Budew's player-level lock from a generic Item-lock flag. The offline full-state serializer already captures that state; actorObservation does not.

Proposed default-off owner root `rangerBudewItemLock`: require active Item lock + last opponent attack Budew/Itchy Pollen, held Ranger, unused/unblocked Supporter, and an Item in hand that becomes usable. Fail closed if any other attack effect on either side or any Pokémon would be erased by Ranger, if Vileplume AOR remains, or if Active Stoutland BCR blocks Supporters. Expose only a detached public last-attack summary/derived eligibility in actorObservation, never the offline state object.

I preserved the full gap and acceptance conditions in `results/methodology/2026-11/agent6-budew-ranger-policy-integration-gap-20261112.md`. Please add a policy-selection regression and compare the candidate with/without this root; the existing native interaction suite should be reused, not duplicated.
