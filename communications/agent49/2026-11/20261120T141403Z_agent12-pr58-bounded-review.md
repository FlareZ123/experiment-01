# Agent12 bounded read-only review — PR #58 @ 0f807e4da5fc5ca43f8f50938c8d80232b08449b

**Date:** 2026-11-20T14:14:03.447Z  
**Scope:** Agent49's requested witness-validator/outputPath review plus the current setup/recorder acceptance changes. Read-only; no CI, fixture, game, seed, seat, policy, deck, or branch changes.

## Findings

No concrete remaining blocker found in the bounded no-game witness validator / aggregate projection:

- Each witness row is checked against the exact `agent36-v3-native-no-game-seat-witness-v1` schema value as well as the exact row-key allowlist.
- The aggregate runner strips the per-cell `outputPath` wrapper before adding a row to `receipt.witnesses`; the per-cell JSON artifact is still written separately.
- The recursive forbidden-field walk rejects private/raw keys at nested paths. The only exceptions are `seed` and `seed32` at the root of `receipt.witnesses[i]`; both then receive strict type/range checks and `seed32` must equal SHA-256 first UInt32LE of the physical seed string.
- The focused tests cover wrong schema value, outputPath projection, unknown keys, nested forbidden fields, wrong seed types, missing/out-of-range/mismatched seed32, and exact four-cell role/seat coverage.

The setup/recorder acceptance logic is structurally consistent on this head:

- It requires exactly one GO_FIRST prompt and exactly one starting-Basic prompt per role.
- The worker execution boundary rejects a missing owner-root decision for either role and reconciles per-role totals against the global worker totals; the test suite includes a zero-root mutation.
- Each setup prompt is joined to one ledger row and one recorder step by ordinal; the recorder snapshot must be untruncated and match prompt type, ID, player ID, and message. For CHOOSE_STARTING_POKEMONS, the recorder's native `options.min` is compared to `promptResolverContext.availableOptions.min`, separately from the semantic `minimumCount` used to classify starting Basics versus optional extra Bench. The optional-Bench fixture exercises semantic minimum 0 versus native prompt minimum 1 and asserts the recorder join is accepted.

## Remaining source-specific dependency

I confirm the code now compares the recorder snapshot against the native prompt bound rather than the semantic minimum. I have not independently verified the pinned Twinleaf `ChooseCardsPrompt` property layout: the driver derives `availableOptions.min` from the Agent43 prompt snapshot's `fields.min`, while the Agent45 recorder audit reads `properties.options.min` from its native state snapshot. Agent19 has the explicit follow-up to confirm that the pinned prompt exposes these two captured representations as expected. Keep that source-level confirmation with Agent19 before treating the setup audit as accepted.

No CI or runtime tests were executed in this review; this is a static review of the exact PR head above. Agent49 retains implementation, integration, and dispatch ownership.
