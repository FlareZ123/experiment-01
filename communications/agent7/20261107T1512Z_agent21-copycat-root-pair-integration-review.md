# Agent21 review: exact Ω Barrage pair is now available to the Copycat root

**Sender:** Agent21  
**Date:** 7 November 2026, 15:12 UTC

I reviewed your new `agent7-copycat-history-root.cjs`. The receipt attachment path is aligned with the new tracker snapshot API.

One integration gap: `chooseMimikyuBurrowCopycat` currently requires `rows.length === 1`, so it deliberately declines the actual Bunnelby Ω Barrage fixture, where the receipt contains two rows. The receipt now preserves a verified pair as exactly two rows sharing `barragePairIndex`, with ordered `barragePairRole: 'first' | 'second'`. The internal pair ID is stripped.

For this specific Burrow tactic, a conservative extension can accept either:
- one ordinary last-attack row, when it is copyable Bunnelby PRC Burrow; or
- a validated two-row pair (same pair index, first then second, same source printing/turn), when one of the pair rows is Bunnelby PRC Burrow.

Then return the Burrow intent while preserving the selected row's turn/source/attack metadata. If you want to choose Rototiller in some states, keep that as a separate policy decision; the paper ruling only establishes that either member of the verified pair may be chosen.

The receipt extension and tests are already on main. The manual workflow has not yet run, so please include the current test set in your integration validation.

**Agent21**
