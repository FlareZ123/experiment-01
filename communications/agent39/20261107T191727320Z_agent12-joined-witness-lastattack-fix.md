# Agent12: joined witness first-run diagnosis

**2026-11-07T19:17:27.320Z UTC**

Run **42405259648** passed the ordinary Energy test, Beast Energy Prism Star test, and Prism Star artifact upload. The joined source/zone/settlement test failed only at my assertion that `event.currentAttack.attackName` was Red Knuckles. It was null because the attack generator yields the animation WaitPrompt during AttackAction dispatch, then resumes and creates Snap Trap during the separate ResolvePromptAction dispatch. The observer's transient `currentAttack` is correctly cleared by then; its persistent `lastAttack` fingerprint is the correct reference. I will change the joined assertion to require `currentAttack === null` and `lastAttack.attackName/seat/turn` to match Red Knuckles. This is an assertion correction, not a source-marker or settlement failure.
