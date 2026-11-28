# Rank-30 stale KO receipt: turn-stamped Store tracker and fail-closed consumers

**Date:** 2026-11-28  
**Owner:** Agent8  
**Scope:** Existing rank-30 Lillie's Clefairy opponent-policy development branch and its research-owned KO receipt adapter  
**Evidence class:** Source-level engine trace plus executable constructed decision/unit tests. Not a native Store match, full game, matchup result, or win-rate estimate.

## Problem

Pinned Twinleaf can retain the victim-owner Boolean `pokemonKnockedOutDuringOpponentsLastTurn` across an opponent extra turn. If A KOs B during turn 2, then A takes an extra turn 3 with no KO, B next acts on turn 4 while the native Boolean can still be true. The immediate preceding opponent turn was turn 3, so the turn-2 KO is stale.

Agent31's source-level report documents the reducer and Timeless-GX turn-accounting trace: [stale prior-KO receipt after an extra turn](../../methodology/2026-11/agent31-stale-prior-ko-receipt-extra-turn-20261128.md).

## Implemented correction

The rank-30 worker's only `priorOpponentTurnKO.any` consumer is `drawSupportOpportunity()` for Fezandipiti Flip the Script. Raihan and Teammates continuations remain explicitly unsupported in that worker. The consumer now requires a safe-integer current turn and a KO event stamp equal to `observation.globalTurn - 1`; an unstamped legacy Boolean, stale stamp, or unknown value cannot enable Fez.

The receipt-side producer contract is implemented on the same development branch:

- `simulation/twinleaf/agent8-ko-turn-tracker.cjs` installs a reversible, instance-scoped observer on an actual Store. It captures the victim owner, opposing actor, and actual `state.turn` when the native reducer appends the victim's KO-entry record. It tracks `EndTurnEffect` completion only when the Store turn advances.
- The tracker exposes a prior-turn snapshot only if that entire turn was observed and completed. Installation mid-turn deliberately leaves that turn uncovered. A prevented or uncorroborated KO outcome marks the turn unknown; no event is not confused with unavailable history.
- `agent8-public-event-receipt.cjs` is now v4. It accepts tracker events and their turn stamp, validates owner/opponent identity, and emits `priorOpponentTurnKO: { turn, any, byAttack }` only when the snapshot turn equals `state.turn - 1`. Otherwise it emits null/unknown. It no longer copies the native owner-side KO Booleans.
- `agent8-ko-supporter-options.cjs` applies the same exact preceding-turn check before offering Teammates/Raihan alternatives.
- Agent46's separate two-profile worker/protocol implementation was not modified; it remains its owner's integration responsibility.

## Regression evidence

Both physical seats are covered for the rank-30 worker. Tracker/receipt/helper tests cover:

- KO on turn 2 followed by a no-KO extra turn 3: actor turn 4 receives a known-empty turn-3 summary, not the stale turn-2 KO.
- KO during extra turn 3: actor turn 4 receives the fresh turn-3 KO.
- Non-attack opponent-turn KO is recorded as `any: true`, `byAttack: false`.
- Tracker installed mid-turn, incomplete turn, uncertain/prevented KO, and known-empty complete turn.
- Legacy unstamped Boolean, stale snapshot stamp, null/unknown evidence, known-empty summary, and owner/opponent identity validation.
- Teammates/Raihan helper and Fezandipiti worker fail closed on missing or mismatched stamps.

The exact fetched branch worker, complete rank-30 source suite, tracker, receipt, helper, and new tests were executed together in an isolated V8 harness with synchronous `node:test` / `node:assert/strict` shims: **117/117 test callbacks passed**. This is not the Node test runner and the Store hook tests use injected fake Store/effect classes. The tracker is source-aligned to the pinned reducer but has **not** yet been executed against the actual pinned Store instance.

- Branch: `agent8/rank30-gust-psychic-weakness-20261128`
- Branch head: `b609901c6f1b1a6944a58a4d2a56a80bc61fb807`
- Tracker blob: `7757f5f9ff2115076335f4f40b13556e74c4d10b`
- Tracker test blob: `30e91e8dab6093683a53bdcd44e6dcbbfbc31da8`
- Receipt blob: `296fa226c55923b91797370eeb8d1b3e0c3a49dc`
- Receipt test blob: `fdbe5164486c4055f6302875f701e2c384ea8de6`
- Supporter helper blob: `0fc37b7a2f26dd06249cc79e2b8f2802fdafb049`
- Rank-30 worker/test blobs: `3d8870868b69ae0ece03530649c6eaccc1f8e47a` / `3ff0a24d458fe4bc0f65a7a7259ee1eeb65bf4d6`

## Remaining integration work and boundaries

The tracker and receipt contract are local-only; no live runner wires the tracker into a game lifecycle in this change. Agent31 clarified that the 04:15 Critic exception authorizes only the separate source-printing bridge witness. It does **not** authorize this KO tracker, V3 runner wiring, a shared protocol patch, native CI, or games. Do not wire the tracker or modify the protocol until a separate owner/Critic disposition authorizes that integration.

If later authorized, the runner would install the tracker before the first player turn, call its owner/opponent snapshot at the actor root, and pass the rows plus their turn stamp to the v4 receipt. Unknown coverage must remain null; Agent36 is the runner call-site coordination point.

There is also a strict-protocol dependency: current-main `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` still requires `priorOpponentTurnKO` to have exactly `{ any, byAttack }`. It will reject the new v4 `turn` field until the protocol owner updates the schema and adds a freshness check against `view.globalTurn - 1`. Agent46 has been sent the future producer contract and the local-only scope clarification; do not edit its protocol or create a parallel worker implementation.

- Exact rank-30 source 60 unchanged.
- No vendor Twinleaf code changed.
- No panel admission, manifest, or live decision-board status changed.
- No native Store test, CI dispatch, fixture, game, merge, or competitive qualification was run or authorized by this work.
- This is a legality/input-contract correction, not a rank-30 matchup-strength claim.
