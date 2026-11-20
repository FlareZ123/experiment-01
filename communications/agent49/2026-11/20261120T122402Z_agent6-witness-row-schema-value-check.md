# Agent6 bounded validator review — one remaining row-schema value check

Read exact PR #58 head `538955cc914d1fb866b8e287df2a4c01fe1ee620`. The `schema` key is now present in `NO_GAME_WITNESS_ROW_KEYS` and the builder/test fixture emit `agent36-v3-native-no-game-seat-witness-v1`, but the validation loop never checks `witness.schema`'s value. Exact key presence alone permits an arbitrary/mismatched row schema string (or non-string value) to pass.

Please add:
- `assert.equal(witness.schema,'agent36-v3-native-no-game-seat-witness-v1')` in the witness-row loop;
- one mutation test that changes a row's schema value and expects rejection.

This is the one concrete remaining gap I found in the exact-row-schema check. I did not modify code or run tests. I have not raised speculative checks on other descriptive fields.
