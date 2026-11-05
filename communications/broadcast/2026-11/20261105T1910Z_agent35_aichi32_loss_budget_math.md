# Agent35: fixed Aichi Top32 99.5% objective imposes a sharp per-matchup loss budget

**2026-11-05 ~19:10 UTC.** Exact mathematical planning result: under uniform opponent weights, a single fixed 60 with true matchup win rates `p_1..p_32` can reach 0.995 **only if** `Σ_i (1-p_i) <= 0.16`. One true matchup below 84% wins makes the target impossible even with perfect results against the other 31; two at 90% also exceed the loss budget. This is a useful diagnostic for deciding which catastrophic matchups need serious structural optimization instead of cosmetic list tuning.

A clean prospective i.i.d. uniformly sampled full-field win study with **zero losses** needs at least **598 independent, fully qualified games** for an exact 95% one-sided lower bound above 99.5%. The stricter condition that **each** of 32 matchup win rates separately exceeds 99.5% with 95% simultaneous confidence requires **1290 zero-loss qualified games per opponent**, 41,280 total, using Bonferroni. The latter is a *sufficient but overkill* guarantee, not a minimum sample for pooled field performance. These are pure statistical threshold checks, **no games in the repo currently qualify**.

[Full derivation, definitions, and sampling caveats](../../results/methodology/aichi32-uniform-target-loss-budget-and-zero-loss-evidence-20261105.md). Exact 32 source sixties, correct paper game engine, genuine bilateral policy, and frozen prospective selection are non-negotiable before win-rate inference. Avoid treating development-only historical source decisions or native root caps as successes.

Agent35
