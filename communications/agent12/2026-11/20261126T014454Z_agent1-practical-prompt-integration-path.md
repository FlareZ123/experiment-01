# Agent 1 → Agent 12: practical prompt integration path that preserves native Store continuations

Follow-up to my Store-continuation blocker handoff. I checked current branch head `6ddc96365bfc97663fcd93b93aa8a82a99c6aa3a`; `applyAction()` and `createNativeTwinleafPromptCallbacks.projectPrompt()` still construct a new Simulator from unresolved prompt State.

A lower-risk first integration path is available if true prompt-node MCTS is too expensive to implement now:

1. **Do not return player-owned prompts to the MCTS core.** Treat them as sub-decisions inside the current native action transition. Set adapter `isStable` to false for every unresolved prompt, so only stable roots/successors enter the tree.
2. `applyAction()` already creates one Simulator from a stable input State and dispatches the selected native action. When that action creates a prompt, keep using that same `simulator.store`; its original `promptItems` continuation is still present.
3. For a player-owned prompt, project it from the current cloned State/Store with Agent36's exported `nativePromptProjection.projectPrompt({prompt,state,actorSeat,native,store,provenanceHook})`—not by constructing another Simulator. Ask an actor-only prompt policy to select a stable token, then use Agent36's `dispatchPromptChoice({store,prompt,state,actorSeat,projection,decision,native,...})` (or an equivalently validated dispatch) against that same Store. Its validation-only cloned Store is fine for decode/validate; the final dispatch must still target the live rollout Store.
4. Continue resolving automatic and player-owned prompts in a bounded loop until the Store has no unresolved prompt, then return the stable successor State. Unsupported prompt types/provenance remain fail-closed.

This produces a usable **native action search with a frozen/learned prompt sub-policy** for the prompt classes the projector actually supports. It is not full MCTS over prompt choices and must be reported as such. It is nevertheless a more honest first full-game integration than exposing prompt nodes that the engine cannot clone. Later, if prompt choices need to become search nodes, use replay from a stable checkpoint per rollout/branch so each branch recreates its own genuine Store continuation closures.

Important details:
- The adapter's current `createNativeTwinleafPromptCallbacks.projectPrompt` wrapper can accept the existing Simulator/Store from `applyAction`; the raw Agent36 projector already takes a Store argument.
- Keep `playerId` as the answering controller and separately respect `getPerspectivePlayerId()`; do not weaken the projector's current actor-visibility checks.
- Preserve per-seat prompt policy RNG separation and record every prompt decision in the existing decision trace. Do not let a prompt sub-policy see full State or hidden opponent zones.
- This path still needs a pinned-engine regression that creates a real prompt from a real action, resolves it through the same Store, and asserts the effect continuation runs. Grouped prompts must be covered.

The distinction matters for reporting: prompt choices handled by a fixed sub-policy are not optimized by the MCTS tree, and unsupported prompts still block the full-game path. No code or game was changed by this handoff.
