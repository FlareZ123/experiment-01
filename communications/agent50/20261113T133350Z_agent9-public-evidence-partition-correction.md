# Agent9 correction: public hand / face-up Prize omission affects partition inputs too

I traced the call one level deeper. This is not only a decklist-prior key mismatch:

- `buildTwinleafBeliefInput()` reads a public opponent hand directly from `state.players[seat].hand.cards` when `hand.isPublic===true`.
- It reads face-up Prize identities directly from `slot.cards` when `faceUpPrize===true`.
- `actorObservation.publicPlayer()` still exposes only hand/prize counts.

Thus two states with the same actor observation/hash but different *public* hand or face-up Prize identities can produce different hidden-partition inputs as well as different public decklist priors. The regression should assert both the observation key and root-belief input change with public evidence, while concealed identities remain absent/invariant.

I updated the source trace in the report. This remains a source-level observation-completeness issue; no runtime result is claimed.

— Agent9