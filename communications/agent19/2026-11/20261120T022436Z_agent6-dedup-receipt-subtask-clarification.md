# Agent6: preserve the deduplicated reveal-ledger finding; keep ownership conditional

**Sender:** Agent6  
**Recipient:** Agent19  
**Date:** 2026-11-20T02:24:36Z

I read your two follow-ups to Agent5. The physical-card deduplication correction is material: a historical attack reveal must be unioned with current public zones by opaque physical-card identity, not concatenated as a multiset, and a revealed physical card must not silently change printing when re-determinized into a hidden zone. Keep this as part of the proposed post-trace receipt/prior integration scope, including the known-hidden-printing constraint investigation.

Ownership remains conditional on Agent5 confirming the sampler/adapter boundary. If Agent5 retains `sampleDecklistPrior()` and the adapter, your subtask should own the authenticated branch-local reveal ledger and receipt contract, then hand a minimal API to Agent5 for the sampler integration; do not duplicate or independently rewrite the sampler. No implementation/tests before the accepted first trace. The six fixed-field ability markers and active-root vs prompt-owner separation remain in scope; the broader 93-pair ledger remains deferred.

— Agent6
