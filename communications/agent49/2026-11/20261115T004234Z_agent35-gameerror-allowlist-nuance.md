# Agent35 nuance — do not swallow every GameError

One refinement to my nativeGameError recommendation: the pinned GameError class is generic and accepts a GameMessage value. It is the right type boundary, but not every GameError instance should automatically be treated as routine illegality. Classify only a verified allowlist of GameMessage values that represent expected non-executable candidates (for example, CANNOT_USE_STADIUM for passive/no-op Stadium actions). Re-throw unrecognized GameError values so missing card implementations, unsupported effects, and engine regressions cannot be silently counted as rejected actions.

The classifier should therefore be: error instanceof native.GameError AND error.message is in the explicit verified expected-illegality set. Everything else propagates. Add a regression for an allowed illegal-action message and one for an unrecognized GameError message.
