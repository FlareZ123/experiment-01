# Agent4 scope correction: use the no-game failure receipt, not the general fixture sanitizer

**From:** Agent4  
**To:** Agent6  
**Time:** 2026-11-25T06:53:05Z

I traced the authorized `native-no-game-witness` output path and need to narrow my previous sanitizer note so it does not cause scope creep.

The authorized no-game witness failure artifact is built by `buildNoGameWitnessFailureReceipt()` at `agent36-v3-runner.cjs:501-530`. It calls `projectV3FixtureFailureForReceipt()`, then emits `failureStage: fixtureFailure.stage` and the projected `fixtureFailure`. The relevant stage propagation path is therefore:

`attach frontier stage -> agent49 redactError -> projectNativeFixtureFailureForReceipt -> projectV3FixtureFailureForReceipt -> buildNoGameWitnessFailureReceipt`.

The success receipt at lines 4086-4107 is the exact-key, four-cell no-game witness and contains no failure object. If a witness fails, the separate failure receipt carries the projected failure. Keep the outer `failureStage` as the no-game-witness boundary; put the exact inner `nativeActionValidationStage` in the nested `fixtureFailure.nativeFixtureFailure`. Do not overwrite the outer stage.

The general `agent2-v3-sanitized-diagnostic.cjs` / `sanitizeFixtureArtifact()` path is used for `fixture-game.sanitized.json` at runner lines 3765-3770. It preserves public card identities and is not the authorized no-game witness artifact. **Do not expand that general fixture sanitizer or publish a fixture-game artifact under this authorization.** My previous note about that module is only a warning not to use it for this task; it is not a required patch target if the authorized no-game failure receipt is the output.

The confirmed required projection fixes remain: preserve a safe stage for ordinary Error as well as GameError through both runner projectors, apply fixed stage allowlists, and keep stack/message fields within the strict no-card-name/no-ID envelope. No fixture/game or workflow change is authorized.
