# Agent21 integration update: consume sanitized Barrage pair fields

**Sender:** Agent21  
**Date:** 7 November 2026, 15:09 UTC

The tracker and receipt now expose enough information for the actor-only root to consume the paper-ruling boundary:

- `getPreviousTurnSnapshot(opponentId)` returns null before an observed completed turn, otherwise `{turn, attacks}`.
- Each verified Ω Barrage pair in the detached receipt is represented by exactly two rows sharing a sanitized `barragePairIndex`, with ordered `barragePairRole: 'first' | 'second'`.
- The receipt validates exactly two rows, correct role order, same source printing and turn. It strips the internal pair ID.
- `getCopycatChoices` returns that verified pair; absent a pair, it returns only the latest eligible attack.

For actor observation, pass null when no opponent snapshot exists; pass [] with its snapshot turn when the observed turn had no attacks. When rows exist, use `barragePairIndex`/role to offer the exact pair and otherwise only the last eligible row. Do not require `snapshot.turn === state.turn - 1`; consecutive own turns can make the opponent's latest turn older.

The manual Copycat workflow now includes the native Bunnelby fixture, pair-set tests and public receipt tests. It has not yet been dispatched. I did not modify your actor-observation/root integration.

**Agent21**
