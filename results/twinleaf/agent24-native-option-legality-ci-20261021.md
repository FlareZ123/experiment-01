# Native mandatory-option legality gate: verified compiled regression

**Agent 24 | 21 October 2026 | rules/policy fidelity, not game-strength evidence.**

The previously pending [manual exact-printing feasibility run 39385597850](https://github.com/FlareZ123/experiment-01/actions/runs/39385597850) completed **successfully** on 20 October 2026 at source HEAD `309ca2f890c12a1f43c904b6d1beb2afafce57e5`. The run's head commit was `Agent 24: add native exact-source fail-closed prompt regression`. The existing manual workflow includes `tests/prompt-integrity.test.cjs` and `tests/mandatory-option-policy.test.cjs`; this is a compiled upstream-engine test run, not an inference from passing JavaScript mocks alone.

## Claim and falsification controls

The pinned upstream `Prompt.validate()` accepts any result. Both pinned `SelectOptionPrompt` and `SelectPrompt` inherit that implementation. The default `SelectOptionPromptResolver` returns `undefined`, so `SimpleTacticsAi` can supply `ResolvePromptAction(id, null)` even to a required option with `allowCancel:false`. On an actual `Guzma & Hala CEC` prompt, native Store advances without either printed mode after receiving the illegal null choice. This is an authentic paper-fidelity error in a real constructed Store and in previously archived complete source-dealt rank-2 games.

The additive `enforceSelectOptionLegality:true` flag is gated behind `strictPromptValidation:true` and rejects noncancelable null, noninteger, negative, out-of-range or disabled choices **before** native Store dispatch. Existing strict behavior and historical policies remain unchanged without this explicit flag. The separate `mandatoryOptionFallback:true` supplies an enabled default for required `SelectOptionPrompt` prompts. The exact rank-2/source rank-1 60-card regression with seed `20261021` and 90-root bound asserts:

1. Uncorrected bot + fail-closed validation **throws** at a genuine mandatory G&H choice.
2. Corrected both-seat fallback + identical fail-closed validation **advances past** that source-owned modal.
3. Pure controls cover valid indices, disabled choices, genuinely cancelable null, and unknown result types.

The pinned upstream source inspected independently at revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` confirms `SelectPrompt` and `SelectOptionPrompt` both expose `values:string[]` and `options.allowCancel`. The native simple bot has a resolver that chooses index 0 for `SelectPrompt`; the option-specific default resolver is a no-op. No `SelectPrompt` native invalid-choice exposure was established in this report.

## Integration boundary

This strict gate detects an invalid root. It **does not make the bot strategically competent**. The fallback chooses default option 0 and may miss Guzma & Hala's discard-cost mode 1 for Stadium + Special Energy + Tool. It does not repair later search/discard selection, hidden-hand scoring, timing of Energy attachment, source-side responses, paper KO semantics or tournament-clock play.

The real source-held rank-2 same-state 2/2 null-to-zero matched forks are documented in [the prior native report](agent24-rank2-matched-native-guzma-prompt-fork-20261020.md), with [compiled run 39384518007](https://github.com/FlareZ123/experiment-01/actions/runs/39384518007). Those had identical live Store ledgers up to the first changed prompt and confirm an actual causal game trajectory difference. The new stricter run asserts a legal-choice boundary; **neither result is a competitively qualified win**.

Until one frozen two-seat common policy enables and passes these gates within the canonical source-first comparison, do not promote historical `strictPromptValidation:true` alone as sufficient option legality coverage. Keep the gate explicitly versioned, off by default for archived control parity, and treated as a stop condition whenever it rejects an action.

**Field status remains 29/32 exact Aichi Top 32 source lists and zero competitively qualified games; the 99.5% win-rate objective is unverified.**
