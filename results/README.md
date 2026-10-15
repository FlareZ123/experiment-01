# Pokémon TCG Expanded research

## Current nominated benchmark

[Shadow Rider Calyrex, Aichi 2026 champion, 60 cards](aichi-2026/benchmark-shadow-rider.md), first evaluation candidate. This is the tournament-winning reference list, and has **not** been optimized or validated in simulation against the complete field.

## Opponent field

[All 32 Aichi 2026 Top 32 placements, source audit, and methodology](aichi-2026/README.md)

- [Ranked opponent manifest](aichi-2026/field.csv): all 32 players and archetypes are identified; 29 full lists are published by Limitless, with three missing.
- 11 Regidrago placements, four Absol Garbodor, three each Iron Thorns and Raichu Electrode, two Snorlax Stall, and nine other singleton archetypes.
- The source event is Japanese Expanded. The bundled English-language card snapshot is **not** a comprehensive Japanese card pool.
- [Verified published opponent lists](aichi-2026/ingestion.md): all 29 published 60-card lists are retained in a source-validated, SHA-checked [archive](aichi-2026/published-name-level.json.gz.b64), with a [Twinleaf-compatible reader](../simulation/twinleaf/aichi-source.cjs). Exact card printings remain unresolved.

## Evidence state

No simulator-based wins or matchup trials have been verified. **There is no measured win rate, and the 99.5% objective remains unmet.** Prioritize exact card legality, full decklist ingestion, Twinleaf engine support validation, and honest per-opponent statistical testing.

Repository `README.md` prohibits per-commit GitHub Actions workflows. Use explicit manual or scheduled workflows only.

## Field-wide evaluation

[Statistical evidence protocol](aichi-2026/evidence-protocol.md) and [exact-binomial evaluator](../scripts/aichi_evidence.py) give all 32 ranked placements equal weight, preserve unknown-matchup uncertainty and use simultaneous confidence bounds. Three missing full lists currently prevent a conservative complete-field lower bound above 90.625%, even if all other placements were won. No gameplay trials have yet been reported.

## Shared evaluation readiness

[Critic's evidence gates and research priorities](aichi-2026/benchmark-validity.md) identify the immediate bottleneck: obtaining finished, reproducible matches with correct printings, game effects and representative Expanded policies. The [32-placement readiness ledger](aichi-2026/readiness-ledger.csv) separates published source coverage from engine validation, policy validation and finished-game evidence. Its initial snapshot records zero verified finished matchup games.

## Simulation tooling

[Agent 2 Twinleaf headless feasibility and caveats](twinleaf/engine-feasibility.md): a manually triggered seeded-engine smoke test compiled and passed on CI, with 100 deterministic actions but no completed match. [Adapter code](../simulation/twinleaf/headless.cjs) and [card-coverage audit](../simulation/twinleaf/card-coverage.cjs) are available. The upstream SimpleTacticsAi remains an inadequate competitive policy for a 99.5% claim.

## Field threat prevalence

[Agent 5: source-counted Budew, Guzma, Ability-lock and support-Pokémon prevalence](aichi-2026/threat-prevalence.md), with [manual CI validation](https://github.com/FlareZ123/experiment-01/actions/runs/38819765338). Among the 29 published lists, 14 include Budew and all 14 also include Guzma; all nine published Regidrago lists include both. These are decklist frequencies, not attack or win-rate probabilities.

[Seat-balanced fixed-deck evidence method](statistics/field-evidence.md) details separate first/second statistical bounds and the difficulty of proving a 99.5% field average. This complements the original Aichi per-placement protocol.
