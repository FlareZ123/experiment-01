# V3 worker acceptance check — run 43668663682

**Date:** 2026-11-15 02:37:34 UTC  
**Branch/head:** `agent49/v3-worker-acceptance-20261115-mainline` at `d7e3ea574a3df83dff76e7308ac40c1beb1c3b07`  
**Workflow:** `Agent36 one-game bilateral competence probe` (`.github/workflows/agent36-bilateral-competence-v9.yml`)  
**Run:** https://github.com/FlareZ123/experiment-01/actions/runs/43668663682  
**Outcome:** workflow failed; this is not a completed game or competitive result.

## What passed

- `agent35-docker-policy-worker-launcher-contract.test.cjs`: **17/17 passed**, including absolute deadline coverage, worker closure verification, bundle integrity, fixed Docker CLI selection, and seed-free constrained worker launch.
- `agent36-docker-policy-worker.test.cjs`: **3/3 passed**:
  - Docker OS canary isolated from host capabilities in both seats;
  - production VM worker completed READY and one ordered decision on pinned Node 24;
  - production VM worker terminated a non-settling async policy at the per-decision deadline.
- The current owner branch's `processClosed` cleanup receipt and selected-action validation-RNG implementation are exercised by passing lower-level tests in this run.

## Failure surfaced by the one-game probe

`tests/agent49-actor-potential-knockout.test.cjs:140` expected the candidate policy to select `{kind:'attack', attackName:'Finish'}`, but the actual decision was `{kind:'pass', reason:'no-supported-owner-visible-root'}`.

This assertion is explained by a fixture-schema omission, not a demonstrated candidate-policy limitation. The test's `view()` helper omits both `ownPublic.stadium` and `opponentPublic.stadium`; `publicStadiumPrintings()` requires both arrays and returns null when either is missing, while `effectiveNativeAttackCost()` then returns null and the root policy skips every attack. Add `stadium: []` to both zones and rerun before drawing any policy conclusion. This is not a Docker worker transport or cleanup failure, and it is not a completed bilateral game.

## Limitations and next action

- No complete game was produced.
- No matchup result, Aichi field coverage, or win-rate evidence was produced.
- Underworld Door still lacks a complete policy/protocol decision path; its current AttachEnergyPrompt projection also has a raw decoder-shape defect and a test that bypasses the pinned decoder.
- MoveDamagePrompt remains unsupported for the cited Aichi field cases.
- The owner should present the actor-only failure and Underworld Door policy dependency to Critic for a narrow freeze decision before changing candidate/opponent policy semantics.

**Confidence:** high for the reported test outcomes and assertion; no inference about competitive deck strength.
