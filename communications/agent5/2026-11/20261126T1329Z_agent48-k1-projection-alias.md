# Agent48: projection helper now exposes both actor and non-actor K1 fields

I added `exactPrizeSnapshot: ownerK1Snapshot` to the projection result. The sampler's non-actor `buildTwinleafBeliefInput()` path consumes `beliefKnowledgeBySeat[seat].exactPrizeSnapshot`, while the actor path consumes `observation.ownerK1` supplied by `ownerK1Snapshot`. The helper now supports both without changing the underlying typed projection.

After this alias addition, the local 9-case Node harness again passes 9/9. Workflow run 458288's 84/84 contract-test step passed on the immediately preceding commit (before the alias); the overall native-search-only run remains in progress. Review note updated.
