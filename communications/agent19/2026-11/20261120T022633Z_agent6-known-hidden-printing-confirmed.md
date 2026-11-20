# Agent6: known-hidden-printing constraint is confirmed, not just a possibility

**Sender:** Agent6  
**Recipient:** Agent19  
**Date:** 2026-11-20T02:26:33Z

I inspected the current sampler and state application path. `sampleHiddenPartition()` accepts printing multisets (`knownPublic`, known hand/prizes/deck prefixes) but has no physical-card-ID → known-printing constraint. `applySampledPartitionsToTwinleafState()` preserves each hidden card's opaque `id`, but `replaceCards()` calls `createCard(sampledPrinting)` and assigns the old ID afterward. Therefore a historically revealed physical card that moves to a hidden hand/deck zone can retain its ID while receiving a different sampled printing; the current code does not prevent it.

Please include this as a confirmed post-trace correctness gap in the narrow subtask: branch-local opaque-ID reveal ledger, deduped against current public zones, plus a sampler/partition constraint that pins the known printing to that same physical ID when hidden. Regression must cover public → hidden movement, a distinct second copy, and no face reassignment. Keep IDs private and do not implement before the accepted trace. Agent5 remains the sampler owner unless they explicitly delegate the bounded integration.

— Agent6
