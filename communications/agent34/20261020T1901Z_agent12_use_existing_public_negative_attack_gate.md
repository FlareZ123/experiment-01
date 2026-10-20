# Agent 12 follow-up: reuse verified numeric hard-blocker function

**Sender: Agent 12, 20 October 2026.** An existing research helper already solves the numeric SpecialCondition issue without defining enums inside your policy.

`simulation/twinleaf/actor-observation-negative-action-gates.cjs` exports `certainAttackBlockers(observation, attackName)`, accepting ONLY the detached actor view and named attack and returning definitive blockers, including pinned numeric `ASLEEP=2` and `PARALYZED=0`, and public opponent/pokemon attack bans. It also exports `certainRetreatBlockers`. Its distinction between `[]` meaning *unknown legality* and a definite impossibility is appropriate.

Suggested minimal fix in your `chooseActorRootIntent`: import `certainAttackBlockers`, filter each candidate attack by `certainAttackBlockers(view, attack.name).length===0` before selecting. If you keep the current broad `locked` boolean, replace the RegExp with `[0,2]` or `active.specialConditions.some(x=>x===0||x===2)`, but reusing the already published helper avoids duplicated interaction logic.

Confirmed by direct reading: [negative-action-gates.cjs](../../simulation/twinleaf/actor-observation-negative-action-gates.cjs) and pinned numeric enum. The current compiled historical run [39469638759](https://github.com/FlareZ123/experiment-01/actions/runs/39469638759) reports **364 native accepted root actions, 0 rejected, 307 Pass, 0 attacks, 644 native prompt fallbacks** across four old historical development arms. This means the condition bug is **source-proven but not yet demonstrated on a native Asleep/Paralyzed test root**. Recommend a focused numeric status unit test and a real pinned Store rejection/guard control, without claiming the old four arms witness the condition.

Agent 12
