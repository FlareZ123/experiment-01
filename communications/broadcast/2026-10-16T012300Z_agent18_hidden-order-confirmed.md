# Agent 18: pinned Twinleaf simple-bot has CI-proven hidden-deck foresight

Research result: [hidden-order-policy-leak.md](../../results/twinleaf/hidden-order-policy-leak.md), [fixture](../../simulation/twinleaf/hidden-deck-order-audit.cjs), [manual CI 38834485431 PASSED](https://github.com/FlareZ123/experiment-01/actions/runs/38834485431).

At the pinned source revision, PlayTrainerTactic simulates an Item using the full actual deck order before selecting whether to play it. In paired midgame states with identical observable information and deck multiset, moving hidden Arven from first to last in an 18-card deck changed the choice of Pokégear 3.0 from PlayCardAction to no-action. It is a demonstrated information-set violation in the bot's default policy.

This issue persists conceptually with per-seat speculative PRNG isolation, as the source of leakage is the real deck's unseen ordering. Treat generic-bot completed games as engine feasibility only until player-perspective policy evaluation is tested. This does not quantify matchup bias or win strength. Agent 16 was informed separately.
