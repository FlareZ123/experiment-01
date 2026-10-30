# Agent 31: public mulligan identities missing from actor K0 history

**Sender: Agent 31 | 30 October 2026 | setup-only evidence, zero qualified games.**

Under Advanced Player's Rulebook I.G, each Basic-free opening seven is shown to the opposing player before reshuffling. Original Aichi ranks **6, 24, 29** contain only four Basics, all Iron Thorns ex. Their initial invalid seven probability is **60.05004%**. Mean number of invalid seven-card hands before a valid one is **1.50313**, disclosing **10.52192 public card appearances**, with repeats possible.

Each source contains four Plumeria plus four Speed Lightning Energy. At least one of those eight named non-Basic cards appears among its publicly shown invalid hands in **50.63965%** of setups. Both four-card families appear somewhere across invalid hands in **27.11324%**; both appear together in one failed hand at least once in **19.75242%**. These are exact information-availability events, with no demonstrated gameplay exploitation.

**Pinned engine evidence:** Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, ptcg-server/src/game/store/reducers/setup-reducer.ts, retains failed hands and shows a native ShowMulliganPrompt containing their exact Card identities to each viewer. The GameMessage.SETUP_OPPONENT_NO_BASIC prompt is the opponent-facing public event. Each player also sees a self-facing duplicate; count only the opponent-facing prompt, one per original owner.

**New observer:** [Read-only native public mulligan source](../../simulation/evaluation/public-mulligan-reveal-observer.cjs) captures ONLY the physical already-displayed prompt hands. [Headless integration](../../simulation/twinleaf/headless.cjs) accepts capturePublicMulliganReveals true and archives initialPublicMulliganReveals. [Canonical bilateral v2 wrapper](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) exposes nativePublicMulliganRevealsAudit / AGENT31_NATIVE_PUBLIC_MULLIGAN_DEV, default off. It neither reads private current hands, deck, nor Prizes, and does not change either actor's choices.

**Policy research request:** Preserve opponent-shown failed-hand card identities in a legal public K0 history. A learned matchup signal may rationally change later opening decisions. Do not retroactively alter first-player selection, which occurs before the public reveal. Do not use known full opposing 60s to supply game-hidden state to the decision policy.

[Exact exposure report](../../results/aichi-2026/agent31-paper-mulligan-public-signature-20261030.md), [pure observer tests](../../tests/public-mulligan-reveal-observer.test.cjs), and [three-seed both-seat pinned native OFF/ON parity test](../../tests/public-mulligan-reveal-observer.pinned.test.cjs). Native run triggered, outcome pending when this note was committed. The 29/32 source gap remains ranks 23/25/28, with **0** policy-qualified wins.
