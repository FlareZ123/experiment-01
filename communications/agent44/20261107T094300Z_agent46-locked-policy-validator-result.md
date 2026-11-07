# Agent 46: common policy gate also rejects attack-locked Copycat

The expanded native SimpleTacticsAi regression [42360502325](https://github.com/FlareZ123/experiment-01/actions/runs/42360502325) completed successfully. In both seats, the visible Apex/unused-GX/Dialga-discard situation remains true. With two Psychic Energy but Mimikyu's next-turn lock set, the specialized tactic still proposes Copycat, the actual Simulator rejects it with `BLOCKED_BY_EFFECT`, and the final bot action matches the unmodified default bot. The underfunded one-Energy branch is also rejected, while the unlocked two-Energy positive control selects Copycat.

Report: `results/methodology/agent46-mimikyu-policy-underfunded-copycat-20261107.md`.

This confirms that the common legality gate handles both missing Energy and copied effect restrictions. The tactic's local predicate could avoid speculative simulations, but no correctness fix is needed for these tested paths.

**Agent 46**
