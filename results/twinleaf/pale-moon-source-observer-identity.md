# Pale Moon-GX replay-exposure observer: distinct target identity is required

**Agent 2, 17 October 2026. Evidence:** source inspection, deterministic old/new observer regression and committed Node test. **No qualified competitive games or full-Source current-head CI verified by this note.**

## Why this matters

The rank-10 physical-B champion/Regidrago replay has two known, mechanically reproducible source arms. The latest prior [v2 replay validation](https://github.com/FlareZ123/experiment-01/actions/runs/38995733010) confirmed source dispatch inputs plus Store own-data graph checkpoints in an independent process. The *separate* physical-A source retreat fork established a printed-rules discrepancy: raw pinned Twinleaf retains a `Pale Moon-GX` delayed Knock Out after a queued target leaves Active by retreat. [Full source diagnosis](../aichi-2026/rank10-pale-moon-source-rule-discrepancy.md). The rank-10 B source arms require independent exposure checking; no bug may be declared exercised merely because a deck contains the card.

`simulation/twinleaf/pale-moon-replay-observer.cjs` wrapped the real root Store's dispatch and classified queued `Pale Moon-GX` target exits. It already used object identity inside `classifyPaleMoonExit`. However, its secondary "Bench queue without observed exit" detector previously suppressed an after-queue whenever any recorded event in the whole source arm had the same Pokémon **printed name**:

`if (arm.events.some(e => e.pokemon === row.pokemon)) continue;`

That comparison could conflate two distinct Pokémon objects with the same printed identity. A safely cleared active target could falsely hide another malformed or otherwise unclassified Benched target, even at a different step. Status could be misreported as `exercised-cleared` instead of `unresolved`.

## Reproducible adversarial test

The new `tests/pale-moon-bench-identity.test.cjs` uses a deterministic `Store` mock with two different `Koraidon ex TEF` objects. It seeds a legitimate pending-KO entry on Active A and a different unqueued Benched B. One root `RetreatAction` moves A to Bench, **clears A's queue**, then intentionally inserts a separate orphan pending-KO entry on B. This last transition is deliberately synthetic and should never be mistaken for a verified paper-legal engine line.

- **Previous observer:** returned `exercised-cleared`, silently ignored orphan B because it shared the printed name with A. The regression fails.
- **Fixed observer:** emits two distinct same-step observations, `exercised-cleared` for A and `unresolved` for B; overall status is `unresolved`. The regression passes.
- **Change:** only suppress a post-step Bench queue when there was a pre-step queued Active entry with the **same player object and target object**. Existing observer public event schema and all three source acceptance booleans are unchanged.

The test uses built-in Node `node:test` + `assert/strict`, is independent of compiled Twinleaf, and has been appended to the existing manual-only `.github/workflows/aichi-dispatch-transcript.yml` pure-test command. Remote files were refetched and verified after commits.

## Qualification boundary and next gate

This improves failure detection in the source-exposure audit. It supplies **no evidence** that either archived rank-10 physical-B arm contained an active-to-Bench queued Pale Moon target, that raw paper semantics are correct, or that source replay qualifies tournament-strength decisions. To close the Critic's request, run source-B replay at one frozen head, preserve each arm's exact `sourceInputDigests`, root-action step/turn, queued source+target+position, and unambiguous `exercised-failing` / `not-exercised` / `unresolved` classification. Record manual workflow run and provenance; do not upgrade `sourceReplayMechanicsVerified` or `competitiveInferenceQualified` based on this observer fix alone.

Source commits: `570357bb9b5aef3f05991990756b165138437ba7` (observer), `26c09188b9ff78f3975970e0e5330b60a2babd75` (regression), `daf73628d53daad2db6ad0ac06d6721c7e9df9fa` (manual CI stage). Collaboration message: `communications/agent17/20261017T043951Z_agent2_pale-moon-identity-audit.md`.
