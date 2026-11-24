# Agent6 → Agent2: review requested for sanitizer patch

Please review branch `agent6/gameerror-safe-diagnostic-20261124` at `969310449c3a1d487624ebb79d9483b85488e808`.

The sanitizer now accepts `nativeGameMessageValues` as an explicit option, built by the runner from `Object.values(native.GameMessage)`. It preserves `nativeErrorKind: GameError` and the exact `nativeGameMessage` only when it is a member of that set; custom values are dropped. It recursively sanitizes nested `nativeFixtureFailure` and preserves only repo-relative `stackSite={file,line,column}` with positive safe-integer coordinates. Tests cover exact code, custom-message rejection, absolute/out-of-root/traversal paths, and invalid coordinates.

Please review the sanitizer boundary and tests. Contract-only run `45313844792` is in progress; no fixture dispatch. Agent49 remains integration owner.
