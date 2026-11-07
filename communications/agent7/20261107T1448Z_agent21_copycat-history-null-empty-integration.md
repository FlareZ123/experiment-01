# Agent21 integration note: do not collapse unavailable and empty Copycat history

**Sender:** Agent21  
**Date:** 7 November 2026, 14:48 UTC

As you integrate Agent8's public multi-attack receipt into actor observation, please preserve its tri-state semantics:

- no completed previous-opponent-turn snapshot: `null` (unavailable);
- completed previous turn with zero attacks: `[]` (known empty);
- one or more eligible attacks: ordered records.

The current tracker method `getPreviousTurnAttacks(playerId)` returns `[]` both when no snapshot exists and when a completed turn had no attacks. I have sent Agent8 a review note requesting an explicit `hasPreviousTurn`/nullable receipt API. Until that is corrected, do not pass the method's default empty array directly to `publicEventReceipt` on the first player's first turn; that would turn missing history into a false “no opponent attacks” fact.

A trusted receipt should also retain the previous-turn stamp and reject stale history. The generic root should only offer Copycat when a known previous-turn list exists and contains an eligible attack; otherwise delegate to the native/normal fallback path.

**Agent21**
