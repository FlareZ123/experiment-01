# Agent4 final independent Stage-A disposition

**From:** Agent4  
**Time:** 2026-11-25T09:27:53Z  
**Reviewed SHAs:** `45176d531a08ae418993d07b396c746a9a83a08c` and `a6a17bd56644cdda74bf503d392157e85d2b7246`

**Disposition: NOT ACCEPTED** — `a6a17bd` is not accepted as Stage-A acceptance. The same-SHA gates passed, but the remaining privacy and stage-attribution gaps violate the authorized acceptance boundary. No new patch, workflow, dispatch, or fixture/game action is requested or authorized by this review.

## Exact-SHA evidence and correction

- `45176d5`: run #521 (`45566973269`) contract-only passed; run #522 (`45567130709`) four-cell no-game witness passed. The witness artifact is `15000203205`.
- `a6a17bd`: run #523 (`45568581626`) contract-only passed; run #525 (`45568830853`) four-cell no-game witness passed. The no-game witness artifact is `15001845740`; run #523 also produced the exact-SHA contract-only artifact `agent36-v3-contract-only-a6a17bd56644cdda74bf503d392157e85d2b7246`.

All four runs report `conclusion=success` and their `head_sha` exactly matches the SHA named above.

**Correction to the 09:14Z Critic status note:** `a6a17bd` is not CI-untested. It received both same-SHA gates on 2026-11-25 at 07:29:50Z and 07:31:40Z. This correction does not change the rejection below.

## What the post-gate delta fixed

The `45176d5..a6a17bd` delta replaces the three broad `SAFE_*_FAILURE_CODE_PREFIXES` filters with exact `SAFE_*_FAILURE_CODES` sets in the fixture, runner, and sanitizer. It adds the `NATIVE_PRIVATE_CARD_PIKACHU` negative canary and generic fallback assertions. This resolves the prefix-based card-name code leak identified in the 07:27 review. The earlier Agent2 note about prefix matching is superseded for `a6a17bd`.

## Remaining blockers at `a6a17bd`

1. **Public seed and deck/policy hash exposure remains.** `agent36-v3-runner.cjs` still includes `seed` and `seed32` in `NO_GAME_WITNESS_ROW_KEYS`; it also includes `policySha256`, candidate/opponent policy hashes, and candidate/opponent printed-60 hashes. `assertNoForbiddenNoGameWitnessFields` explicitly exempts physical seeds at witness rows, and `validateNoGameWitnessReceipt` requires and verifies both seed fields and the deck/policy hashes. The public no-game artifact therefore does not meet the 08:36Z requirement to retain only explicitly allowlisted non-hidden metadata.
2. **Candidate signature/dedup still lacks a tagged stage.** `agent36-native-action-frontier.cjs` is unchanged in the delta; `actionSignature(action)` and the `seen` operations remain before the per-candidate `try` (around lines 543–548). A malformed enumerator candidate can still fail without a safe stage.
3. **Runner-level frontier-admission coverage remains helper-only.** The production runner wraps the real `assertKnownCapFreeAdapterAdmissionClear()` call with `frontier-admission`, but the frontier test exercises `withSafeFrontierStage()` directly; no test injects a failure through the actual runner call and checks the projected receipt.
4. **The required nested failure-receipt regression remains absent.** The delta adds code-canary tests, not an end-to-end test asserting outer `failureStage === 'native-no-game-witness'` while nested `fixtureFailure.nativeFixtureFailure.nativeActionValidationStage` survives. The existing wrong-actor receipt test has no nested frontier stage; the separate projector test is not the requested end-to-end receipt.

## Evidence boundary

The successful gates establish the contract suite and four-cell no-game witness only. The witness asserts actor-only worker inputs, unchanged Stores, validated selected actions, closed workers, and no live dispatch. They do not establish a completed Pokémon TCG game, a competent policy, a matchup result, or any win rate. Neither SHA is competitive evidence.

**Disposition:** `a6a17bd` — **NOT ACCEPTED**. Stop the Stage-A diagnostic loop and seek owner direction. I have not changed the branch or dispatched any workflow.

— Agent4
