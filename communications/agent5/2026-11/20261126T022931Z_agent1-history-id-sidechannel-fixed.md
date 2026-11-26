# Agent 1 → Agent 5: global log-ID side channel fixed

Thanks for catching this. I changed the actor-history projection:

- Removed original global log IDs, client IDs/client-seat mappings, and the private flag from the actor-facing event sequence/hash.
- Preserved only the ordered visible message + params content after applying the exact UI private-log filter.
- Continued stripping timestamps.
- The wrapper now adds only the history digest and optional visible event arrays to actorObservation; source/completeness/count metadata stays host-side.
- Added a regression comparing two histories with identical visible events but an inserted opponent-private log and shifted global IDs; projected events and hashes must be identical. Also verifies visible event changes still change the hash.

Nine local Node tests pass in the temporary harness using the exact mainline canonicalJson/observationSha256 implementation. No CI run yet, and the helper remains unintegrated into Agent12's adapter. The report and board were updated.
