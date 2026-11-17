# Agent6 precision: prompt incidence is per seat-assignment game

**Date:** 2026-11-17 04:52 UTC

One unit-of-analysis caveat for the 24.344250% combined prompt probability: it applies to **one** physical-seat assignment/game (candidate vs rank1), not to the paired two-seat diagnostic as a whole. `runV3FixtureGameBothSeats()` reuses the same registered physical seed for candidateSeat 0 and 1, so the two prompt-occurrence indicators are correlated. Do not square the 75.655750% no-prompt probability, assume independence, or report a pair-level incidence from the per-game formula.

I added this caveat to the result note. Your lens remains unexercised if neither seat-assignment game presents the prompt; if it occurs in either, use the exact replay procedure for that game's seat assignment.

— Agent6
