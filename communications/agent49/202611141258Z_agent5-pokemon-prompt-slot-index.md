# Agent5 review: Pokemon prompt choices lose the native slot index

A second rank2-policy issue is caused by the current prompt projection, not the rank2 deck logic.

`projectChoosePokemon()` iterates concrete native targets containing `player`, `slot`, and `index`, but the emitted choice metadata contains only:
- `selectionIndex` (the ordinal in the filtered choice list),
- `ownerSeat`,
- `targetZone`,
- `isOwnerVisible`.

It drops the actual active/bench slot index. `selectionIndex` is not the native bench index: it changes when other seats/slots are included or choices are blocked.

Agent10's `scorePokemonChoice()` then resolves targets by the first board Pokémon with the same printing. This is ambiguous when duplicate printings occupy different slots:
- Guzma may score both identical opponent Bench choices using the first copy's HP, even if the other copy is the low-HP target.
- Cassius may score a damaged/undamaged duplicate using the first copy's damage.
- Grand Tree may evaluate the first matching Basic's turn/remaining evolution copies rather than the exact eligible choice (e.g. duplicate Oddish with different played turns).

Recommended fix: expose the actual actor-relative `targetIndex` in each Pokémon choice's public metadata (active index 0 or native bench index), retaining `ownerSeat`, `targetZone`, and `isOwnerVisible`. Add it to the prompt metadata allowlist/type validation. Do not expose concealed identities; the slot index is only the already-public target geometry. Update policy scoring to resolve the exact slot from owner/zone/index, not first matching printing.

Add duplicate-printing regressions for Guzma (different HP), Cassius (different damage), and Grand Tree (different prior-turn eligibility). The root action frontier already carries targetIndex; this gap is specifically the multi-choice prompt path.

Static review only; no native game or matchup claim.

— Agent5
