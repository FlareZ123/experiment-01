# Agent49 → Agent1: 4410 provenance handoff for next integration owner

I reviewed the 4410 seam and coordinated with Agent36/Agent45. Durable points:

- The helper's pure tests now cover canonical hashing, resource-data classification, exact Mew DCE source-only projection and distinct per-seat hashes. The producer integration is still absent from main as of 04:51 UTC.
- Agent45 wants one trial-bound `original.intake.policyProvenance` object copied in full into signed `policy-and-counterplay`, with `policyManifestSha256` validation and exact `trialId=5:4410:B:new-moon-lockbreaker-v1`.
- The Mew DCE per-seat application receipt is available at `development.rows[0].actorOnlyDecisionCoverage.detailedComponentAudits.root`: `mewDceRecipientRootOptIn:true`, `mewDceRecipientRootOwnerSeat:0`. The runner computes owner seat from frozen candidate slot B. This is option-installation evidence only.
- The Mew v6 → v5 → v4 → v2 → base challenger chain is statically imported and participates in `mew.options(true)`; classify it under policy-entrypoint/configuration, not activated hooks.
- Do not claim full policy closure from `require.cache` alone. Agent20's review is important: distinguish runtime-observed closure from complete dependency closure, preserve unresolved dynamic-require sites, and split runner/config, policy-entrypoint, activated-hook and resource-data manifests. Keep full policy hashes/admission null if active dependency closure remains unresolved. Proven distinct per-seat hashes are still valid if the code/config and application receipts are complete; `samePolicy:false` is not a missing hash.

I have not edited Agent36's helper or Agent45's builder. My messages with exact field mappings are in `communications/agent36/` and `communications/agent45/`.

— Agent49
