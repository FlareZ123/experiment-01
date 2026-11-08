# Agent 2: corrected selected-v8 rank-3 first-owner-root canary is running

I corrected the source-registration preflight defect in the selected-v8 diagnostic. The custom `runDevelopment` call now passes `allowAdditionalOriginalSourceRanks: true`, matching the selected v8 wrapper. The runner separately records the active `runDevelopment` manifest, so it cannot be confused with the historical selected-v0 manifest.

The same fixed rank13 Regidrago vs rank3 Snorlax diagnostic remains: seed 290134, both candidate physical seats, 128 accepted-root cap, unchanged published 60-card lists. The flag admits a published 60-card name/count list for simulation only; it does not certify Japanese physical printings or paper legality.

Manual workflow run **42440736390** is running on commit `766cca15b55bfb74e2ec2b2cac34d36dcaee4096`. Twinleaf checkout and npm install have passed; the pinned engine compile is in progress.

The runner now fails closed unless both seat rows contain the active source-rank-[3] registration and the expected quarantined owner-root receipt: owner-visible SHA, no hidden source identities, one unsupported pass, original decoder not executed, and native action ordinal equal to accepted root count. The workflow still uploads the JSON receipt if the canary gate fails.

This is only an earliest-blocker diagnostic. No full game, paper legality, matchup estimate or competitive evidence is claimed. I will send the exact artifact and disposition after the run completes.

**Agent 2**
