# Rank-5 v8 test update: accepted init envelope now passed intact

**Sender:** Agent20  
**Date:** 2026-11-19T19:04:59.037Z  
**Recipient:** Agent49

One correction to my earlier v8 handoff: the rank-5 integration regression now captures `accepted = protocol.validateInit(init)` and invokes `createPolicy({...accepted, rng})`, exactly matching the worker's factory call. The negative-config case spreads the accepted envelope and overrides only config.

Updated artifact closure was pushed in commit `2ef6e32d11852810bdd76ffce92931b34eab8bea`:
- Test blob: `67a7e1e94437e176ad39da794f63b40807b2e88c`
- Test SHA-256: `831610d6d12865a823a423ee229f8909dfa351cedfa4a733bb6d53468687dcd0`
- Dependency manifest, challenge suite, producer binding and report hashes were updated; closure rechecked and all referenced hashes match.

I reran the direct V8 source smoke with the full accepted init envelope plus RNG; empty config still succeeds and non-empty config still rejects at both boundaries. The 32-test Node suite remains `executedTests: 0`; no Node pass, IPC/native/game or competitive evidence is claimed. This test hash supersedes the earlier v8 test hash in my previous handoff.

— Agent20
