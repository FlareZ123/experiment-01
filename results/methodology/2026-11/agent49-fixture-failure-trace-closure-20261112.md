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

The helper remains fixture-only. The full-state diagnostic snapshot is passed only through the top-level diagnosticSnapshot callback, not through role-policy options or the actor observation. This does not certify whole-policy information safety: the native Twinleaf Store state still enters the SimpleTacticsAi decoder, and the actor-only wrapper may fall back to the original native bot on unsupported/non-owner paths. The runner itself correctly labels whole-policy information safety as uncertified.

## Validation and limitations

- An isolated Node 22.16.0 reproduction of the two new failure paths passed 2/2 assertions. This checks the failure-row and snapshot logic in isolation; it is not execution of the repository's full test suite.
- The repository tests are already included in the existing manual .github/workflows/agent36-bilateral-competence-v9.yml V3 fixture test step. No workflow or automatic trigger was added.
- The repository's manual workflow and native fixture have not run for this change. The fixture remains blocked on the owner-provisioned AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM Actions variable and a dispatch-capable invocation. No native game, paper qualification, matchup result, fixed-deck selection or win-rate evidence is claimed.

## Next action

After the owner configures the public diagnostic key and dispatches the existing manual workflow with only agent36_v3_fixture_game=true, inspect the encrypted artifact offline. Verify the third attempted decision and failure-final snapshot on both relevant seats before using the trace to make general policy or simulator corrections.


## Runner integration correction

The first end-to-end review found a second failure-path defect in simulation/evaluation/2026-11/agent36-v3-runner.cjs. The fixture callback catches runNativeFixtureGame failures and returns {fixtureFailure, fixtureGamePartial} from inside the role-composed callback. The role composer then nests that envelope under its own result property. The runner previously checked only the outer object for fixtureFailure, mistook the nested envelope for the native game result, and wrapped it again as a NonTerminalFixtureGame failure. That left the actual decisionTrace nested one level too deep and caused the human-readable formatter to receive an empty trace.

Added normalizeV3FixtureRoleResult() to normalize direct runtime failures, role-composed failures, and successful role-composed games. The runner now unwraps the nested fixtureGamePartial while retaining candidate/opponent role audits. Added a regression to tests/2026-11/agent36-v3-fixture-game.test.cjs for direct failure, role-composed failure, and success shapes. This test file is already in the existing V3 fixture test list.

- Runner commit: 48ae131bf984f73c4da9c801aed2e4a2e173a820
- Regression commit: 950d2145e2dfd3de1add26ad3458df410a802f23
- An isolated Node 22.16.0 reproduction of direct, nested and success normalization passed 3/3 assertions.
- The repository test suite and native workflow remain unrun. The full private diagnostic artifact must still be checked after the owner provisions the public key and dispatches the manual workflow.


The runner normalization regression was strengthened to call the actual full-state trace formatter with the normalized partial artifact and assert that the third ACTION row, not-dispatched status, final full state, and failure section all appear in the text output. Test commit: 56a84b6075b69c2b7e62c3663748ab03e7119b6b. An isolated Node 22.16.0 reproduction of the formatter handoff passed 4/4 assertions. The repository's full node --test command remains unexecuted.
