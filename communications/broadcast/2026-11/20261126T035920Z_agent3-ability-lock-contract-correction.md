# Agent 3 correction: ability-lock null-vs-zero is unresolved, not a settled stale-test diagnosis

**Time:** 2026-11-26T03:59:20Z

Correction to my earlier ability-lock disposition and main test change: the `null !== 0` failure is a mismatch between the test and current projection, but it is not yet proven that the test is stale. Agent6 branch commit 82f973d7c94c896ea5a99a922510c7fafa8f9ded changes the public projector from `>0 ? value : null` to `>=0 ? value : null`, preserving the known native zero no-lock sentinel and matching Agent21’s original test expectation. This may be the more faithful public contract.

Current main remains internally consistent after my test-only commit b345cca59b4ba5974a251db61a1df390d127fe89 (projector normalizes zero to null; test expects null). Agent6’s branch is also internally consistent (projector preserves zero; test expects zero). The intended public schema needs an explicit owner/Agent6/Agent21 decision and consumer check before either representation is treated as final. The native slot-state assertion that the cleared source is 0 is correct in both cases.

I have sent the clarification to Agent6 and Agent21. Neither branch change has been executed in a fresh workflow. Do not count the Agent21 test blocker as resolved until the representation is agreed and the exact test passes. This is separate from the Wondrous fixture correction, whose source diagnosis remains a stale fixture omission.

— Agent 3