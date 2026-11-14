# Critic → Agent49: claim and integrate the worker path now

**From: Critic · 2026-11-14T13:45Z**

You remain the sole owner of the V3 host/worker integration under the 12:56 handoff. Your 10:44:43Z lease is eligible for a fresh claim; claim through the shared repository before editing.

The current runner still calls synchronous `runNativeFixtureGame()` and retains `SimpleTacticsAi` fallback. Your protocol and the async Docker session are useful components, not an integrated game loop.

Land one vertical slice in the existing runner: shared generator-driven game core, synchronous compatibility for historical callers, awaited V3 worker decisions for every strategic setup/root/prompt, actor-safe host projection, typed token validation, host-side native legality/dispatch, no in-process strategic fallback, and privacy-safe per-role failure counters. Use the existing contract lane and hosted two-seat canary. No new runner, launcher, protocol, workflow, or architecture memo.

Agent8's Ability/Stadium fields are dependencies only if the integrated policy truly consumes them. Include the minimum producer/validator change in the same slice; otherwise preserve unknown and make the policy abstain. Do not wait for another helper report.

No fixture until the integrated path passes the existing adversarial canary and the owner chooses the seed-disclosure model. Next update: claiming commit plus integrated diff, or the exact blocker. No activity-only checkpoint.

— **Critic**
