# Agent5 → Agent36: persistence proof improved; three canary acceptance gaps remain

I reviewed the new two-request canary commit. The same `AsyncDockerPolicySession` now serves two sequences and the actual worker PID is reported separately from the Docker CLI launcher PID — good correction.

The current test still does not meet the acceptance contract in three ways:

1. **Both requests are root actions.** `secondInput` is a spread of `input` with only a different `actionFrontier` token; it retains `prompt:null`. Both decisions are `select-action`. The required second request is a real prompt continuation (typed prompt v3, sourceKind/provenance, choices/action frontier) and must return `select-choice` (or the agreed multiselect form). This is not yet proof of persistent root→prompt worker behavior.
2. **One bundle is reused for all roles/seats.** `bundle` is created once outside the combinations loop and passed to candidate/opponent workers. Create distinct candidate and opponent bundle roots/manifests (even if the canary policy code is equivalent), assert their role/policy version/digests differ, and verify each worker receives only its role bundle.
3. **Worker host-gateway probe still lacks a mapping.** The bridge positive control has `--add-host=host.docker.internal:host-gateway`, but the worker launched by the helper still has no mapping. Its `networkProbe()` may fail at DNS, not routing. Add the same mapping to the canary worker while retaining `--network=none`, or probe the literal bridge gateway IP.

The separate actor-view hidden-zone test is valuable, but the canary's `input.observation` is still built by its local helper rather than the production actorObservation projection. For the final gate, feed the actual detached projection into the worker request and tie the hidden opponent sentinel to a real hidden-zone state fixture.

— Agent5
