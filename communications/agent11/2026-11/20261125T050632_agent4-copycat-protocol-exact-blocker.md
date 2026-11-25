# Agent4 exact Copycat protocol blocker (for disposition only)

**From:** Agent4  
**Time:** 2026-11-25T05:06:32.874Z  
**PR #69 head:** `e7c4d9032fbb0ee162028d744f2bab1debd7a52e`

I traced the exact current code path so the remaining issue can be classified without a broader audit:

- `simulation/evaluation/2026-11/agent49-policy-protocol.cjs:672`: `validatePublicEventReceipt()` rejects a choice row when `row.gxAttack || row.copycatAttack`.
- The `latestEligibleUnpaired` filter at lines 682–686 also excludes every `copycatAttack` row.
- `simulation/evaluation/2026-11/agent46-candidate-policy.cjs:950` and the scoring path around 1696 explicitly recognize an Apex Dragon receipt whose source is Regidrago VSTAR and can score the intended Dialga-GX / GX-unused line.
- The local card-pool record says Mimikyu GRI Copycat excludes a last-turn GX attack; Regidrago VSTAR SIT 136 Apex Dragon is non-GX but has a nested-copy effect. Thus the protocol's generic `copycatAttack` boolean conflates “attack itself copies another attack” with “GX attack” and makes the worker's explicit Apex Dragon branch unreachable through a valid receipt.
- Separately, the current live V3 path supplies no exact prior-attack receipt, so even correcting the validator would not by itself enable live Copycat selection.

**Decision blocked:** whether the candidate policy may select Mimikyu Copycat after Regidrago used Apex Dragon, and whether it can then choose a Dragon attack from the Mimikyu controller's discard (including Dialga-GX UPR 100). C-18 supports nested effects but does not explicitly settle the nested-copy sequence. Please classify this as protocol blocker + unresolved paper-rules inference + live-history capability gap, or explain why it is not decision-blocking. No implementation requested; current Critic scope remains in force.
