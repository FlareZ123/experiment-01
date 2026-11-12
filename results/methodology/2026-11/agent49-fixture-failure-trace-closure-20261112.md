# Failure-inclusive native fixture decision traces

**Date:** 12 November 2026  
**Owner:** Agent49  
**Scope:** simulation/evaluation/2026-11/agent49-native-fixture-game.cjs and its existing unit tests.

## Problem

The fixture loop retained the accepted-action prefix when a native Store dispatch failed, but it did not count or append a decision whose policy or owner-prompt decoder threw before a native action existed. Such failures therefore disappeared from decisionTrace and rootActionLedger, and the trace omitted the exact pre-decode observation/prompt context.

A second defect made finalFullState reuse the previous successful action's fullStateAfter. That is not a fresh failure-time snapshot and can hide a mutation made by a decoder before it throws.

## Changes

- Create one mutable attempt record at the start of each loop iteration and preserve that same record while advancing through snapshot, observation, prompt/policy decode, trace preparation and dispatch stages.
- Capture owner-prompt metadata and available options before invoking the prompt decoder; capture the actor observation and its digest before invoking the root policy decoder.
- If a failure occurs before the attempt has entered the trace, append exactly one dispatchStatus='not-dispatched' row to decisionTrace and a matching row to rootActionLedger. Preserve null actionName / failedAction when no action was decoded. Avoid duplicating rows already recorded before a dispatch failure.
- Capture a new failure-final full-state snapshot on every failure, even when an earlier trace row has fullStateAfter. Attach it as the failed attempt's post-failure snapshot when the attempt had not been dispatched.
- Normalize an interrupted trace row that was appended but had not yet reached dispatch to not-dispatched.

## Regression coverage

tests/2026-11/agent49-native-fixture-game.test.cjs now checks:

1. A root-policy decoder mutates a diagnostic discard field and throws after two accepted setup actions. The partial artifact must report two accepted actions, three attempted decisions, a third not-dispatched row, the exact actor observation and pre-state, the mutation in a fresh failure-time snapshot, and no decoded failedAction.
2. A native owner-prompt decoder throws. The partial artifact must preserve the prompt identity, message and available options captured before decode.
3. The existing native dispatch-failure test remains intact and continues to distinguish a decoded-but-rejected action from a pre-decode failure.

The helper remains fixture-only. No full private state is passed to either policy; it is captured only through the outer diagnostic callback.

## Validation and limitations

- An isolated Node 22.16.0 reproduction of the two new failure paths passed 2/2 assertions. This checks the failure-row and snapshot logic in isolation; it is not execution of the repository's full test suite.
- The repository tests are already included in the existing manual .github/workflows/agent36-bilateral-competence-v9.yml V3 fixture test step. No workflow or automatic trigger was added.
- The repository's manual workflow and native fixture have not run for this change. The fixture remains blocked on the owner-provisioned AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM Actions variable and a dispatch-capable invocation. No native game, paper qualification, matchup result, fixed-deck selection or win-rate evidence is claimed.

## Next action

After the owner configures the public diagnostic key and dispatches the existing manual workflow with only agent36_v3_fixture_game=true, inspect the encrypted artifact offline. Verify the third attempted decision and failure-final snapshot on both relevant seats before using the trace to make general policy or simulator corrections.
