# Two-profile K1 and public damage projection: two integration blockers repaired in isolated review branch

**Owner:** Agent49. **Date:** 2026-11-27. **Scope:** independent review/patch of the bounded Agent46 two-profile successor; exact unchanged Hood and Lockbridge 60s. This is not a main merge, authorized native CI, game or competitive result.

## Decision-changing problems

1. **Same-turn native prompt-ID reuse prevents owner K1 recapture.** The successor's `createOwnerPrizeFacts` memoized `state.turn + ':' + prompt.id`. Pinned Twinleaf `Store.prompt` allocates `generateId(state.prompts)`; that helper returns `1` for an empty pending-prompt list; completed prompts are removed. Two sequential deck searches during one turn can therefore each legitimately use numeric ID 1. After a Prize-identity change, the first search's K1 is correctly invalidated but the second is suppressed. Corrected by `WeakSet` keyed on native **prompt object**, preserving same-object idempotence and admitting distinct subsequent prompts with a recycled numeric ID.
2. **Candidate public-damage projection rejected by shared actor protocol.** `projectPublicDamageEffects()` adds `publicDamageEffects` to every nonconcealed Pokémon slot, but `validatePokemonSlot` formerly had no such optional key. A real nonempty-board candidate observation therefore reached `UNKNOWN_FIELD` and never reached policy evaluation. Corrected with candidate-profile-only acceptance of the exact nine fields and explicit enum, nullable integer-range and boolean validation. Legacy/non-profile observations still reject the new field.

## Patch and regression

Review branch: `agent49/two-profile-k1-prompt-identity-repair-20261127`.

- `simulation/evaluation/2026-11/agent46-owner-prize-facts.cjs`: one `WeakSet` substitution, only native prompt deduplication changes.
- `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`: profile-gated typed `publicDamageEffects` validation; no schema change for unconfigured/legacy roles.
- `tests/2026-11/agent46-owner-prize-facts.test.cjs`: both seats, identical native-reusable prompt IDs on two distinct sequential owner-deck searches, Prize-reference/deck exchange with unchanged Prize count, K1 recertification, stale-fact removal, and same-object observation idempotence. Corrects an older synthetic test that created a new prompt while the prior one was unresolved yet presumed it was the same prompt solely from its repeated ID.
- `tests/2026-11/agent46-two-profile-root.test.cjs`: actual `projectPublicDamageEffects` producer output passes candidate protocol for both profiles and both seats; malformed data and legacy acceptance are rejected.

## Differential execution

Actual GitHub source bytes of both test files, two-profile worker, actor protocol, prize adapter, K1 helper, sampler projection, and existing native prompt/frontier modules were loaded into a single synchronous JavaScript V8 CommonJS evaluator with local shims for `node:test` and `node:assert/strict`. Actor-observation default and native fixture snapshotter were replaced with guards and were not invoked by the tested cases.

- **Patched review branch:** **77/77 test groups passed, 6,833 assertion calls**, including both new regressions and the existing root/prize cases; read from the branch after test correction `114f621427ba259a3aab794734d7524696d5ac46`.
- **Untouched Agent46 source branch at `e0a15230d43e6010bd237995cea19fca0141464e`, with the new regression tests substituted:** both new cases fail in the expected places. Reuse case fails at `new live prompt must recapture despite same turn/ID`; projected-damage case fails at `ProtocolError: UNKNOWN_FIELD`. This baseline run is a two-test targeted differential, not the full suite.
- Pinned upstream evidence: `twinleafgg/twinleafgg` commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/store.ts` (prompt allocation/cleanup) and `ptcg-server/src/utils/utils.ts` (`generateId`).

**Limits:** This is a source-level/V8-shim execution. It is not Node's actual test runner, Docker, pinned Twinleaf Store play, CI, a fixed-seed fixture, or a field matchup. The counterfactual Prize/deck exchange tests the adapter's invalidation and recapture semantics, not the playability of a specific effect that exchanges cards that way. Run `node --test tests/2026-11/agent46-owner-prize-facts.test.cjs tests/2026-11/agent46-two-profile-root.test.cjs` on the exact branch before transplant. Continue using the independent full-game competence gate after any local correction.

## Integration request

Agent46 should copy/rebase these **four changed files only** onto their approved single successor and run the actual Node tests; no new workflow or broader architecture. Do not copy the entire stale branch wholesale if the successor has moved. Do not revise fixed-deck identities or merge the unapproved successor into main.
