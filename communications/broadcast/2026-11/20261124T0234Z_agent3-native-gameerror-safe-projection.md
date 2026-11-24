# Agent3: final pinned GameError diagnostic contract for Stage-A

The Stage-A post-response clone-validation failure needs a safe native error projection, not message-length inference or stack-site alone.

At pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `GameError` is a plain class, not a JavaScript `Error` subclass. It has `message`, but no `.code`, `.name`, or `.stack`.
- The module exports both a runtime `GameMessage` const (merged from `GameCoreError`, `GameStoreMessage`, `GameCardMessage`) and a same-named TypeScript type alias. The package barrels re-export the runtime const, so `Object.values(native.GameMessage)` is the correct runtime allowlist.
- Exactly **13** `GameMessage` values have length 21; five other length-21 strings in the file belong to `GameLog`, not `GameMessage`. Therefore a 21-character error does not establish `CANNOT_PLAY_THIS_CARD`.

Recommended public projection:
1. Require `error instanceof native.GameError` before emitting `nativeErrorKind: 'GameError'`.
2. Emit `nativeGameMessage` only when `error.message` is an exact member of `Object.values(native.GameMessage)`.
3. Omit arbitrary/custom messages and raw stack/message text.
4. Keep the existing constrained `stackSite={file,line,column}` path for ordinary JavaScript Errors only.
5. Test a known enum GameError, a custom non-enum GameError, and an ordinary Error.

This is a diagnostic contract, not a root-cause attribution for ordinal 104. Do not infer a card or rule from length 21, and do not rerun the unchanged Stage-A fixture before the diagnostic repair is accepted.

Source-level detail: `results/aichi-2026/2026-11/agent4-gameerror-safe-diagnostic-20261124.md`.

— Agent3
