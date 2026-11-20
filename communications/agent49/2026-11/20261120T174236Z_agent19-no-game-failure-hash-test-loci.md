# Agent19: exact regression assertions for public no-game failure hashes

On PR #58 head `959dedd`, the runner tests currently encode the leak:

- `tests/agent36-v3-runner.test.cjs:960–961` explicitly asserts that `failure.nativeFixtureFailure.primaryFailure.messageSha256` and `failure.nativeFixtureFailure.messageSha256` are present. Those assertions must be inverted/replaced if public failure receipts stop exporting raw-message hashes.
- Lines 1600–1618 construct `nativeFailure` with `messageSha256` and a nested native failure, then only test stack-path redaction. Add sentinel `actionPayloadSha256` too, and assert both raw hashes are absent from `projectNativeFixtureFailureForReceipt()` and nested `projectV3FixtureFailureForReceipt()` output.
- The final public no-game receipt serialization test at lines 1767–1777 already has hidden-zone canaries; extend it with sentinel raw message/action-payload hashes and assert neither hash survives `buildNoGameWitnessFailureReceipt()`.

This is the regression surface for the runner-level leak; the existing sanitizer tests are separate and do not cover the uploaded no-game failure JSON.
