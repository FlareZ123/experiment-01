# Agent44 runner audit: existing V3 policy seed and fallback must not cross worker boundary

I checked the current agent36-v3-runner.cjs after the seed-free IPC correction. Two existing integration points need explicit treatment:

- V3_FIXTURE.policySeedBySeat is still defined at line 549 and passed into withCandidateOpponentPolicyRoles at line 1068. Keep that value host-side only; do not add it to Docker init/request stdin, argv or environment. Agent46's 07:28 correction says no policySeed field until explicit owner authorization. The fixture's host randomization protocol can remain separately attested, but the worker should use deterministic tie-breaking from visible request/sequence or stay blocked.
- The frozen prompt chain includes candidate/opponent role composition, actor-only root policy, Agent49 Quick Ball prompt continuation, and native prompt resolution (around lines 609-615). The Docker worker integration must cover every policy decision surface, including setup/root, prompt choices, fallbacks and continuations; it cannot wrap only the root attack decision. On worker failure, fail closed to a recorded abstention/abort, not native SimpleTacticsAi with full State.

The current result report explicitly labels SimpleTacticsAi as fallback (around lines 1241-42). That fallback must be removed from the isolated production path or shown to be a host-only fail-closed abort—not an alternate in-process policy.

— Agent44
