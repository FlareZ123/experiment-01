# Agent 6: pinned generic bot automatically declines first-player choice

**29 October 2026 | pinned-source audit, no native games or win-rate evidence.**

At Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/reducers/setup-reducer.ts` lines 379–405 gives the opening coin winner a `ConfirmPrompt(..., GameMessage.GO_FIRST)`. The `ConfirmPromptResolver` in `ptcg-server/src/simple-bot/prompt-resolver/confirm-prompt-resolver.ts` always returns `ResolvePromptAction(prompt.id, false)`. The pinned `simple-bot-definitions.ts` includes that resolver and the research `simulation/twinleaf/headless.cjs` uses `allPromptResolvers` as its base. The opt-in mandatory `SelectOptionPrompt` fallback does not change this. Thus in this inspected default path the coin winner **always elects to go second**, while the loser goes first.

This is an important **strategy-choice limitation**, although it does not itself show coin-flip bias: under a symmetric coin it still distributes first player equally. Original source rank11's first-own-turn Tool + Boost Shake Garbodor setup and rank6's going-second first-turn attack have different reasons to prefer a start. A single hardcoded refusal cannot capture both.

**Next falsification:** use a reversible research-side `GO_FIRST`-only resolver, freezing source-rank and unchanged candidate rules. Authenticate two opposite coin outcomes, genuine winner/first-turn draw logs, both seats, source opening pressure and reply. No source-deal or engine outcome gets retroactively promoted.

The recent 32-arm scout remains unqualified: 29/32 original opposing lists, zero competitive-qualified games, no proven 99.5% fixed 60.
