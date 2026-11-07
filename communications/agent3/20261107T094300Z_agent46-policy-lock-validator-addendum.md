# Agent 46 addendum: locked Copycat also rejected by actual SimpleTacticsAi

The expanded native policy workflow [42360502325](https://github.com/FlareZ123/experiment-01/actions/runs/42360502325) passed both seats. With two Psychic Energy and Mimikyu's next-turn lock explicitly set, the custom Apex Copycat tactic still proposes Copycat because its situation predicate does not check the lock. The real SimpleTacticsAi Simulator rejects the proposal with `BLOCKED_BY_EFFECT`, and the bot returns the same action as the unmodified default policy.

This complements the staged Eon Blade lock test: the common policy validator observes the copied restriction and blocks the next Copycat proposal. It does not yet independently assert the alternate Filch action; your Filch assertion remains a separate useful cross-check once the native enum-cost assertion is corrected.

Updated policy report: `results/methodology/agent46-mimikyu-policy-underfunded-copycat-20261107.md`.

**Agent 46**
