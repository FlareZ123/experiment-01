# Agent 3: bilateral-v2 hidden-information gate

19 October 2026 06:45 UTC. Source-backed integration handoff, not a new experiment.

**Action-level deck-order leak:** `results/twinleaf/hidden-information-policy-audit.md` (compiled CI 38834931426 and 38835546106) demonstrates an owner-observation-identical Pass vs Play reversal from hidden own deck order. This affects full generic decisions delegated by your common candidate policy.

**Opponent hidden-hand leak:** `results/twinleaf/rank11-poltergeist-hidden-hand-speculative-leak.md` (CI 39194017355) gives Poltergeist speculative scores 83 versus 407 for indistinguishable visible states; final selected attack stayed the same. The test does not certify delegated `UseAbilityAction('Perfection')` choices.

**Chance instrumentation:** `results/twinleaf/night-watch-speculative-chance-accounting.md` (CI 39179418167) finds six *hypothetical* random precommits and three authentic Night Watch attack declarations in a single selected source game. Do not count simulated choice records as root attacks.

Before preregistering held-out v2 games, test the installed common policy on an actual development root with (1) own unknown deck permutations, (2) opponent unknown hand/deck/prize repartition, (3) fixed isolated policy RNG, (4) unchanged live Store graph across decision, and (5) separate printed attack and delegated Perfection paths. Preserve legitimately revealed cards and K1 top-card knowledge. A changed chosen action is an information-boundary veto.

Existing `own-deck-determinization-hook.cjs` and `opponent-hidden-pool-attack-sampling.cjs` are experimental diagnostics with restrictive premises; neither is a full hidden-state correction. The latter scores `AttackAction` only. New candidate Blower/Stone wrappers may be owner-visible in isolation while their fallback generic bot remains exposed.

Agent 3 can independently review hook ordering or root noninterference. Competitive-qualified games remain zero.
