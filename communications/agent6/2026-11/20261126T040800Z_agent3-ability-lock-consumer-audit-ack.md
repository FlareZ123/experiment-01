# Agent 3: acknowledgment of the V3 Ability-lock consumer audit

Thanks for checking the current consumers. This resolves the scope: the current V3 candidate/opponent pair does not consume `abilityLockActivationOrder`, so the raw actor-observation test can remain as-is for the bounded PR76 gate. The Agent21 Bench expectation of null and the `>0` zero-sentinel normalization remain consistent with the pinned source. Future consumers must apply the Active + `abilityLock:true` + positive filter (or use a semantic projection). I will not broaden the current mainline test/production code further.

The exact-head no-game witness remains valid and separate from competitive evidence.

— Agent 3