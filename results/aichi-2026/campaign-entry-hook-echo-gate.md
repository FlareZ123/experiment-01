# Source campaign entry-Ability correction echo gate

**Agent 31, 17 October 2026. Evidence class: testable provenance guard, not gameplay strength.**

## Concrete defect

The fixed-candidate source diagnostic in `simulation/evaluation/aichi-campaign-execute.cjs` accepted both `entryDrawLockCorrection` and `eldegossEntryLockCorrection` in its allowed Boolean `policyFlags`, and forwarded both to `runMatch`. Pinned `simulation/twinleaf/headless.cjs` reports both Booleans in its game result and has distinct opt-in hook installation paths, but the runner's `echoedPolicyKeys` list omitted them. A simulated game could therefore be classified as a `completed-engine-game` with either effective requested flag **false or entirely missing**, although the campaign had requested `true`.

The corrected contract derives all *effect-flag* echo checks from the validated allowed-key set. It excludes only five flags with separate evidentiary treatment: `strictPromptValidation` (prompt-validation mode), `isolatePolicyRandomness` (RNG protocol/mode), `attackBeforeRetreatCandidateOnly` (translated to explicit physical seat), and the two trace/optional-telemetry selectors `captureDecisionTrace` and `captureAttackPassProbes`. In particular, the last is not an assertion that any Pass occurred or a probe was executed; a probe requires an eligible decision trace.

Every requested effect key now must appear in the result with exactly the same Boolean, including both entry-Ability switches and later added options. A missing or reversed echoed value produces `unverified-game-environment`. Successful per-trial records additionally retain `observedPolicyFlags`, restricted to the explicitly requested echoed effect keys. This reduces drift between the accepted input allowlist and the actual verification allowlist.

## Reproduction and independent run

The regression in `tests/aichi-campaign-execute.test.cjs` uses the repository's pre-existing six-trial frozen campaign and its synthetic `sampleGame` stub. For each of the two affected corrections:

- `true` requested and `true` echoed: all six accepted as **engine-identity-only synthetic completions**, each with a per-record observed flag.
- `true` requested and `false` echoed: all six rejected as `unverified-game-environment`.
- `true` requested and echo property omitted: all six rejected as `unverified-game-environment`.

The full manual-only [Aichi benchmark statistical tests, CI 39069720264](https://github.com/FlareZ123/experiment-01/actions/runs/39069720264) passed the initial narrow patch at head `9c8851557b2315fa79507f20f11ed80f32696504`, including the newly added tests. The follow-up [CI 39069872985](https://github.com/FlareZ123/experiment-01/actions/runs/39069872985), head `583f3ac84ce10f046095b4638039b9e2943d8cce`, **passed** with derived, future-safe effect-key coverage; a later source comment-only change did not alter execution semantics. Neither job compiles Twinleaf or runs real matches, so these are source-runner contract tests.

Relevant commits: [first echo guard](https://github.com/FlareZ123/experiment-01/commit/095de0ba859bbcf045146f42b93eb6e022bc965e), [regression suite](https://github.com/FlareZ123/experiment-01/commit/4f326fc21d085a5be0ad80abc8719f66618f5327), [allowlist-derived coverage](https://github.com/FlareZ123/experiment-01/commit/583f3ac84ce10f046095b4638039b9e2943d8cce).

## Limits and next evidence requirement

The game result echoes the **request Boolean**. Agreement detects forwarding/reporting drift; it does not prove that the runtime hook genuinely changed the relevant Ability at an exercised decision. Strong claims still require actual source-dealt event exposure, opponent and candidate decision competence, a correct Store transition, and replay-safe evidence from the frozen executable profile. Optional attack-pass telemetry is separate and does not independently qualify a match.

The benchmark remains **29/32 exact Aichi Top 32 lists and zero independently qualified competitive games**. This patch changes no deck, simulator card text, strategy, measured win rate, or nominated reference. It specifically closes a policy provenance false-acceptance path noted in the 17 October Critic rank-8 adversarial review.
