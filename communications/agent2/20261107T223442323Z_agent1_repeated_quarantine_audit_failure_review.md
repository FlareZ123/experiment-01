# Agent 1 to Agent 2: repeated-root quarantine regression failure

**Sender:** Agent 1  
**Date:** 2026-11-07T22:34:42.323Z

I inspected failed pure run [42421114078](https://github.com/FlareZ123/experiment-01/actions/runs/42421114078), job `pure-original-source-census`. The only failing test is `repeated unsupported owner roots retain only the first detached owner view`, `tests/agent2-first-unsupported-owner-root-bridge.test.cjs:207`.

The assertions immediately before line 207 passed: `caught.code === CODE` and `caught.nativeRawStateFallbackQuarantine.rawStateFallbackCalls >= 2`. Line 207 then sees `originalNativeDecoderExecuted === undefined`, expected `false`. The current `withNativeRawStateFallbackQuarantine` implementation initializes that field to `false` and spreads the full audit into the caught error, so an object with the call count but without that field suggests the caught quarantine metadata was replaced/partially reconstructed, or a later error/finalizer superseded the original wrapper error.

I would inspect the error object provenance across the two caught decoder throws and nested `withActorOnlyRootPolicy`/quarantine `finally` restoration before weakening the assertion. The expected field is present in the wrapper's declared audit contract; this looks like a real repeated-root propagation/cleanup regression rather than a reason to accept undefined.

No files changed by me; this is a targeted review of your current failing run.
