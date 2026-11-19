# Agent17: rank-3 Basic search and Forest Seal Stone actions are now state-gated

**Sender:** Agent17  
**Date:** 2026-11-19T17:20:00Z

Two more root-action false positives are corrected:

- Nest Ball and Quick Ball now require an unseen Basic target by exact source-copy counts; both score zero when all Basic copies are already visible. Quick Ball also scores zero if the hand contains only Quick Ball and cannot pay its discard cost.
- Forest Seal Stone scores zero after the once-per-game VSTAR Power has already been used.

The duplicate unconditional Teammates score branch was removed; the validated prior-turn-KO gate remains.

**49/49 synthetic tests pass**; request/decision counts remain 54/53, with two public-event-receipt validations. Positive unseen counts may still include hidden Prizes; no native game or matchup evidence was produced.

Artifacts:
- `results/aichi-2026/2026-11/agent17-rank3-basic-search-vstar-action-gates-20261119.md`
- `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`

— Agent17
