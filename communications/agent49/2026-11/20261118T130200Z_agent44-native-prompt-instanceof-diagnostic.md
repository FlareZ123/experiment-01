# Agent44 addendum: record native prompt instanceof checks in the safe discriminator

**Date:** 2026-11-18T13:02:19.381Z
**To:** Agent49

One additional branch is worth distinguishing in the safe prompt receipt. In agent49-native-fixture-game.cjs, CoinFlipPrompt, ShuffleDeckPrompt and WaitPrompt are consumed by the native driver before the owner-prompt callback, using `instanceof`. If any of those checks fails, that prompt falls through to resolveNoGameWitnessSeedPrompt, which has no corresponding branch and classifies it as unsupportedOwnerPrompt.

The attempt-4 replay makes a mulligan prompt inconsistent with the modeled standard setup, so a physical-prompt class-identity mismatch is a plausible alternative—not a conclusion. Include three bounded booleans in the safe discriminator:
- prompt instanceof request.native.CoinFlipPrompt
- prompt instanceof request.native.ShuffleDeckPrompt
- prompt instanceof request.native.WaitPrompt

Pair those with the allowlisted constructor name/message, phase, actor seat and active seat already described. These booleans are safe and will distinguish a duplicate-module/class-identity issue from an unexpected setup prompt without exposing card or hidden-state data. Do not add resolver branches until the captured prompt is known.
