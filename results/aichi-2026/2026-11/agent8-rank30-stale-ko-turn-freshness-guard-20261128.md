# Rank-30 Fezandipiti guard: require a turn-fresh KO receipt

**Date:** 2026-11-28  
**Owner:** Agent8  
**Scope:** Existing rank-30 Lillie's Clefairy opponent-policy development branch  
**Evidence class:** Executable source-worker decision regression in an isolated V8 harness. Not a native Store match, full game, matchup result, or win-rate estimate.

## Problem

Pinned Twinleaf can retain the victim-owner Boolean `pokemonKnockedOutDuringOpponentsLastTurn` across an opponent extra turn. If A KOs B during turn 2, then A takes an extra turn 3 with no KO, B next acts on turn 4 while the native Boolean can still be true. The immediate preceding opponent turn was turn 3, so that turn-2 KO is not valid evidence for Fezandipiti ex's Flip the Script.

Agent31's source-level report describes the reducer and Timeless-GX turn-accounting trace in detail: [stale prior-KO receipt after an extra turn](../../../methodology/2026-11/agent31-stale-prior-ko-receipt-extra-turn-20261128.md).

## Rank-30 consumer audit and correction

The rank-30 worker does not currently implement Raihan or Teammates continuations; its source explicitly abstains from those unsupported routes. Its only consumer of `priorOpponentTurnKO.any` is `drawSupportOpportunity()`, where the value can cause the worker to bench or activate Fezandipiti.

On branch `agent8/rank30-gust-psychic-weakness-20261128`, the worker now centralizes the condition in `hasFreshPriorOpponentTurnKO(request)`:

- require a safe-integer `observation.globalTurn > 1`;
- require `publicEventReceipt.priorOpponentTurnKO.any === true`;
- require the KO event's own `turn` stamp to equal `observation.globalTurn - 1`.

A legacy Boolean without an event-turn stamp, a mismatched/old stamp, or null evidence cannot enable Fez. The worker does not infer a KO turn from the receipt's current acting-turn field.

## Regression evidence

The existing rank-30 test suite now covers both physical seats:

| Current actor turn | KO-event turn | Expected |
| --- | --- | --- |
| 4 | 3 | Fez may be selected: the KO occurred during the immediately preceding opponent turn |
| 4 | 2 | Fez is not selected: a no-KO extra turn 3 intervened |
| 4 | absent | Fez is not selected: legacy unstamped Boolean is unknown |
| 4 | 3 with `any: null` | Fez is not selected: event evidence is unknown |

The exact branch worker and complete source test file were executed together in an isolated V8 harness with synchronous `node:test` / `node:assert/strict` shims: **102/102 test callbacks passed**. The test execution is against the actual fetched worker and test source, but it is not the Node test runner and does not execute pinned Twinleaf Store code.

- Branch head: `fb28b96fabcf793692429b20787b11cfac10b2a1`
- Worker blob: `3d8870868b69ae0ece03530649c6eaccc1f8e47a`
- Test blob: `3ff0a24d458fe4bc0f65a7a7259ee1eeb65bf4d6`

## Important remaining producer gap

The shared `simulation/twinleaf/agent8-public-event-receipt.cjs` currently emits `priorOpponentTurnKO: { any, byAttack }` from native Booleans and does **not** emit an event-turn stamp. Therefore this consumer guard intentionally abstains when paired with that legacy producer; the positive test uses a constructed, correctly stamped event receipt. A real integration still needs a research-owned Store event tracker that records KO events against actual `state.turn`, exposes only the actor-appropriate prior-turn summary, and fails closed when coverage is unavailable. Do not treat the new worker guard as proof that the producer or strict protocol is complete.

Agent31 was notified of the rank-30 change and asked to coordinate the receipt-side tracker/schema before any overlapping integration is attempted. Agent46's separate two-profile worker/protocol ownership remains untouched.

## Boundaries

- Exact rank-30 source 60 remains unchanged.
- No vendor Twinleaf code was modified.
- No source-list admission, panel manifest, or live decision board status changed.
- No native CI, Store test, fixture, game, merge, or competitive qualification was run or authorized by this work.
- This is a narrow consumer-side safety correction, not a rank-30 matchup-strength claim.
