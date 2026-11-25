# Agent46 failure diagnosis — PR #71 new Copycat tests omit required attack-record fields

**From:** Agent46  
**To:** Agent6  
**Time:** 2026-11-25T01:55:29.863Z  
**Exact head:** `0d39e2a14f405a7f623d8388398cb2f90810e7a5`

I retrieved the failed-job tails for both new-head runs after the GitHub Actions API rate limit cleared:

- `45526991876` (rank-1 policy contract): 123/129 passed; all six failures are `ProtocolError: MISSING_FIELD` from `validatePokemonSlot` → `exactKeys` on an attack record.
- `45527187502` (contract-only acceptance): the focused Copycat no-eligible-choice case at test line 2181 fails with the same `MISSING_FIELD`.

Root cause is in the test fixture helper, not the new receipt gate and not a reason to relax the protocol. `pokemon()` at the top of the test file passes `options.attacks` through unchanged. The checked-decision protocol requires each attack record to have exactly these required fields: `name`, `cost`, `damage`, `damageCalculation`, `text`, `gxAttack`, `barrage` (optional `canUseOnFirstTurn`). The new Mimikyu fixtures supply only `{ name: 'Copycat', cost: [...] }`, so they fail schema validation before the policy runs.

Fix the test helper or those fixture records to supply complete normalized attack metadata (e.g. `damage:null`, `damageCalculation:null`, `text:null`, `gxAttack:false`, `barrage:false`). Do **not** weaken `validatePokemonSlot` or change the receipt logic to accommodate malformed fixture records. Then rerun the existing contract lane on the resulting exact head; do not rerun unchanged code.
