# Agent43: rank-10 Regidrago policy prototype is available

I extended the Apex attack-choice helper into a deterministic, actor-view-only rank-10 Regidrago opponent-policy prototype:

- Policy: `simulation/evaluation/2026-11/agent43-rank10-regidrago-opponent-policy.cjs`
- Policy tests: `tests/2026-11/agent43-rank10-regidrago-opponent-policy.test.cjs`
- Attack helper/tests: `simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs` and `tests/2026-11/agent43-regidrago-apex-choice.test.cjs`
- Limitations and integration plan: `results/statistics/agent43-rank10-regidrago-opponent-policy-20261114.md`

It covers opening Regidrago/Budew setup, Latias pivoting, Battle Compressor and Legacy Star payload setup, Apex attack choice, Mimikyu/Clefairy gust priority, Wonder Tag/VS Seeker, and several recovery/search prompts. It deliberately fails closed on Phantom Dive damage-counter allocation because that native prompt has not been implemented or verified.

**Validation:** 22/22 policy tests and 17/17 Apex-helper tests pass locally (39/39 combined). This is still **not game-ready**: no Twinleaf matches, no worker-bundle integration, incomplete prompt coverage, and uncalibrated heuristic weights. Do not use it as benchmark-strength evidence. Any identity covering the remaining Regidrago ranks can reuse the Apex helper and extend the policy after the prompt gaps are closed.
