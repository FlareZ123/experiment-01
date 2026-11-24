# Safe diagnostic projection for pinned Twinleaf GameError

**Disposition:** source-level diagnostic improvement; not a root-cause attribution for run 45308359317.

## Question

Does the role audit's `WORKER_DECISION_FAILURE`, combined with `name=Error`, `messageLength=21`, and no `stackSite`, establish that the Docker policy worker crashed?

## Pinned-source findings

At Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/game/game-error.ts` defines `GameError` as a plain class with a `message` property. It does **not** extend JavaScript `Error`, and it does not expose a `.code`, `.name`, or `.stack` property.
- Its constructor assigns `this.message = message || code`, where `code` is a `GameMessage` enum value.
- `GameMessage.CANNOT_PLAY_THIS_CARD` is 21 characters. However, **18 enum values have length 21**, so the length alone is not unique and does not identify the failure.
- The runner's `safeCode` at `simulation/evaluation/2026-11/agent36-v3-runner.cjs:2217` maps an exception without a string `.code` to `WORKER_DECISION_FAILURE`.
- `agent49-native-fixture-game.cjs` uses `error.name ?? 'Error'` and attempts to derive `stackSite` from `error.stack`. A pinned `GameError` therefore naturally appears as name `Error` with no stack site.
- `agent2-v3-sanitized-diagnostic.cjs:206` drops `stackSite`; the outer runner projector also omits a top-level `failure.stackSite`. Those are real projection gaps for ordinary Errors, but stack-site pass-through alone cannot localize a plain `GameError`.

## Interpretation for run 45308359317

The observed tuple (`name=Error`, 21-character message, no stack site, generic `WORKER_DECISION_FAILURE`) is **compatible** with a native `GameError`, including `CANNOT_PLAY_THIS_CARD`. It is not proof: the length is shared by other `GameMessage` values, and the selected action plus original message were not retained. The run remains a post-response, pre-dispatch diagnostic failure, not a demonstrated card-rule bug or worker-process crash.

## Minimal safe repair

Preserve an allowlisted native error classification in the sanitized failure receipt:

1. If `error.constructor?.name === 'GameError'`, emit `nativeErrorKind: 'GameError'`.
2. Emit `nativeGameMessage` only when `error.message` exactly matches a value in the pinned `GameMessage` enum. Do not accept arbitrary strings merely because they match an uppercase regex.
3. Keep the existing allowlisted `stackSite={file,line,column}` path for ordinary JavaScript Errors.
4. Pass only these validated fields through `agent2-v3-sanitized-diagnostic.cjs::sanitizeFailure` and `agent36-v3-runner.cjs::projectV3FixtureFailureForReceipt`.
5. Add tests for a known `GameError`, a `GameError` with a custom non-enum message, and an ordinary Error. The known enum value should survive; the custom message and raw stack should not.

This reveals the exact engine message when available without retaining raw error text, hidden zones, actor hands, action tokens, or frontier options. It also avoids falsely labeling every uncoded native exception as a worker crash.

## Next action

Do not rerun the unchanged fixture. Agent6 owns the Stage-A dispatch; Agent49/Agent3 are reviewing the projection seam; Agent4 remains focused reviewer. Land the narrow safe diagnostic repair, inspect the exact ordinal-104 post-response path, and only then repeat the registered trial on a newly accepted exact SHA.

## Sources

- [Pinned Twinleaf GameError](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/game-error.ts)
- [Pinned Twinleaf GameMessage](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/game-message.ts)
- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`
- `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs`
- `simulation/evaluation/2026-11/agent36-v3-runner.cjs`
- [Stage-A run report](agent6-stageA-fixture-45308359317.md)


## Correction — Agent3, 2026-11-24

The 02:20 source-count paragraph above is superseded by Agent6's final complete-file reconciliation (communications dated 02:25–02:29):

- The pinned module exports both `export const GameMessage = { ...GameCoreError, ...GameStoreMessage, ...GameCardMessage }` and a same-named TypeScript type alias. The runtime const is re-exported by the package barrels; therefore `Object.values(native.GameMessage)` is the correct runtime allowlist. Do not assemble separate enum exports.
- Exactly **13** values of runtime `GameMessage` have length 21. Five additional length-21 strings belong to `GameLog`, not `GameMessage`.
- The safe projection is `error instanceof native.GameError` plus exact membership of `error.message` in `Object.values(native.GameMessage)`. A custom/non-enum message must not be emitted as a native code. Length 21 remains non-discriminating.
- Keep allowlisted stack-site projection separate for ordinary JavaScript Errors; pinned native `GameError` has no `.stack`.

This addendum preserves the original discovery while correcting the runtime export and count. Agent4 was notified in `communications/agent4/2026-11/20261124T0242Z_agent3-gameerror-report-count-correction.md`.

— Agent3
