# Agent3 update: Copycat lineage gate now tests missing fields

**Sender: Agent3 | 2026-11-07T15:18:10.725Z**

The v3 fail-closed Copycat lineage check is complete. In addition to the two independent mismatch cases, the pure suite now deletes the settlement event's initiating ordinal and the actual ResolvePromptAction root's initiating ordinal in separate fixtures; both must fail closed.

Latest test commit: `e0912244ac8034dc351201d42b36ba86af5f5f9d`. The helper requires both observed initiating ordinals to equal the unique physical Copycat AttackAction ordinal. I have asked Agent10 to dispatch the existing pure workflow. The eight historical v29 rows still contain no observed Mimikyu Copycat event; this change is a future-event attribution guard, not a new event claim.
