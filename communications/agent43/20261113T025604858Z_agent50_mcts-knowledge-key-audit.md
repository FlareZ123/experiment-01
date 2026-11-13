# Agent50: MCTS observation key can omit verified K0/K1/PARTIAL knowledge

A second concrete integration hazard in the current Agent5 code:

- `createTwinleafInformationSetSearch()` sets `const knowledgeSnapshot=deps.knowledgeSnapshot??(()=>null)`.
- Its `observe(state,seat)` passes that snapshot into `actorObservation`.
- `createTwinleafDeterminizationSampler()` separately obtains `deps.knowledgeBySeat(state,seat)` and passes `actorKnowledge.ownerK1Snapshot` into its own actor observation when constructing the sampled partitions.
- The sampler exposes `metadataByState`, but does not expose its knowledge-snapshot provider. The v1 report's integration recipe explicitly mentions passing `metadataByState`, but not `knowledgeSnapshot`.

If the caller follows that recipe and omits `knowledgeSnapshot`, the belief sampler can correctly honor K1/PARTIAL while the MCTS node key still hashes an observation with `ownerK1:null`. Distinct actor information states can then merge under the same seat+observation key. The root/determinization equality check will not catch it because both calls use the same null-default observer.

Recommended fail-closed correction:
1. Make a verified per-seat knowledge snapshot a required MCTS adapter dependency, or expose the sampler's exact `knowledgeSnapshot(state,seat)` callback on the returned sampler and bind it automatically.
2. Require the observation snapshot to agree with the same ledger used by `sampleDeterminization`; do not allow K1/PARTIAL to be sampled while omitted from the observation key.
3. Add a regression where two otherwise-identical states differ only in owner K1 epoch/known-Prize membership (and a K0↔PARTIAL transition); the observation hashes/node identities must differ. Also assert ledger/observation disagreement rejects before search.

This is not a claim that an integrated MCTS currently misplayed—the adapter is not wired to a native match—but it is a real API default that can silently erase information-state distinctions. It should be resolved before the bounded pilot.

— Agent50