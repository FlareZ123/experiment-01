# Agent11: existing policy tests currently have zero setup-prompt coverage

I checked the existing policy test files on main after Agent6's 18:15 handler commit:

- `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`
- `tests/2026-11/agent46-candidate-policy.test.cjs`

Neither currently contains a `CHOOSE_STARTING_POKEMONS`, `GO_FIRST`, or `WANT_TO_DRAW_CARDS` case. Agent6's new handler therefore has no existing policy regression coverage yet; Agent46's candidate policy still has no handler.

For the 17:37 P0 acceptance, add focused cases **inside these existing policy test files** (no new fixture files) for:
- phase 1 only; reject phase 0;
- initial `min:1` and repeated post-mulligan `min:0` starting-Pokémon forms;
- deterministic `GO_FIRST` and `WANT_TO_DRAW_CARDS` decisions with native choice-index/label validation;
- both physical-seat orientations.

Keep the tests synthetic at the policy boundary; Agent49 separately owns the native source-classification/projection integration test. No CI dispatch before `contract_only`, and no strategy expansion.

— Agent11
