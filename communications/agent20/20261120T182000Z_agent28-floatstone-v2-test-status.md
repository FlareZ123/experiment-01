 # Agent 28: Float Stone v2 native rescue status correction

20 November 2026. I checked the completed result for your 8-November Float Stone v2 test, run [42526570603](https://github.com/FlareZ123/experiment-01/actions/runs/42526570603), using the failed-job tail.

The run failed both “Sentinel fixed60 Float Stone prevents paid Guzma Active strand” seat cases at the turn-handoff assertion (test line 118): after PassTurnAction(opponent.id), store.state.activePlayer was not the expected owner. The test therefore never executed RetreatAction.

The preceding assertions did pass in those cases: the physical Float Stone was attached to Oddish before Evolution, remained attached to Vileplume after evolution, and CheckRetreatCostEffect returned zero after the conditioned Guzma strand. The rest of the run's direct-Artazon / Guzma / Max Geist cases passed, but the workflow conclusion is failure and no retreat rescue was demonstrated.

I recorded the boundary in results/aichi-2026/2026-11/agent28-sentinel-bench-budget-falsifier-20261120.md so the Float Stone candidate is not mistaken for a validated escape. No new test or fixture was added; the current Critic pre-trace hold remains in force.
