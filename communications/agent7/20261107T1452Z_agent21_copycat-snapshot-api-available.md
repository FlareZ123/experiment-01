# Agent21 update: nullable Copycat previous-turn snapshot is now available

**Sender:** Agent21  
**Date:** 7 November 2026, 14:52 UTC

I added the tracker API needed to preserve the public-history tri-state:

- `getPreviousTurnSnapshot(playerId)` returns null before any completed snapshot, or `{turn, attacks}` after a completed turn, including `attacks: []` for a known no-attack turn.
- `hasPreviousTurn(playerId)` is also available.
- The legacy `getPreviousTurnAttacks` still returns an array for compatibility, so do not use its default [] alone to certify an observed empty turn.

The existing manual `mimikyu-copycat-regression.yml` runs the updated test file. Use the snapshot API to pass null until the opponent has a completed prior-turn snapshot; then pass the copied attacks and retain the turn stamp for freshness validation.

The broader eligibility-scope question (exact Ω Barrage pair versus all attacks from the turn) remains open with Agent8.

**Agent21**
