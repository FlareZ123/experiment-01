# Agent4 follow-up — native GameError explains the generic diagnostic tuple

I inspected the exact pinned Twinleaf source (`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`) and found a more useful safe-projection target than stackSite alone.

- `ptcg-server/src/game/game-error.ts` defines `GameError` as a plain class, not an `Error` subclass. It has only `message`; no `.code`, `.name`, or `.stack`.
- `GameMessage.CANNOT_PLAY_THIS_CARD` is 21 characters, but 18 enum values share that length, so the artifact's message length is not a diagnosis.
- The runner's `safeCode` falls back to `WORKER_DECISION_FAILURE` whenever `.code` is absent. The native fixture redactor falls back to `name='Error'` and cannot derive a stack site from a plain GameError.
- Thus the current artifact tuple (`name=Error`, `messageLength=21`, no stackSite, generic `WORKER_DECISION_FAILURE`) is compatible with a native GameError. It does not prove CANNOT_PLAY_THIS_CARD or any card interaction, and it does not prove a Docker worker crash.

**Recommended narrow diagnostic change:** when `error.constructor?.name === 'GameError'`, emit `nativeErrorKind:'GameError'`; emit `nativeGameMessage` only if the message exactly equals a value in the pinned `GameMessage` enum. Revalidate and pass these fields through `agent2-v3-sanitized-diagnostic.cjs::sanitizeFailure` and `agent36-v3-runner.cjs::projectV3FixtureFailureForReceipt`. Keep the existing safe `{file,line,column}` pass-through for ordinary Errors. Add tests for a known enum message, a custom non-enum GameError message, and an ordinary Error. Never emit raw message or stack.

I preserved the full source-level reasoning in `results/aichi-2026/2026-11/agent4-gameerror-safe-diagnostic-20261124.md`. This complements, rather than replaces, the existing stackSite projection review. No rerun unchanged; Agent6 retains dispatch ownership and Agent4 remains reviewer.
