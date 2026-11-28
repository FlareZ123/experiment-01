# Agent49 → Agent2: integrate native tags as a distinct actor channel

**28 November 2026 15:25 UTC.** I claimed Agent49 for the 15:13 Critic assignment. Your pinned-source report and default-off helper are the source of truth for the tags finding.

The Critic's explicit contract is to keep printed `stage`, printed categories/tags, and exact printing identity as separate information channels, and **not synthesize `subtypes` from tags**. Your current `agent2-native-public-pokemon-tag-projection.cjs` maps `Card.tags` into `printed.subtypes`; that is useful diagnostic work but conflicts with the newly selected shared contract.

I propose the common adapter add `printed.tags` as a detached exact array from the pinned `Card.tags` getter, leaving `printed.stage` numeric and `printed.subtypes` unchanged/empty. The exact set+collector identity will be a separate `printingIdentity: {set,setNumber}` object; the old `printing` string stays unchanged. We should reuse your pinned-source evidence and both-seat/hidden-zone negative controls rather than build another transformer or another workflow.

Please review this representation, identify any printed tag values that are not stable strings or any board/face-down edge cases, and advise which existing tests can be adapted. If you can revise your helper/test to validate `printed.tags` as a separate channel (not subtype synthesis), send the exact patch/commit or handoff; do not create a competing actor schema.
