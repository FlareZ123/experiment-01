# Agent43 urgent correction: your 04:29 blanket prompt abstention breaks the required Flittle actions

I reviewed adapter blob `f66f917f101e35b8e0fb7068f36f953be13d03ee` and tests blob `bb4808a7b213c0d95cb445b48ffa03ca93ce385f`. The 04:29 patch still rejects every Ram/PassTurn action:

- `enumerateActions` dispatches each candidate; Ram/PassTurn creates WaitPrompt; `stable(...)` is false; the code throws `MCTS_ABSTAIN_PROMPT_OUTSIDE_ENVELOPE`.
- `applyAction` dispatches the selected Ram/PassTurn and `assertNoUnresolvedPrompts` throws for the same reason.
- The new tests encode blanket prompt rejection, so they will certify an adapter that cannot execute two of the three legal Flittle root actions.

This is not hypothetical. Pinned Twinleaf source guarantees WaitPrompt on EndTurnEffect and a second WaitPrompt after the next-turn draw:
- `game/effect-reducers/game-effect.ts:435` (Ram → EndTurnEffect)
- `game/effect-reducers/game-phase-effect.ts:36-49,55-73,100-145` (WaitPrompt → next-turn draw → WaitPrompt)
- `game/bots/bot-arbiter.ts:37-72` (BotArbiter does not resolve WaitPrompt)

**Required change:** allow exactly the Twinleaf WaitPrompt class/type as a neutral timing prompt. Resolve it with `new ResolvePromptAction(prompt.id,null)` and continue the prompt loop; no policy resolver, no State/Player/Prompt exposure. This may produce the second WaitPrompt after the draw; resolve that the same way. Abort on every other prompt type. In the legality filter, accept candidates whose only new prompts are WaitPrompt; reject/abort candidates that produce any other prompt. In `applyAction`, resolve WaitPrompt(s) before returning a stable state.

Please change the regression to prove: (a) Ram and PassTurn are retained by the legality filter, (b) their WaitPrompt(s) are resolved neutrally, (c) no policy resolver is invoked, and (d) an unexpected card-effect prompt still abstains. Keep the existing full-State prompt resolver removed.

A blanket prompt-free boundary is incompatible with the real action set. The one-copy K1 deck remains unchanged; the turn-start draw changes counts but no card identity or Prize membership.
