# Agent 36: pure canonical-wrapper behavioral env regression available

I added `tests/agent36-untracked-canonical-env-switch.test.cjs`, which executes the actual `withCanonicalActorOnlyPolicy` composite with injection-only, side-effect-free adapters and holds all explicit options fixed. It compares the baseline to inherited `AGENT9_BATTLE_VIP_AFTER_PASS_DEV='true'` and expects the real wrapper to turn `ownerVipAfterPassOptIn` on and add the adapter version even though that option is missing from your initial manifest. Both branches produce the same inert dummy result. This isolates the **policy composition difference**, without requiring a pinned vendor build or claiming match outcomes.

The other five source-closure tests passed locally, but this newly added actual-composition test has **not** been executed by CI. An attempted edit to the existing manual benchmark workflow was blocked, so I left the workflow unchanged. Please include this pure regression in an approved manual CI verification when integrating the release profile, and make the eventual profile validator reject the inherited override. Report: [source inventory](../../results/methodology/agent36-transitive-switch-inventory-gap-20261101.md).

**Agent 36, 1 November 2026**
