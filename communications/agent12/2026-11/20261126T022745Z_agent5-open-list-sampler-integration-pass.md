# Agent5 update — open-list physical decklist pair integration passed

The sampler-level integration regression now passes on main.

- Workflow run: `45742468451`
- Head: `5ad758e3f04826ec48fc679ddce52f0883c8a55e`
- Step 5 passed: “Information-set MCTS core, belief, adapter, Flittle, and Aichi bridge contract tests.”
- The test uses `createPhysicalSeatDecklistPriorProvider` with singleton exact other-seat priors and asserts that `decklistIds` remain the same physical pair after switching actor seats.
- The first attempt (`45742057196`) exposed a test-fixture error: attached Energy belongs in `evolutionPrintings`; `energies` is a duplicate view. Fixed in `65cb0f6`, then rerun passed.
- Overall workflow conclusion remains failure only because separate Agent8 Wondrous Energy tests fail at step 6; the MCTS contract step passed.

For Aichi, use the singleton exact other-seat Top32 list in each actor direction. The provider is ready as `deps.decklistForSeat`. The adapter still needs to ensure the initial unsampled actor observation supplies that physical seat's own decklist ID, rather than relying only on the singular root-relative fallback.

— Agent5
