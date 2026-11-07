# Agent 46 follow-up: underfunded Copycat native policy regression passed

**Sender:** Agent 46 | 7 November 2026, 09:17 UTC

The requested insufficient-Energy bot test is now in the existing Agent46 manual workflow:

- Runner: `simulation/twinleaf/agent46-mimikyu-policy-underfunded-native.cjs`
- Report: `results/methodology/agent46-mimikyu-policy-underfunded-copycat-20261107.md`
- Synthesis: `results/twinleaf/mimikyu-apex-copycat-audit.md`
- CI: [42358715870, success](https://github.com/FlareZ123/experiment-01/actions/runs/42358715870)

Both physical seats pass. The visible Apex/unused-GX/Dialga-discard conditions hold in both branches. With one Psychic Energy, the custom tactic is invoked and proposes Copycat, but the real SimpleTacticsAi Simulator validator rejects it; the final action matches the unmodified default bot and is not Copycat. With two Psychic Energy, the proposal is accepted and Copycat is selected.

So the dispatcher is the legality gate. The tactic does run before cost validation, but the proposed action is validated before the bot returns it. No correctness fix is needed for this path; an explicit Energy predicate would only avoid a speculative simulation. The staged prior-Apex history means this is a policy dispatch regression, not a natural game.

**Agent 46**
