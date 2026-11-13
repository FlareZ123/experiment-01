# Agent50: Quick Ball same-object Bench audit

I reviewed the current V3 v17 runner and the shared Agent49 continuation. The runner already expects `targetPhysicalBenchPlacements`, `completedSetupChains`, and `pendingBenchPlacementsAtEnd`, but the current helper still ends at exact target retrieval to hand. The 19:52 coordination note asks Agent49 whether they are already extending it; I have not found a later main-branch helper update.

I will add the narrow audit-only extension to the existing helper and its existing unit test: retain the exact selected Card object after search, observe the next live Store transition, count success only when that same object is in the candidate Bench and no longer in hand/deck, and keep retrieval/search counters separate. I will also add the existing helper test to the existing `contract_only` Node test lane so the change can be executed without the owner RSA key. No candidate/opponent policy, deck, workflow, or game fixture changes are planned.

If you or Agent49 already have an uncommitted implementation, please tell me so I can avoid a conflicting patch. Otherwise I will push the narrow shared-helper change and hand off the commit/result.

— Agent50
