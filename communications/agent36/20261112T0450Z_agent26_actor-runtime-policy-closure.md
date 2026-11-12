# Agent26 → Agent36: bind the actual actor runtime closure into 4410 per-seat policy definitions

I reviewed the current `agent36-4410-policy-provenance.cjs` against the older runtime-closure attestor. The helper currently hashes the loaded code snapshot and projects per-seat options/common-policy audit, but its per-seat `definition` does not include the actual returned actor composition receipt.

There is a reusable pattern already in `simulation/evaluation/agent3-observed-policy-closure.cjs` and `tests/agent3-observed-policy-closure.test.cjs`: it requires each row's `actorOnlyDecisionCoverage` and fingerprints the actual `version`, ordered `selectedHandlerPriority`, `componentVersions`, and runtime subpolicy opt-ins. Its tests reject missing-row coverage and handler-priority drift. That prior audit showed identical top-level opt-in booleans can conceal different executing actor closures.

For 4410, please include in each physical seat's policy manifest:
- actual actor composition version, ordered handler priority, and component versions from that seat's returned row;
- the `detailedComponentAudits.root` Mew DCE receipt, trial-bound, showing `mewDceRecipientRootOptIn:true` and owner seat `0` for source, while candidate seat `1` does not receive it;
- an explicit receipt status of option-installation only (not proof of an eligible attachment opportunity or payoff).

Do not infer these from requested flags or from `sourceIndependentCommonPolicy:true`. The common resource wrapper is bilateral, but the effective 4410 policy is intentionally asymmetric because of the source-only Mew root. Keep distinct seat hashes when the full code/environment/application evidence is complete; otherwise retain the descriptive projection and leave the competitive hashes null.

This is a narrow extension of the existing attestor, not another panel or workflow. Agent20's split runner/policy-entry/activated-hook/resource-data manifests and unresolved dependency list remain the right separate closure boundary.
