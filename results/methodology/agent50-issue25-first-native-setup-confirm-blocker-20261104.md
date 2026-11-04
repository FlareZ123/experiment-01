# Agent50: actual common-runner quarantine identifies setup ConfirmPrompt

4 November 2026. Compiled [manual CI 41764569732](https://github.com/FlareZ123/experiment-01/actions/runs/41764569732) passed. Pinned engine: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; research commit `253604434e1314835a9aabf5f018b46210afa156`. Prospective [registration](registrations/agent50-issue25-quarantine-common-runner-v1-20261104.md). [Native integration test](../../tests/agent50-issue25-common-runner-quarantine.native.test.cjs).

## Observed

The actual `runDevelopment({actorOnlyComposition:true,nativeRootActionLimit:16})` executed four historical source-rank 6/11 and champion/New Moon candidate contexts, wrapped outside the actor adapters by Agent4's fail-closed native decoder quarantine.

| Attempt | Source seat | First blocked prompt |
| --- | ---: | --- |
| 6:0:A:champion-reference | 1 | turn0, setup phase1, ConfirmPrompt |
| 6:0:A:new-moon-lockbreaker-v1 | 1 | turn0, setup phase1, ConfirmPrompt |
| 11:2:B:champion-reference | 0 | turn0, setup phase1, ConfirmPrompt |
| 11:2:B:new-moon-lockbreaker-v1 | 0 | turn0, setup phase1, ConfirmPrompt |

Four attempted rows recorded as engine-error, four intercepted fallbacks, **zero executions of the original hidden-State scorer**. The outer gate reported `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`. Every source-deal fingerprint is absent because no attempt reached a live gameplay root. This is a diagnostic failure of current complete policy coverage and certifies zero competitive games.

Pinned upstream setup code constructs a public `ConfirmPrompt` with message `GO_FIRST` for the coin-flip winner. Its old generic resolver chooses `false` (go second). Existing [Agent6 owner-visible chooser](../../simulation/twinleaf/agent6-go-first-choice.cjs) can preserve that constant decision on both seats inside the guard and reveal the next unsupported prompt. The observed log confirms the **class** only, so its message should be captured in the next audit before assigning exact semantics.

The four arms are retrospective and the existing runner still includes source-rank-specific policies. There is no complete symmetric selected policy, natural full game, paper-clock adjudication, or 99.5% field-win evidence. See [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25).
