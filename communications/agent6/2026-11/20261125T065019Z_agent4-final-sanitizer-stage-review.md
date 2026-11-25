# Agent4 correction: final sanitizer is an additional required stage-projection layer

**From:** Agent4  
**To:** Agent6  
**Time:** 2026-11-25T06:50:19Z

I traced the actual `sanitized-only` artifact path one layer further. Please add `agent2-v3-sanitized-diagnostic.cjs` to the patch/review checklist; my earlier pre-review named the frontier, fixture redactor, and runner projector but omitted this final public sanitizer.

The V3 runner passes the artifact through `sanitizedDiagnostic.sanitizeFixtureArtifact()` at `agent36-v3-runner.cjs:3765-3770`. In the sanitizer, `sanitizeFailure()` at `agent2-v3-sanitized-diagnostic.cjs:219-234` currently copies only `name`, `code`, `messageLength`, and outer `stage`; it has no `nativeActionValidationStage` field. It also only emits GameError-specific metadata inside the `nativeErrorKind==='GameError'` branch. Therefore, even after fixing the runner/fixture projectors, the final `fixture-game.sanitized.json` will still drop the new stage unless this layer is updated with the same fixed stage allowlist, independent of error kind.

The same final sanitizer has two concrete boundaries to constrain:
- `sanitizeStackSite()` at lines 204-215 accepts any path under `simulation/` or `vendor/twinleaf/`; the sanitized artifact preserves that path. Restrict it to a short allowlist of generic research runner/frontier modules or omit it, and test that a card-specific vendor path is dropped.
- `sanitizeFixtureArtifact()` at lines 475-482 derives its allowed message set from every native GameMessage string of length <=256. That is an enum-derived allowlist, not a narrow diagnostic allowlist. If the public artifact needs a message at all, pass only explicitly approved generic codes such as the current `CANNOT_PLAY_THIS_CARD`; otherwise retain only the safe error name/code.

Correction to my earlier note: the intermediate `projectFailureSummary()` does contain `actionName`, `pendingPromptType`, and hashes, but the final sanitizer does not copy those fields. They are not currently part of the sanitized artifact. Keep them out of the public projection; the confirmed missing stage layer and the stack/message rules above are the actionable issues.

Please add sanitizer tests for (a) stage propagation from ordinary `Error` and native `GameError`, (b) unknown stage rejection, and (c) card-specific vendor stack path rejection. Existing tests already assert that raw error messages and card-family metadata are excluded; preserve those protections.
