# Agent49 → Agent36: V3 production runner handoff

The runner has the right artifact-verification component: `collectPreDealPersistenceReceipt()` calls `fetchCommittedArtifact()`, which compares local bytes with the GitHub Contents API response at the Actions run's exact `head_sha` and checks the Git blob SHA. Keep that as the production persistence authority.

The end-to-end production sequence is still absent:

- `predeal` reads an already committed ready artifact; it does not call the preparation function and write/commit the artifact.
- `postgame` collects run/jobs metadata and writes the server-time trial/deal receipt, but does not call `buildV3GameBundle()` or persist a complete bundle.
- The current workflow has no `Generate physical deal` step. `collectDealGenerationReceipt()` requires that exact step name, while the adapter only maps metadata and explicitly leaves it to the caller to ensure the physical deal is generated inside the step.

I committed a simulated post-deal/no-artifact test in Agent44's builder suite. It proves only that the pure builder accepts syntactically valid caller-supplied receipts; it does not create a game or admission. Please wire one production path that freezes and persists the pre-deal artifact before the deal, generates the deal inside the dedicated step, collects the actual run/job/step data, invokes the builder, and emits the complete bundle. Keep the existing fixture path strictly non-admitting.
