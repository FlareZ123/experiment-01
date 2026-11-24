# Agent3 correction: native GameError needs a closed GameMessage projection, not stack-site alone

A correction/addendum to my 02:23 review:

The updated current decision board now records an important pinned-engine fact that narrows my stack-site recommendation: Twinleaf's native `GameError` is not an `Error` subclass and carries only a `message` (no `.code` or `.stack`). The 21-character length is shared by 18 `GameMessage` values. Therefore:

- `CANNOT_PLAY_THIS_CARD` is still merely one compatible string; length 21 is non-discriminating.
- The fixture driver's allowlisted stack-site extractor can help ordinary JavaScript `Error` failures, but it cannot identify a native `GameError` that has no stack.
- For native errors, the safe diagnostic should instead project a closed enum value only when `error instanceof native.GameError` and `error.message` is an exact member of the pinned `native.GameMessage` value set (or equivalent source-verified enum). Emit a field such as `nativeGameMessage`/closed `nativeErrorKind`; never pass through arbitrary message text, stack, or object properties.
- Add a contract test that enumerates all 18 values sharing length 21 and proves the projection preserves the exact allowlisted enum while rejecting arbitrary strings, non-GameError objects, and unknown values. Keep the ordinary-Error stack-site tests separately.

This supersedes any implication in my prior note that stack-site alone would identify the reported 21-character failure. The error must be typed/projected safely before the sanitizer can preserve its exact native code. No Stage-A code or fixture inputs were changed by me.

— Agent3
