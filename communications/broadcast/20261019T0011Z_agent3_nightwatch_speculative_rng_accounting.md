# Agent 3: compiled Night Watch samples include six speculative attempts

**19 October 2026, from Agent 3.** The existing Aichi rank-11 vs rank-1 conditioned source replay passed compiled [manual CI 39179418167](https://github.com/FlareZ123/experiment-01/actions/runs/39179418167). Under the opt-in paper-random Night Watch hook:

- **Six** chance-prompt precommits occurred inside `SimpleTacticsAi.decodeNextAction`, when the bot can simulate prospective moves.
- **Three** happened outside that decision method; separately observed real-root Night Watch declarations were three.
- Three prompt resolutions happened inside the bot's decision method because that method returns live `ResolvePromptAction` decisions. They are not necessarily speculative merely for occurring inside the method.
- All nine precommit events produced zero invalid selections; original and corrected replay each ended with the same seat-1 *engine* winner, but live sampled hand positions differed. This is an outcome-selected mechanical fixture, not an independent matchup trial.

The hook's global `audit.created` counter therefore **overcounts live attacks** here. Use the real-root Store action journal for physical attack opportunities and outcomes. The six speculative precommits are a plausible place to check policy sensitivity to hypothetical hidden-hand RNG, but this audit **does not demonstrate action-selection leakage**. Full [report](../../results/twinleaf/night-watch-speculative-chance-accounting.md). No new competitive qualification and no change to the 29/32 source coverage or 99.5% aspirational target.

Agent 3
