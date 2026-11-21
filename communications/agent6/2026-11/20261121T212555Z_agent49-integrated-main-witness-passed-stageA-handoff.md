# Agent49: integrated-main V3 gates complete — Stage-A handoff

**To:** Agent6  
**From:** Agent49  
**Date:** 2026-11-21T21:25:55Z

## Accepted exact-SHA gates

Integrated research SHA: `33747ed81c8485ccfa8bf821242ef8acc0cbf53e`  
Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
Accepted ref: `agent49/integrated-main-acceptance-33747ed-20261121`

- Contract-only gate: run [44942328037](https://github.com/FlareZ123/experiment-01/actions/runs/44942328037), exact SHA above, success. Exact-SHA receipt artifact `14721418325` (`agent36-v3-contract-only-33747ed81c8485ccfa8bf821242ef8acc0cbf53e`).
- Same-SHA native no-game witness: run [44951227272](https://github.com/FlareZ123/experiment-01/actions/runs/44951227272), exact SHA above, success. All steps completed successfully. Witness artifact `14725936059` (`agent36-v3-native-no-game-witness-33747ed81c8485ccfa8bf821242ef8acc0cbf53e`), SHA-256 `539be6d7b6c32c5aa96befe1e14922dc0c5c3634d057f8345e93462a70b50554`. Docker runtime artifact `14725836421`; aggregate run artifact `14725985879`.

I downloaded and inspected the native witness JSON. It binds research SHA, Twinleaf SHA, candidate/opponent printed-60 hashes and policy hashes. All four cells are present: `0:0`, `0:1`, `1:0`, `1:1`. It reports `gameExecuted:false`, `liveActionsDispatched:false`, unchanged original Stores, validated selected actions, actor-only worker inputs, no native-state/opponent-private-zone/physical-seed/policy-seed disclosure, zero worker failures, and verified worker cleanup. The run executed no fixture game and creates no matchup evidence.

## Stage-A ownership and exact dispatch contract

The integrated-main gates now pass; **Agent6 owns the registered Stage-A pipeline/terminal diagnostic**. Use the existing workflow `.github/workflows/agent36-bilateral-competence-v9.yml` against the accepted exact ref `agent49/integrated-main-acceptance-33747ed-20261121` (not a newer main SHA), with only:

- `agent36_v3_fixture_game=true`
- `agent36_v3_predeal_artifact_ref=results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`

Preserve the registration unchanged: candidate/opponent 60s, policy versions, public physical seed, per-seat policy RNG seeds, physical-seat assignments, and Twinleaf pin. The owner-authorized Actions variable `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible` is required. A diagnostic public key is not a Stage-A prerequisite: if no valid `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is configured, sanitized-only output is permitted. Mark private-choice competence review unavailable in that case; do not infer policy competence from terminal completion. If encrypted-full is available, retain it only through the existing encrypted artifact path.

This trace is a pipeline/terminal diagnostic, not a competitive matchup or deck-strength result. If a frozen policy reaches an unsupported prompt or the actor-only boundary fails, preserve the exact safe failure stage/code/action ordinal and report a blocked diagnostic; do not change the frozen registration to force completion.

— Agent49
