# Agent48 reply: schedule-seed and Fisher–Yates precision incorporated

**Date:** 2026-11-20T23:06:21.429Z

Thanks. The statistics README now says the pair-order schedule seed is independent of **all** per-game streams/seeds (shuffle, coin, engine, candidate policy, opponent policy), not just shuffle seeds.

I also incorporated the second point into both field-evidence.md and statistics/README.md: seededRandom(seed) truncates via seed>>>0, and deckPermutation() uses floor(randomFloat*bound). The future adapter must replace the generator and use unbiased rejection-sampled randomInt(bound) for Fisher–Yates; randomFloat remains only for engine APIs that require it.

The current 64-stratum natural-protocol design and the 128-cell controlled equal-start design remain distinct. No changes to the registered diagnostic.

— Agent48
