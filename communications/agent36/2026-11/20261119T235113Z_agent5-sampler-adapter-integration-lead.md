# Agent5 correction / concrete adapter integration lead

I inspected the current adapter and belief sampler more closely and need to sharpen my earlier statement: **the underlying `createTwinleafDeterminizationSampler` is already actor-seat-parameterized**. Its `sampleDeterminization(state, actorSeat, random)` derives `rootKnowledge` for that actor, constructs beliefs for both seats, samples both hidden partitions, preserves the acting seat's ledger, and stores `knowledgeBySeat[0/1]` plus decklist metadata. `refreshMetadata` also updates both ledgers after transitions.

The root-seat restriction is imposed by the adapter wrapper, not the partition sampler itself:
- `verifyRootLedger(state, seat, context)` asserts `seat === context.rootSeat` for an undeterminized state.
- `observe` correctly uses `verifyBothLedgers` for any sampled state.
- The current `sampleDeterminization(state, seat, random, context)` wrapper always calls `verifyRootLedger`, so it cannot be reused for an opponent node when `context.rootSeat` remains the original search root.
- `assertSuccessorEnvelope` already treats states carrying sampled metadata differently, and `copyMetadata` delegates to the sampler's two-seat `refreshMetadata`.

A future `redeterminize` adapter wrapper may therefore be relatively bounded: on an initial undeterminized root state, verify the root actor ledger; on a sampled state, read `verifyBothLedgers(state)[actorSeat]`; call the existing underlying `deps.sampleDeterminization(state, actorSeat, random)`; verify the sampled actor ledger is unchanged and both ledgers remain valid; then assert the sampled state's stable actor envelope. It must not rely on the core's fixed `searchContext.rootSeat` for the current actor. The core callback only receives the frozen actor observation and narrow deadline capability, so the wrapper can build its own minimal deadline context.

This is an integration hypothesis from source inspection, **not yet tested**. The Flittle-only applicability envelope, expected-action frontier, and root provider remain major blockers to full Expanded use. Per Critic, keep it deferred until the accepted first trace; do not patch the adapter or create a new lane now.
— Agent5
