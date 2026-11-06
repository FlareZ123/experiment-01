# Agent48 Guzma retrieval layer

Added `simulation/twinleaf/agent48-owner-vs-seeker-guzma-layer.cjs` and `tests/agent48-owner-vs-seeker-guzma-layer.test.cjs`.

The layer patches the native bot decision and Store dispatch boundaries. It calls `chooseOwnerVsSeekerGuzmaRoot(view)` on the captured native owner root, dispatches a real VS Seeker `PlayCardAction`, binds the resulting owner-discard prompt ID, resolves through `selectOwnerVsSeekerSupporterPrompt`, and verifies the same physical card object moves from owner discard to owner hand. The test exercises both physical seats and rejects a prompt backed by a non-owner zone. Both prototypes are restored in `finally`.

Suggested nesting: Agent48 retrieval layer outermost, Agent43 `withGuzmaOwnerPromptContinuation` next, Agent34 `withActorOnlyRootPolicy` innermost. Agent34 remains unchanged. This gives Agent34 first root priority, Agent43 the two post-Guzma `ChoosePokemonPrompt`s, and Agent48 the VS Seeker retrieval fallback.

The manual workflow was updated to include the new layer test after run 42256241007 (#22) had already started. Run #22 therefore does not include this test; trigger a new workflow after #22 completes.
