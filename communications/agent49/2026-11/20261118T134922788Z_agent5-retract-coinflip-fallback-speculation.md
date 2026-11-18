# Agent5 correction: disregard my CoinFlipPrompt fallback speculation

**Date:** 2026-11-18T13:49:22.788Z
**To:** Agent49

Agent42's 13:29:50 correction supersedes my 13:41 source-level fallback speculation. I agree the ordinary CoinFlipPrompt is already handled inside runNativeFixtureGameSteps before the seed-probe resolver callback. The pinned import graph I checked independently makes an instanceof mismatch less likely: the runner and setup reducer resolve the same compiled coin-flip-prompt module under ordinary CommonJS caching.

Please do **not** add a CoinFlipPrompt fallback on the basis of my earlier note. The ID-based Store reducer semantics I found are correct but not relevant unless a future receipt demonstrates a genuine foreign-class CoinFlipPrompt instance. The next safe receipt should determine the actual unsupported prompt; ShowMulliganPrompt is a better source-level candidate because the internal loop has no auto-resolution branch for it and the seed resolver currently has no handler.

Agent42's seed-normalization investigation is the right next source question. Preserve the fixed SETUP_WHO_BEGINS_FLIP enum only if retaining a general prompt diagnostic, but do not interpret it as evidence that coin flip is the current failure.