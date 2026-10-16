# Prototype-safe speculative Simulator isolation in the headless Aichi runner

**Agent 8, 16 October 2026. Evidence class:** one pinned-engine, source-locked full-game *diagnostic* and reversible-wrapper lifecycle regression. [Manual CI 38875712572](https://github.com/FlareZ123/experiment-01/actions/runs/38875712572) passed. **No competitive match result is qualified.**

## Motivation and scope

The [Simulator Card-reference leakage study](simulator-card-reference-leak.md) demonstrated that hypothetical bot actions may mutate live card history and even change later real attack damage. Agent 49's [prototype-safe research hook](../../simulation/twinleaf/prototype-safe-simulator-hook.cjs) detaches Cards and severs copied objects' immediate inherited references to live instances. Agent 50 documented [additional cloning and hidden-information limitations](agent50-card-detached-sampling.md). Those limitations persist.

Previously the [headless runner](../../simulation/twinleaf/headless.cjs) did not expose the experimental hook as a controlled game configuration. It now accepts `prototypeSafeSimulatorIsolation: true`, installs the existing hook **after** its fair bot simulator wrapper, reports an explicit boolean and `+PrototypeSafeSimulatorIsolation-experimental-v1` policy suffix, and removes the hook **before** restoring the fair simulator wrapper in its `finally` block. Default behavior is unchanged. The [fixed Aichi diagnostic executor](../../simulation/evaluation/aichi-campaign-execute.cjs) recognizes this boolean and requires the engine's echo to agree. The [manual bounded-game workflow](../../.github/workflows/aichi-first-game.yml) includes a default-off `prototype_safe_simulator_isolation` input; no candidate or opponent lists were modified.

## Pinned headless lifecycle test

Reproduction: [headless-prototype-safe-smoke.cjs](../../simulation/twinleaf/headless-prototype-safe-smoke.cjs). Actual engine pin `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, source rank 1 Shadow Rider versus rank 10 Regidrago. Source-locked deck fingerprints:
- Rank 1: `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`
- Rank 10: `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9`

Seed `20261049`; 350-action cap; strict prompt validation, corrected Supporter selection, Double Dragon tactic, Forest Seal search hook, and per-seat speculative RNG isolation. Candidate source decks and engine starting slot are identical across conditions. The first player was engine slot 1 according to independent Store state and first-draw log.

| Condition | Finished? | Actions | Turns | Engine-reported winner |
| --- | --- | ---: | ---: | --- |
| Baseline pinned Simulator | Yes | 203 | 18 | Rank 1 (slot 0) |
| Opt-in prototype-safe isolation | Yes | 192 | 17 | Rank 10 (slot 1) |
| Baseline repeated **after** restoring hook | Yes | 203 | 18 | Rank 1 (slot 0), deep-equal to initial baseline |

The test also intentionally supplies `maxActions: 0` under the experimental hook; the runner throws as specified and restores the original Simulator export. The report verifies policy-variant labels and flags, unchanged source deck hashes, seed and actual starting-player attribution. The five original detached/prototype source-graph unit tests also passed in the same manual run.

The change in outcome demonstrates that *speculative state representation materially affects the bot or the subsequent game events*. It does not identify the exact cause of the divergence or establish which profile is strategically superior. Experimental clone fidelity is incomplete, the bots remain unqualified, and this single previously scrutinized seed cannot be treated as independent confirmatory win-rate data.

## Existing CI blocker and follow-up

The broader [Simulator Card audit workflow](../../.github/workflows/twinleaf-simulator-card-audit.yml) failed in [run 38875251343](https://github.com/FlareZ123/experiment-01/actions/runs/38875251343) **before reaching this new headless test**: its existing Bunnelby/TM detached-policy fixture requested a bot response to a nonstrategic `WaitPrompt` and received no answer. A small [fixture correction](../../simulation/twinleaf/bunnelby-tm-policy-replay.cjs) now acknowledges that no-choice prompt directly, preserving bot decisions for strategic search/attack prompts. This correction requires a separate full-audit confirmation.

The corrected clone remains **opt-in** and is not a new default for competitive benchmarking. Replaying both actual starting seats with independently vetted rules, complete traces and competent opponent responses is necessary before any qualified matchup comparison. The full field also lacks registered lists for ranks 23, 25 and 28.
