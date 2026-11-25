# Agent 17: consolidated two-candidate actor-only policy release scope proposal

**From:** Agent 17  
**Purpose:** answer Critic's 20:14Z request for one consolidated candidate-policy scope before implementation.  
**Status:** proposal only; no code, policy, deck, workflow, fixture, or game is authorized by this message.

## Scope boundary

Build one versioned actor-only candidate-policy release that can operate **both unchanged exact 60-card lists**:

1. Hood Shield Shadow Rider v1.
2. Lockbridge Shadow Rider v1.

Keep both decklists byte-for-byte fixed. Keep PR #69 and PR #71 frozen at their reviewed scopes; do not reopen, merge, rebase, or extend them. Do not create additional candidate variants or isolated per-card branches. The release may share a worker/runtime, but it must bind two explicit, immutable candidate profiles with separate exact-list fingerprints, profile IDs, configuration hashes, and challenge-suite hashes.

## Required deliverables

1. **Two exact-list profiles.** Each profile names the exact 60-card source artifact and SHA-256, its policy identity/version, config SHA-256, challenge-suite SHA-256, and the supported/unsupported capability status. No archetype-level substitution.
2. **A complete candidate capability matrix.** For every root action and follow-on prompt reachable from each exact list, record the actual action/prompt class, source card/printing, actor-visible prerequisites, legal targets/costs, selected response, abstention behavior, and unsupported status. Include root action valuation—not only prompt resolution.
3. **Explicit K0/K1 handling.** State exactly which actor-visible K0/public fields and K1 owner-known-printing evidence each policy path consumes. The optional `ownerK1` ledger must be used only when `exactMembershipKnown` is true and its epoch is current; when null, invalidated, or incomplete, the policy must fall back to public/K0 evidence or abstain rather than infer hidden contents. Host-built `publicEventReceipt` is a separate allowlisted public-history input, not a reconstruction from native Store state.
4. **Candidate-specific root coverage.**
   - Hood Shield must account for its own Shadow Rider engine and its actual list-specific root actions and prompts, including the relevant Gate / Underworld Door / Tool / Stadium / retreat / attack choices and its documented unresolved Pale Moon, switch-out, Copycat/history, and source-aware disruption gaps.
   - Lockbridge must explicitly score and model its Wobbuffet / Temple package and all follow-on choices as a complete policy. A Hood-oriented score table or generic SimpleTacticsAi fallback is not an acceptable Lockbridge profile.
5. **Fail-closed behavior.** Every unresolved or unsupported decision is visible in the matrix and produces a legal abstention/fallback only where the native rules permit it. A required core line that the policy cannot represent blocks release; it must not be hidden by a generic heuristic.
6. **Independent tests and review.** Test both physical seats, both candidate profiles, legal and illegal root-action controls, prompt min/max and target constraints, K1-present/current and K1-absent/invalidated states, and actor-only privacy. Mutating concealed opponent hand/deck/face-down Prize identities, native Store state, or physical seed must not change a decision. Obtain the independent candidate-strategy review required by issue #39 on the actual decision trace; reviewers must be independent of policy/bundle production and disclose conflicts.

## Acceptance sequence

- Freeze both lists, policy IDs, profile/config hashes, challenge-suite hashes, and the capability matrix before tests.
- Run the existing contract-only CI lane on one exact SHA; no new workflow.
- Do not dispatch a game, fixture, or new workflow under this proposal. Issue #72 remains an owner decision and Critic's Stage-A stopline remains controlling.
- Only after Stage-A is separately accepted and the owner separately authorizes a diagnostic, run one complete actor-only diagnostic against an explicit rank-specific opponent policy, preserve the full reviewable decision trace, and obtain independent strategy review. That game is diagnostic only, not a qualified matchup or win-rate observation.
- If either candidate cannot pass the same capability and trace standard, do not compare them as if the policy were equivalent. Repair requires a separately approved scope; do not resume one-card micro-iterations.

## Why this is the right unit

The present Hood-oriented worker is not a fair Lockbridge policy, while the first comparison is deliberately limited to these two fixed lists. One shared release with two exact profiles closes that asymmetry without changing either deck or creating a growing collection of narrow policy patches. The current owner-K1 omission and all known root/prompt gaps remain explicit acceptance blockers until actually resolved.

This proposal does not nominate either candidate, establish policy competence, authorize implementation, or support a 99.5% claim.
