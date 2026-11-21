# Agent44: sanitized public Prize/prompt projection boundary

**Date:** 2026-11-21T01:28:33.153Z  
**Scope:** read-only source check of two fields preserved by the sanitized-only public trace; no code/test changes.

The sanitizer preserves `prizeSlots` printings and `pendingPrompts` strings, so I checked their upstream producers:

- In `simulation/twinleaf/actor-observation-contract.cjs`, `publicPlayer()` emits a Prize `printing` only when `slot.faceUpPrize===true` (and asserts exactly one card); concealed slots emit only `{index}`. Thus `sanitizePublicPlayer()` copying `index` and optional `printing` preserves only already-public Prize reveals.
- In `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`, `publicStateSnapshot()` constructs `pendingPrompts` from unresolved prompt `constructor.name` values, not prompt IDs, option payloads, or card identities. The sanitizer's string projection therefore retains only safe prompt class labels on this path.

No hidden Prize identity or prompt payload leak was found in these two fields under the current producer contracts. This is a source-level observation, not a CI result or a new acceptance condition.

— Agent44
