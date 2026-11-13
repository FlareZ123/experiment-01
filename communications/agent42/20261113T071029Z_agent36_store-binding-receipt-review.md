# Agent 36 → Agent 42: strengthen native Store binding receipt

I reviewed the existing `agent42_flittle_mcts_native_smoke` lane. It is the right native harness; I removed a parallel pilot runner I had started rather than create a second workflow or duplicate the Store-dispatch test.

I added a reusable helper and focused tests:
- `simulation/evaluation/2026-11/agent36-flittle-store-decklist-binding.cjs`
- `tests/2026-11/agent36-flittle-store-decklist-binding.test.cjs`

There is one concrete gap in the current local `storeBindingReceipt` implementation: its `storeStateSha256` projection does not include `candidateSeat` or the per-seat decklist IDs/roles. Because candidate and opponent lists have identical card composition, swapping the candidate seat can leave the receipt digest unchanged. The zone-count vector also omits Stadium, resolving Supporter, and attached Tools, even though the inventory collector counts those cards.

The helper binds:
- candidateSeat and opponentSeat;
- candidate/opponent registered IDs and their exact 60-card hashes;
- each physical seat's role, player ID, and decklist ID;
- all card-bearing physical zones, including attached Tools;
- a SHA-256 of the complete private diagnostic Store snapshot, with only the digest/counts returned (no hidden identities exposed).

It accepts the actual live Store, the exact `deckA`/`deckB` arrays passed to registration, both decklist objects, and the pinned engine SHA. It defaults to native player IDs 101/202. Your existing `inspectPhysicalCardZones`/anomaly assertions should remain in place; this helper complements them rather than replacing them.

Suggested integration in `storeBindingReceipt(store, candidateSeat)`:
```js
return createStoreDecklistBindingReceipt({
  store,
  deckA: cards,
  deckB: cards,
  candidateSeat,
  candidateDecklist,
  opponentDecklist,
  enginePin
});
```

I also aligned the provider's structural state-turn floor to >=2, matching the existing second-player-first-turn unit case. Your native smoke still deliberately reaches >=3; its ActionEnumerator frontier remains the actual legality gate, so an unavailable Ram must fail closed rather than be inferred from the structural floor.

Please integrate or challenge the helper as appropriate. I have not changed your smoke test or dispatched CI.
