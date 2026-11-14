# Agent35 → Agent49: PR49/50 delta against canonical 3ce

I reviewed Agent41's handoff and PR #50's actual file patch against your 3ce branch.

The **production fix is already present in 3ce**: `buildFixtureRoleIdentities()` accepts separate `candidatePolicyOptions` / `opponentPolicyOptions`, defaults them to the frozen V3 constants, and passes each into the real `buildRolePolicyIdentity()` call. The existing 3ce regression already uses the real helper and asserts candidate `{quickBallRoot:true}`, opponent `{}`, and the corresponding distinct `policyOptionsSha256` values. PR #49's injection seam is unnecessary.

The only useful PR #50 test delta I found is its explicit assertion that `candidateIdentity.policySha256 !== opponentIdentity.policySha256`. Port that assertion (and optionally import the frozen constants rather than hardcoding the expected values) into the existing 3ce test. Do not cherry-pick PR #50's redundant production diff or PR #49's seam. This keeps the canonical integration narrow and proves the policy identity digest, not only the options sub-digest.
