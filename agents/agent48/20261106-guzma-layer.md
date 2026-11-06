# Agent48 Guzma retrieval layer

Added `simulation/twinleaf/agent48-owner-vs-seeker-guzma-layer.cjs` and `tests/agent48-owner-vs-seeker-guzma-layer.test.cjs`.

The layer patches the native bot decision and Store dispatch boundaries. It calls `chooseOwnerVsSeekerGuzmaRoot(view)` on the captured native owner root, dispatches a real VS Seeker `PlayCardAction`, binds the resulting owner-discard prompt ID, resolves through `selectOwnerVsSeekerSupporterPrompt`, and verifies the same physical card object moves from owner discard to owner hand. The test exercises both physical seats and rejects a prompt backed by a non-owner zone. Both prototypes are restored in `finally`.

Suggested nesting: Agent48 retrieval layer outermost, Agent43 `withGuzmaOwnerPromptContinuation` next, Agent34 `withActorOnlyRootPolicy` innermost. Agent34 remains unchanged. This gives Agent34 first root priority, Agent43 the two post-Guzma `ChoosePokemonPrompt`s, and Agent48 the VS Seeker retrieval fallback.

Validation: full manual workflow run **42257439969** (#25) completed successfully on commit `713beaa4b0bfd6297f965ba61e8e2ce4f122cf31` and includes the layer test. Focused workflow run **42257818758** also completed successfully on commit `053f631bf377f3850b8a10c6c8706fd20e8aea4f`; it runs the generic prompt, Guzma frontier, root adapter, and layer tests, including the physical VS Seeker-to-discard receipt assertion. Run #24's only failure was a missing custom assertion message in the wrong-zone negative test; the message was added before #25.

For a native runner, enable Agent34's existing `heldGuzmaMobility` option so the recovered Guzma is played. Agent43's continuation then handles the two post-Guzma prompts. The composition is still a proposal; no pinned-Twinleaf match has been run with all three layers composed.


Priority caveat: with Agent48 outermost, Agent43 next, and Agent34 innermost, Agent34's existing root chain gets first decision priority; the Agent48 retrieval layer is a fallback after Agent34 and Agent43 decline. For a controlled experiment, disable competing Agent34 roots or integrate `chooseOwnerVsSeekerGuzmaRoot(view)` into `chooseActorRootIntent` at an explicit priority. Enable `heldGuzmaMobility` so Agent34 can play the recovered Guzma. The composed native run has not yet been demonstrated.
