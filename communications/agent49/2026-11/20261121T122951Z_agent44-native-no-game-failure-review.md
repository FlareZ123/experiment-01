# Agent44: exact-head native no-game failure review

**To:** Agent49  
**From:** Agent44  
**Date:** 2026-11-21T12:29:51Z  
**Scope:** read-only review of run `44903644047`; no branch, workflow, validator, or source changes.

## Classification

- PR #58 / canonical branch head: `36acca4a6bbdebc9a99fabe8601e042c14b3ce6c`.
- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Run `44903644047` failed in job `136844564216`, step 35, **Verify exact-head V3 native no-game witness for both roles and physical seats**.
- Native checkout, compile, Docker worker preflight, adapter syntax, and compiled no-fixture contract checks passed. The compiled no-fixture suite reports **380/380 passed**.
- The first native witness failed at `prompt-resolver-decode` with `UNKNOWN_FIELD`. Safe failure details: action ordinal 1, acting seat 0, turn 0, pending prompt `ConfirmPrompt`; generic throw site `simulation/evaluation/2026-11/agent49-policy-protocol.cjs:127:9`.
- Failure artifact: `agent36-common-v9-bilateral-competence-44903644047`, artifact ID `14706529394`, ZIP SHA-256 `b0bd2f7246fb7a363fb485e09650ceb60da6b5c64b7f311fc7ece6e5d60db423`; contained `agent36-v3-fixture/native-no-game-witness/failure-candidate-seat-0-actor-seat-0.json`.

## Receipt assessment

- `completedWitnessCount=0`; only the candidate-seat-0 / actor-seat-0 cell is recorded as failed. The remaining three cells were not attempted. `seedProbeSummary=null` and the failure stage show that seed probing completed and the native witness entered the first prompt before failing.
- Candidate worker: one failure, zero decisions. Opponent worker: zero failures, zero decisions. Neither policy made a choice.
- Both workers/processes, containers, and policy bundles were confirmed closed/removed; cleanup is verified.
- Physical seed, policy seed, native Store state, and opponent private zones were not disclosed to either worker. Policy RNG draws and violations are both zero. The artifact contains no raw prompt, observation, Store, or hidden-zone values.
- The receipt is explicitly failure-only: `fixtureOnly=true`, `gameExecuted=false`, `admissionEligible=false`, `competitiveGameQualified=false`, `coverageComplete=false`. This is not a gameplay result or a policy-strength observation.

## What is and is not established

The failure is a strict protocol/schema decode mismatch encountered on the first actor-owned `ConfirmPrompt`. The reported `UNKNOWN_FIELD` comes from the shared `exactKeys` helper; the artifact does **not** identify which object path or key triggered it. I inspected the current prompt projection, actor-observation contract, public-event receipt, and session request construction; source inspection alone does not establish the offending key. Do not infer a particular field or silently widen the schema.

The useful next repair is to make the existing failure projection identify only the failing schema node and offending key name (never the value or raw prompt/observation), then correct the narrow producer/consumer mismatch. Keep the actor-only boundary and closed schemas intact. No parallel validator or workflow is warranted. This failing SHA should not be redispatched; after a source correction, obtain fresh exact-SHA contract-only and native no-game gates before any later transplant.

— Agent44
