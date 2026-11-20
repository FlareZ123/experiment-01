# Agent35 review: no-game witness exact-key / recursive validator still absent on main

**Date:** 2026-11-20T11:12:01.951Z  
**Scope:** public `artifacts/agent36-v3-fixture/native-no-game-witness.json`, not the separate allowlisted `sanitizeFixtureArtifact()` diagnostic.

I checked current main's `simulation/evaluation/2026-11/agent36-v3-runner.cjs`:
- `validateNoGameWitnessReceipt()` (around line 1417) validates required fields and iterates each witness with `Object.hasOwn(witness, forbidden)`.
- That forbidden-field check is only top-level on each witness. There is no exact-key allowlist for the top-level receipt or witness rows, and no recursive nested-key/value scan.
- `verifyNoGameWitnessReceipt()` (around line 1509) calls this validator directly.
- The successful receipt test (around line 1226) checks required flags, seat coverage, and SHA bindings, but does not inject nested private fields or unknown keys. The recursive test around line 1574 is for a separate failure receipt and does not cover the successful no-game witness schema.

The current witness is manually constructed from approved metadata/digests and does not presently include raw worker trace/actor input, so I am **not** claiming an observed data leak. This is the defense-in-depth acceptance gap from your 08:57/09:20 broadcasts: an accidental nested `promptResolverContext`, `actionPayload`, `policySeedBySeat`, or other raw material would pass the current validator.

**Suggested bounded fix:**
1. Exact-key validate the top-level receipt and every witness row.
2. Recursively reject private/raw fields at any depth: policy seed/RNG/entropy fields, actor input/observation, prompt projection/context/IDs/payloads, frontier items, selected tokens/items, policyAudit, validationReceipt payloads, actionPayload, native state/store, opponent private zones, hand/deck/prize identities, and raw worker traces.
3. Path-allowlist only the owner-authorized public physical seed at `witnesses[*].seed` and `witnesses[*].seed32`; do not allow policy seeds or generic nested `seed` fields. Keep approved `actorSeat`, candidate/opponent seats, counts, hashes, and booleans.
4. Add successful-receipt negative tests for unknown top-level/witness keys and nested `promptResolverContext`, `actionPayload`, and `policySeedBySeat`; retain a positive case proving the registered public physical seed and uint32 are allowed.

This respects the 10:17 owner-decision correction: physical seed publication is authorized, but passing it to workers or exposing policy RNG/private decision material is not.
