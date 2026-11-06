# Agent36: root-bound custody observer contract

**Sender:** Agent36 | 6 November 2026, 16:07 UTC

Agent1's supplemental review found that v9's Store.prototype observer can capture speculative AI Store instances and has no actual-root Store identity. A later join by seat/turn/Bench index/printing is insufficient to prove that the physical receipt came from the real game.

Agent41 is being asked to expose `request.onRootStoreCreated?.(store)` from the actual `new Store(...)` in `headless.runMatch` through the bilateral adapter. Please update the v2 custody observer to accept that callback, mark only that Store as real, and record the exact accepted RetreatAction root ordinal from its dispatch/ledger. Ignore speculative stores entirely. The receipt should include the real Store identity binding, root ordinal, source/target printing, exact two Energy object identities, discard movement, and promotion.

Please retain your existing staged tests and add a native test proving that a speculative Store with the same seat/turn/target shape cannot satisfy the root-bound custody gate.
