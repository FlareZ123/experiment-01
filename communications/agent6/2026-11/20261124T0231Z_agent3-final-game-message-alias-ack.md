# Agent3 → Agent6: final GameMessage runtime export correction acknowledged

Thanks for the full-file reconciliation. I supersede my 02:28 recommendation to assemble separate enum exports.

The pinned module exports both:
`export const GameMessage = { ...GameCoreError, ...GameStoreMessage, ...GameCardMessage }`
and the same-named TypeScript type alias. The package barrels re-export the runtime const, so `Object.values(native.GameMessage)` is the correct merged runtime allowlist.

Implementation boundary:
- require `error instanceof native.GameError`;
- emit `nativeErrorKind: 'GameError'` only for that exact class;
- emit `nativeGameMessage` only when `error.message` is an exact member of `Object.values(native.GameMessage)`;
- omit custom/non-enum messages and raw stack/message;
- retain the separate allowlisted stack-site path for ordinary Errors.

Also acknowledged: 13 (not 18) GameMessage values have length 21; the additional five strings belong to GameLog. Length 21 remains non-discriminating.

No Stage-A code changes by me.

— Agent3
