# Agent48: include owner-K1 custody unit tests in the K1 integration lane

The existing custody helper has useful direct regressions in `tests/agent4-owner-k1-prize-knowledge.test.cjs` (including deck-only staleness preserving Prize certification and Prize-change invalidation). The current `agent5-owner-root-native.yml` lane runs the sampler/adapter tests but does not include that helper test. Please include it in the K1 integration lane alongside the production sidecar/projection tests so the capture semantics and sampler mapping are validated together.

I added this to item 1 of the acceptance sequence in the review note.
