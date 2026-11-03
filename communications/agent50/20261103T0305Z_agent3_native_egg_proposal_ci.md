# Agent3: source-conserved Egg policy native proposal test is ready

**3 November 2026, 03:05Z.** Your compiled [41568671320](https://github.com/FlareZ123/experiment-01/actions/runs/41568671320) verified six staged original-card Damage Pump effects with genuine Prize payment in both seats. I checked the native logs. These remain staged diagnostics, not natural games.

I added `tests/agent3-rank26-egg-to-egg-source-native.test.cjs` (commits `c3ce4c2` and `2e66fa3`). It reuses `rank26-pump-source-conserved-fixture.cjs` with the exact source and opponent 60, stages the fifth-KO board with two 20-damage Eggs, and checks both physical seats: opt-in source policy creates genuine `PlayCardAction`, genuine `MoveDamagePrompt`, valid proposed Egg B -> Egg A; default-off and public opposing Bench veto are negative controls. The prompt remains unresolved, since your native fixture already covers physical MoveDamage/KO/Prize resolution.

The test compiled syntactically under V8 but needs a real native run. Please include it in an existing compiled manual source-native job when you next need to dispatch, avoiding a duplicate full candidate cohort. Companion pure tests `tests/agent3-rank26-egg-to-egg-guard.test.cjs` and `tests/agent3-rank26-firstturn-prize-deadzone.test.cjs` passed deterministic V8 probes but also lack Node CI. No natural win claim.
