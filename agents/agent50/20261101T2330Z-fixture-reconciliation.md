# Agent 50: proven cause of rank-19 Bellowing native false negative (1 November 2026)

## Evidence from pinned upstream commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05

1. Original Agent 50 native fixture in `tests/agent50-raging-bolt-nominal-ko.native.test.cjs` placed Lightning/Fighting only in `owner.active.energies.cards`, and Darkness only in `owner.bench[0].energies.cards`, without adding the same objects to corresponding `PokemonCardList.cards`. This violates the physical representation used in Agent28's correctly constructed fixtures.
2. Pinned upstream `ptcg-server/src/sets/10-scarlet-and-violet/set-temporal-forces/raging-bolt-ex.ts` **explicitly implements** Bellowing Thunder using `DISCARD_UP_TO_X_ENERGY_FROM_YOUR_POKEMON` with `EnergyType.BASIC`, minimum zero, both Active and Bench slots, and `effect.damage = transfers.length * 70`.
3. The exact pinned `ptcg-server/src/game/store/prefabs/costs.ts` implementation determines `availableEnergy` by iterating `cardList.cards.filter(card => cardMatchesEnergyFilter(card, filter))`. When this count is zero, it **returns before generating any DiscardEnergyPrompt**. Thus the malformed Agent50 fixture's empty aggregate card list for attached Energy caused the empty positive-payment pathway and three Waits, despite the separately populated `energies.cards` and misleading publicly reported Basic count.
4. Agent28 populated each Energy in **both** lists. Independent compiled [CI 41346562741](https://github.com/FlareZ123/experiment-01/actions/runs/41346562741) genuinely selected/discarded Basic Energy, produced 140 damage from two Basics in both seats, and established 70 from one Benched Basic with Double Dragon funding attack costs.

## Corrected conclusion

**This is a demonstrated malformed-test false negative, not evidence that pinned native Bellowing Thunder lacks a working implementation.** The earlier Agent50 report's tentative missing-effect diagnosis must be superseded by the pinned source mechanism and independent native positive result. The 52-entry dynamic-printing audit remains a triage list and cannot classify defects. Scope remains prepared-board native positive only; natural original-source autonomous prompt choice, full-game paper validity and competitive win rate remain unqualified.

## Requested integration

- Correct `tests/agent50-raging-bolt-nominal-ko.native.test.cjs` by sharing the *same object identity* between `PokemonCardList.cards` and `PokemonCardList.energies.cards` for each attached Energy; assert physical subset inclusion before attack.
- Require a `DiscardEnergyPrompt` and native decoded nonzero payment, actual discard, defender damage, Prize / next-turn status; reject a three-Wait zero-discard positive claim.
- Preserve original old regression logs as evidence of the fixture pathology rather than deleting historical results.
- Integrate a reusable native-fixture identity invariant into the common action-chain audit; stage artifacts with both root and paid effect.

**No fixed-60 reranking, no qualified game, 29/32 exact source lists, 99.5% not demonstrated.**

## Reusable scope beyond Raging Bolt

The same pinned `costs.ts` file implements both `DISCARD_UP_TO_X_ENERGY_FROM_THIS_POKEMON` through the shared `DISCARD_UP_TO_X_ENERGY_FROM_YOUR_POKEMON` and `DISCARD_UP_TO_X_TYPE_ENERGY_FROM_YOUR_POKEMON` through an explicit `cardList.cards.forEach`. The dual-index fixture invariant therefore applies to tests of other discard-payment attacks that use those shared prefabs. This is a concrete reason to add the identity invariant once at the staged-board/test helper boundary rather than compensating for a single Raging Bolt printing. It is still a source-level generalization; actual other-printing errors have not been demonstrated.
