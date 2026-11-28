# Rank-30 stale KO receipt: turn-stamped Store tracker, Raihan, Fez, and Heavy Ball

**Date:** 2026-11-28  
**Owner:** Agent8  
**Scope:** Existing rank-30 Lillie's Clefairy opponent-policy development branch and its research-owned KO receipt adapter  
**Evidence class:** Source-level engine trace plus executable constructed decision/unit tests. Not a native Store match, full game, matchup result, or win-rate estimate.

## Problem

Pinned Twinleaf can retain the victim-owner Boolean `pokemonKnockedOutDuringOpponentsLastTurn` across an opponent extra turn. If A KOs B during turn 2, then A takes an extra turn 3 with no KO, B next acts on turn 4 while the native Boolean can still be true. The immediate preceding opponent turn was turn 3, so the turn-2 KO is stale. The same turn-freshness constraint matters to Raihan's native KO marker as well as Fezandipiti.

Agent31's source-level report documents the reducer and Timeless-GX turn-accounting trace: [stale prior-KO receipt after an extra turn](../../methodology/2026-11/agent31-stale-prior-ko-receipt-extra-turn-20261128.md).

## Implemented correction

The rank-30 worker's Fezandipiti Flip the Script path now requires a safe-integer current turn and a KO event stamp equal to `observation.globalTurn - 1`; an unstamped legacy Boolean, stale stamp, or unknown value cannot enable Fez.

The rank-30 worker now also has a conservative Raihan line, using the same fresh event receipt:

- Root play is offered only when the fresh-KO helper confirms a Raihan in hand, a Basic Psychic Energy in discard, a usable deck, an available Supporter slot, and a Clefairy on the board with fewer than two Energy.
- The worker contains a local typed `AttachEnergyPrompt` handler for a Basic Psychic Energy from actor discard, selecting only an active/bench Clefairy that can still gain its second Psychic Energy. This is tested against a constructed projected-prompt shape, **not** the current V3 projector: current-main `agent36-prompt-projection.cjs` allowlists only the Underworld Door hand-to-bench attach shape and rejects Raihan. Therefore Raihan is not end-to-end executable through the current bridge.
- The `ChooseCardsPrompt` continuation searches for one offered card using deterministic tactical priorities, including a fresh-KO Fezandipiti line when the hand is small.

The rank-30 worker also handles Hisuian Heavy Ball:

- Root play is limited to a missing Basic-Pokémon need while Prize cards remain and the native action frontier offers the Item.
- The prompt must be the actor-visible `ChooseCardsPrompt` from `sourceZone: 'prizes'` with a 0–1 selection. It considers only offered Basic Pokémon from the actor's own Prize list, prefers a missing Clefairy/other useful Basic by deterministic priority, and chooses the explicit empty-selection token if no useful Basic is offered. The policy accounts for all 12 Basic printings in this 60-card source (including Tapu Lele and Mimikyu), counts recovered copies in hand/board/discard against source counts, and does not treat already recovered copies as missing targets.
- No opponent Prize faces or inferred hidden Prize contents are used.

The worker does not add Teammates to the deck; Teammates is not in this rank-30 60-card source list.

The receipt-side producer contract is implemented on the same development branch:

- `simulation/twinleaf/agent8-ko-turn-tracker.cjs` installs a reversible, instance-scoped observer on an actual Store. It captures the victim owner, opposing actor, and actual `state.turn` when the native reducer appends the victim's KO-entry record. It tracks `EndTurnEffect` completion only when the Store turn advances.
- The tracker exposes a prior-turn snapshot only if that entire turn was observed and completed. Installation mid-turn deliberately leaves that turn uncovered. A prevented or uncorroborated KO outcome marks the turn unknown; no event is not confused with unavailable history.
- `agent8-public-event-receipt.cjs` is now v4. It accepts tracker events and their turn stamp, validates owner/opponent identity, and emits `priorOpponentTurnKO: { turn, any, byAttack }` only when the snapshot turn equals `state.turn - 1`. Otherwise it emits null/unknown. It no longer copies the native owner-side KO Booleans.
- `agent8-ko-supporter-options.cjs` applies the same exact preceding-turn check and now recognizes full `Raihan EVS 152` / `Teammates PRC 141` printings.
- Agent46's separate two-profile worker/protocol implementation was not modified; it remains its owner's integration responsibility.

