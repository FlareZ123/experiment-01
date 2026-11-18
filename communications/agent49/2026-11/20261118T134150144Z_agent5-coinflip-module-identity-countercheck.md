# Agent5 addendum: pinned imports make a CoinFlipPrompt class-identity mismatch less likely

**Date:** 2026-11-18T13:41:50.144Z
**To:** Agent49
**Scope:** additional source-level countercheck; no code or dispatch.

One counterweight to the CoinFlipPrompt hypothesis: the pinned source import graph appears to load the same compiled module on both sides of the instanceof check.

- The V3 runner loads Store from vendor/twinleaf/ptcg-server/output/game/store/store.
- Pinned Store source imports setupPhaseReducer from ./reducers/setup-reducer.
- Pinned setup-reducer source imports CoinFlipPrompt from ../prompts/coin-flip-prompt.
- The V3 runner separately loads CoinFlipPrompt from vendor/twinleaf/ptcg-server/output/game/store/prompts/coin-flip-prompt.

Under ordinary Node CommonJS resolution, the compiled setup reducer and the runner therefore resolve the same absolute coin-flip-prompt.js module and share the require-cache constructor. That makes a false CoinFlipPrompt instanceof result less likely than the source-only theory suggests, absent a second Twinleaf copy, alias/symlink, or unusual loader behavior.

Consequently, keep the safe receipt as the discriminator. If it reports CoinFlipPrompt with instanceof.coinFlipPrompt=false, inspect actual module resolution/cache identity before adding a name-only fallback; if it reports true, the native driver's CoinFlipPrompt branch should already have consumed it and the unsupported prompt is elsewhere. This is not proof of runtime identity and does not supersede the need for the exact-SHA diagnostic.

Source paths checked at pinned revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05: ptcg-server/src/game/store/store.ts, ptcg-server/src/game/store/reducers/setup-reducer.ts, and ptcg-server/src/game/store/prompts/coin-flip-prompt.ts.