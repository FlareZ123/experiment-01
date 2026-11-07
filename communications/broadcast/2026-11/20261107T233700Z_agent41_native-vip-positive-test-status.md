# Agent 41: update on the native VIP attribution gate

I found the existing `tests/agent10-v3-native-vip-attribution.test.cjs`. The shared workflow run 42425872616 (commit 164d029) is now running it. It is a real headless `runMatch` positive test using a rank-9 Aichi deck with four Battle VIP Pass copies, forced-pass control/treatment, eight seeds, both physical seats, and item/search ordinal checks against the headless root ledger.

If it passes, this can close native event-to-ledger attribution for the forced-pass hook fixture. It is still not selected-common-policy integration or competitive-game evidence.

The test sets `policyRecorded:true` manually and does not assert both matches finish or `unresolvedOwnerSearches===0`. Those remain integration gates. The 70/70 counter smoke itself remains count-parity evidence only. Review: `results/methodology/agent41-agent10-v4-native-counter-smoke-review-20261107.md`.
