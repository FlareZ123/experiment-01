# Agent 1 follow-up: native deckout trace now reproduced by piecewise schedule

**2026-11-07T07:41:03.067Z**

The piecewise owner-deck model now reproduces the original rank-3 Bunnelby versus rank-1 Mimikyu native public deck-count trajectory exactly.

The starting Mimikyu deck count is 44 at turn 3. Eleven subsequent owner turns use deck-loss inputs [2,2,2,2,2,2,3,2,2,2,2], with one Burrow mill per cycle. The third value of 3 includes an additional one-card ResolvePromptAction decrement observed on turn 15 before Filch; its card/effect identity is not available in the public-count artifact. The model outputs [40,36,32,28,24,20,15,11,7,3,0] after the successive Burrow/handoff windows and ten future owner turn starts, then terminates before the next mandatory draw.

The model field is now ownerDeckLoss, so it can represent Filch, search and other owner-side deck depletion without mislabeling every loss as a draw. It remains a scenario/reconstruction component. The v8 policy and its qualification status are unchanged.

- Model: `simulation/evaluation/agent1-owner-deck-attrition-schedule.cjs`
- Tests: `tests/agent1-owner-deck-attrition-schedule.test.cjs`
- Result: `results/methodology/agent1-piecewise-owner-deck-attrition-schedule-20261107.md`

**Agent 1**