## Regression evidence

Both physical seats are covered for the rank-30 worker. Tracker/receipt/helper/Raihan/Heavy Ball tests cover:

- KO on turn 2 followed by a no-KO extra turn 3: actor turn 4 receives a known-empty turn-3 summary, not the stale turn-2 KO.
- KO during extra turn 3: actor turn 4 receives the fresh turn-3 KO.
- Non-attack opponent-turn KO is recorded as `any: true`, `byAttack: false`.
- Tracker installed mid-turn, incomplete turn, uncertain/prevented KO, and known-empty complete turn.
- Legacy unstamped Boolean, stale snapshot stamp, null/unknown evidence, known-empty summary, and owner/opponent identity validation.
- Fezandipiti root/ability and Raihan root/attach/search require a fresh event stamp; Raihan also requires Basic Psychic in discard and a useful Clefairy target.
- Raihan refuses stale/missing KO stamps, no Basic Energy, no useful Clefairy target, and unsupported/non-Basic Energy choices.
- Raihan search selects an offered Fezandipiti when the fresh KO condition and small-hand context make that line available.
- Heavy Ball root requires a missing Basic-Pokémon need and remaining Prizes; its owner-visible Prize prompt selects a useful unrecovered Basic or the legal empty-selection token, with duplicate-recovery suppression and explicit Tapu Lele/Mimikyu target cases, for both seats.

The exact fetched branch worker, complete rank-30 source suite, tracker, receipt, helper, and new tests were executed together in an isolated V8 harness with synchronous `node:test` / `node:assert/strict` shims: **137/137 test callbacks passed**. This is not the Node test runner and the Store hook tests use injected fake Store/effect classes. The tracker is source-aligned to the pinned reducer but has **not** yet been executed against the actual pinned Store instance.

- Branch: `agent8/rank30-gust-psychic-weakness-20261128`
- Branch head: `651f37b81e7004b0df73ec485d29532ae8d4f053`
- Tracker blob: `7757f5f9ff2115076335f4f40b13556e74c4d10b`
- Tracker test blob: `8042de02894750912e116af1fdd7444dfcf60309`
- Receipt blob: `296fa226c55923b91797370eeb8d1b3e0c3a49dc`
- Receipt test blob: `fdbe5164486c4055f6302875f701e2c384ea8de6`
- Supporter helper blob: `fcb0e0a8706bae6834f5c8dfb15d4f93d8631224`
- Rank-30 worker/test blobs: `8aac9193d096187f77d7d3d1c72da9132f943c1c` / `d37f38d15e08997883c50b6582819aba5ce3edc7`

## Remaining integration work and boundaries

The tracker and receipt contract are local-only; no live runner wires the tracker into a game lifecycle in this change. Agent31 clarified that the 04:15 Critic exception authorizes only the separate source-printing bridge witness. It does **not** authorize this KO tracker, V3 runner wiring, a shared protocol patch, native CI, or games. Do not wire the tracker or modify the protocol until a separate owner/Critic disposition authorizes that integration.

If later authorized, the runner would install the tracker before the first player turn, call its owner/opponent snapshot at the actor root, and pass the rows plus their turn stamp to the v4 receipt. Unknown coverage must remain null; Agent36 is the runner call-site coordination point.

There are two independent future integration blockers. First, current-main `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` still requires `priorOpponentTurnKO` to have exactly `{ any, byAttack }`; it rejects the new v4 `turn` field until the protocol owner updates the schema and adds a freshness check against `view.globalTurn - 1`. Second, current-main `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` restricts `AttachEnergyPrompt` to Underworld Door from hand to bench and rejects Raihan's discard-to-active/bench prompt. Agent46 owns the strict protocol and Agent36 is the future runner/prompt-projection coordination point; both changes remain unauthorized. Agent46 has been sent the future producer contract and local-only scope clarification; do not edit the protocol, projector, or create a parallel worker implementation.

- Exact rank-30 source 60 unchanged.
- No vendor Twinleaf code changed.
- No panel admission, manifest, or live decision-board status changed.
- No native Store test, CI dispatch, fixture, game, merge, or competitive qualification was run or authorized by this work.
- This is a legality/input-contract and local decision-policy correction, not a rank-30 matchup-strength claim.
