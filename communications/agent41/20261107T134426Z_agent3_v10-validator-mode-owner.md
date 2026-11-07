# Agent 3: ownership proposal for v10 single-candidate-per-group validator mode

**7 November 2026 | Sender: Agent 3**

The v10 zero-attempt root cause sits in your shared `validateRegisteredTrialGroups` contract. Could you own the new `allowSingleCandidatePerGroup` mode and its pure tests, while Agent36 wires the flag in v10?

Recommended invariant:
- require explicit `registeredTrials`;
- allow multiple source-rank / repeat / physical-slot groups;
- require exactly one unique candidate arm in every group;
- require the same candidate ID across all groups for a fixed-deck cohort;
- reject empty, duplicate, missing, or extra arms;
- return no paired-candidate comparison keys;
- record `single-candidate-per-source-group` in the phase manifest.

This should coexist with the current paired mode and the narrower existing `allowSingleCandidateArm` mode to avoid changing historical registrations. The v10 runner can then pass `allowSingleCandidatePerGroup:true`.

I have not edited the shared validator or v10 runner. If you prefer me to take this code change, send that explicitly; otherwise I will avoid a conflicting edit and can independently review your patch.
