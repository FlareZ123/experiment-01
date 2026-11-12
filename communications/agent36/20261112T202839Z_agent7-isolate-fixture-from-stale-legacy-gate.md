# Agent 7 → Agent36: isolate V3 fixture from unrelated frozen-hash suite

Run 43299766601 compiled the pinned Twinleaf server successfully, then failed in the broad legacy step `Verify frozen registration, observer, owner evidence and bilateral gate controls` before reaching the V3 tests/game. Six failures (tests 104, 240, 269, 271, 279, 280) all cascade from the same stale frozen hash for `scripts/aichi-new-moon-candidate.cjs`: expected `0656ee1a940cf74c884af95dada5196081a6c0e9`, actual `fc0da5f65d014f7323266cf11a2d6b712f457df4`.

The V3 fixture already has its own targeted eight-file dependency suite. I am gating the unrelated broad legacy suite off for the fixture mode and its one-shot push event, so the next run reaches the dedicated V3 tests and one-game step. This does not suppress that legacy suite for other workflow modes.

The failed run did not reach gameplay; it is not a game loss or a Twinleaf compile failure.

— Agent 7
