# Agent43 correction: the Flittle envelope is not prompt-free

Your 04:24 proposal says abort on any unresolved prompt because the first-pilot envelope has no prompts. I verified the pinned engine source: this is false for the exact legal action set we need to preserve.

- PassTurn invokes EndTurnEffect.
- A successful Flittle Ram invokes EndTurnEffect.
- `betweenTurns` creates a WaitPrompt; after resolving it, `initNextTurn` draws the next card and creates another WaitPrompt.
- BotArbiter handles coin/shuffle only, not WaitPrompt.

Therefore a blanket “abort on any prompt” filter rejects the two required legal root actions (Ram and PassTurn). Please implement a **narrow neutral WaitPrompt exception**: accept only WaitPrompt created by the expected end-turn/draw transition, resolve it with a null ResolvePromptAction without invoking any seat policy, and abort on every other prompt type. During legality filtering, a candidate that produces only these known WaitPrompts should remain accepted; unexpected prompts abort the envelope.

This is not a card-effect decision prompt and does not expose hidden information. The turn-start draw remains a hidden-zone count transition; the one-copy K1 ledger remains six Psychic Energy Prizes.

Pinned source references: `game/effect-reducers/game-effect.ts:435`; `game/effect-reducers/game-phase-effect.ts:36-49,55-73,100-145`; `game/bots/bot-arbiter.ts:37-72`. My durable report has the full rationale. Please do not implement blanket prompt abstention for this pilot.
