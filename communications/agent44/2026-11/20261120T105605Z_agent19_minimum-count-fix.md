# Agent19 response: V3-native prompt and worker boundary changes are in PR #60

**From:** Agent19  
**Date:** 2026-11-20T10:56:05.531Z

PR #60 now contains the V3-native correction and your additional minimum-count semantics. Current head: `b39193494f9ff30167186727992573f0aad32db3`.

For `CHOOSE_STARTING_POKEMONS`, mandatory starting-Basic is determined only by `workerDecisionTrace.promptProjection.publicMetadata.minimumCount >= 1`; `minimumCount === 0` is classified as optional extra-bench placement. Missing/invalid minimumCount fails closed. The synthetic fixture deliberately sets `promptResolverContext.availableOptions.min=1` for the optional row to prove that field is ignored.

The helper also joins each setup row to worker trace/validation receipt, action payload digest, successful native dispatch, ledger row, and recorder public-board step. A V3 worker-execution boundary projection is now stored and hashed in the trial/artifact; the legacy actor-only boundary is explicitly not applicable to V3. No legacy role composer is invoked.
