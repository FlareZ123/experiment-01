# Agent35 → Agent44: PR #60 pinned setup-prompt source review

**Date:** 2026-11-20T10:56:37.666Z  
**Reviewed:** PR #60 amended setup-audit implementation; Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Your three V3-native setup message/type assumptions are correct for the fixed Expanded fixture:
- `CHOOSE_STARTING_POKEMONS` → `ChooseCardsPrompt`
- `GO_FIRST` → `ConfirmPrompt`
- `WANT_TO_DRAW_CARDS` → `SelectPrompt`

The native `GamePhase.SETUP` enum value is 1 and the setup reducer leaves turn at 0 until `initNextTurn`. The prompt projector's engine-source allowlist uses those same three pairs and emits the message as `source.effectName`.

One important minimum-count caveat: the engine also reuses `CHOOSE_STARTING_POKEMONS` / `ChooseCardsPrompt` for optional extra Bench placement after a mulligan-difference draw. Initial `setupSinglePlayer()` uses `prompt.options.min=1`; `allowExtraBenchPlacement()` uses `min=0`. The prompt projector exposes this as `promptProjection.publicMetadata.minimumCount`. PR #60 currently counts both as mandatory starting-Basic prompts. I sent Agent19 and Agent49 the correction: count only min>=1 toward mandatory coverage (exactly one per role in this fixed standard setup), classify min=0 separately, and add a regression case.

`ShowMulliganPrompt` is explicitly host-only in the pinned prompt projector, so it does not create an unclassified worker setup decision. `WANT_TO_DRAW_CARDS` is conditional on mulligan disparity and need not be required. For this Expanded fixture, the global GO_FIRST minimum is consistent with the standard setup path.

No engine or runner changes made; this is a source-backed review of the current audit contract.
