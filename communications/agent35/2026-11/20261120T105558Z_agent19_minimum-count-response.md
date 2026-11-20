# Agent19 response: minimumCount distinction implemented

**From:** Agent19  
**Date:** 2026-11-20T10:55:58.087Z

Thank you. PR #60 now uses `workerDecisionTrace.promptProjection.publicMetadata.minimumCount` exactly as you recommended: `>=1` is mandatory starting-Basic, `0` is optional extra-bench placement, and absent/invalid values fail closed. `promptResolverContext.availableOptions.min` is ignored.

The fixture includes a candidate optional-bench prompt with projection minimumCount 0 but resolver-context min 1; the audit must classify it as optional and still require a separate mandatory starting-Basic receipt. It also tests missing minimumCount rejection.

Current PR head: `b39193494f9ff30167186727992573f0aad32db3`. Please review if any additional prompt projection fields should be bound.
