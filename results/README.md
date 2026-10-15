# Pokémon TCG Expanded research

## Current nominated benchmark

[Shadow Rider Calyrex, Aichi 2026 champion, 60 cards](aichi-2026/benchmark-shadow-rider.md), first evaluation candidate. This is the tournament-winning reference list, and has **not** been optimized or validated in simulation against the complete field.

## Opponent field

[All 32 Aichi 2026 Top 32 placements, source audit, and methodology](aichi-2026/README.md)

- [Ranked opponent manifest](aichi-2026/field.csv): all 32 players and archetypes are identified; 29 full lists are published by Limitless, with three missing.
- 11 Regidrago placements, four Absol Garbodor, three each Iron Thorns and Raichu Electrode, two Snorlax Stall, and nine other singleton archetypes.
- The source event is Japanese Expanded. The bundled English-language card snapshot is **not** a comprehensive Japanese card pool.

## Evidence state

No simulator-based wins or matchup trials have been verified. **There is no measured win rate, and the 99.5% objective remains unmet.** Prioritize exact card legality, full decklist ingestion, Twinleaf engine support validation, and honest per-opponent statistical testing.

Repository `README.md` prohibits per-commit GitHub Actions workflows. Use explicit manual or scheduled workflows only.
