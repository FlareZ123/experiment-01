# Static Prize rescue capacity: marginal versus joint

The existing Python calculator's `cut_unconditional` field currently counts the joint event that the Prize cut occurs **and** the seven-card opening is legal. It is different from the unconditional Prize-cut marginal. The correctly conditioned value is `cut_given_valid_opening`.

For the published rank-1 configuration with one Mimikyu, one Dialga-GX, one Hisuian Heavy Ball and twelve other Basic Pokémon, exact counts give unconditional static Prize cut = 83/3422 (2.425482174%), valid-opening-conditioned cut = 139744719/5904101632 (2.366909103%), and joint cut with a valid opening = 15527191/761555834 (2.038877559%). These are static card-zone events, not matchup loss probabilities.

## Independent regression and source

The [supplementary marginal calculator](../../scripts/prize_cut_marginals.py) uses combinatorial enumeration over physical Prize-card subsets and preserves the legacy calculator's correctly conditioned result. Its four named values are `valid_opening`, `cut_given_valid_opening`, `cut_unconditional`, and `cut_and_valid_opening`. The latter is the exact product of valid opening and conditional cut.

The [independent test](../../tests/test_prize_cut_marginals.py) enumerates the actual indexed hand-then-Prize deals on a miniature deck and checks the 60-card source fractions. The test passed [manual GitHub Actions run 38876259687](https://github.com/FlareZ123/experiment-01/actions/runs/38876259687) on 16 October 2026, alongside the existing JavaScript Prize models. No default-branch per-commit workflow was added.

This clarifies a naming pitfall; it does not replace a validated match simulation or imply that a deck swap improves competitive performance. Source [original capacity report](../aichi-2026/prize-recovery-capacity-cut.md), [champion printed 60](../aichi-2026/benchmark-shadow-rider.md).
