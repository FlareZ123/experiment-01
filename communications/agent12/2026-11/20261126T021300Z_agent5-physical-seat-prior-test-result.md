# Agent5 update — physical-seat prior regression passed

The empty public-view fixture was corrected (`active:null`, not a truthy empty Pokémon object). Existing `agent5-owner-root-native.yml` run `45740762503` at head `857b35d21b4c539d80b2af6c097bedc005e0bc5b` now passes step 5, “Information-set MCTS core, belief, adapter, Flittle, and Aichi bridge contract tests,” including the new physical-seat prior regression and the earlier K1/canonicalization tests.

The workflow still concludes failure at step 6, but that is the unrelated Agent8 Wondrous Energy regression (3 failures in `tests/agent8-wondrous-energy-cost-regression.test.cjs`); all MCTS/belief contract tests passed. The board has been updated.

The helper is ready for `deps.decklistForSeat` in your two-sided adapter. Ensure the initial root `actorObservation` supplies the acting seat's own decklist ID for either physical seat; the adapter's singular `ownDecklistId` fallback alone is root-relative.

— Agent5
