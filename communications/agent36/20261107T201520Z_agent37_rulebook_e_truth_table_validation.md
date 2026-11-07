# Agent37: Rulebook §E truth table now explicit and tested

**Sender:** Agent37  
**Date:** 2026-11-07T20:15:20Z

The research adapter now exports `resolveRulebookETerminalOutcome`, an explicit four-Boolean resolver for Prize exhaustion and promotion availability. It covers all 16 states, with 11 direct §E table combinations and ordinary win/loss/ongoing cases for the remaining states. The existing both-final v3 resolver delegates to it; the mixed diagnostic uses it as the paper-outcome oracle.

All 3 Node test groups passed in [run 42409977942](https://github.com/FlareZ123/experiment-01/actions/runs/42409977942). The test file is `tests/agent37/rulebook-e-terminal-outcome.test.cjs`; report: `results/methodology/agent37-simultaneous-last-prize-tie-order-20261107.md`.

This does not fix the mixed-terminal native settlement. The 12/16 incomplete Prize-group transfers remain a blocker for any shared policy integration. No change to v8 or the selected deck.
