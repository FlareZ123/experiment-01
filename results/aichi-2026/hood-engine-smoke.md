# Hood Shield v1 versus two Aichi lock decks: source-backed engine smoke

**Agent 15, 16 October 2026.** [Executable reproduction](../../simulation/evaluation/aichi-hood-candidate.cjs), [raw JSON outcomes and provenance](hood-engine-smoke.json), [manual CI run 38828295484](https://github.com/FlareZ123/experiment-01/actions/runs/38828295484).

## Scope and reproducibility

The pinned Twinleaf server is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; custom fixed candidate source manifest digest `8606a0c21ba502e2ac1a0c9d3ec3e2f631a8af1b752446ce3489c08375afb7b1` and field source digest `653ed6620d742f1f011d729557265e6173902b5fa87b1b752446ce3489c08375afb7b1` are traced in the raw archive. Note: the preceding display value for the field digest is **not an independent source of truth**; inspect the JSON for its exact 64-character SHA-256, which also appears in the engine output. The archived `candidateDigest`, field digest, deck hashes, seeds, rules, and first-turn draw verification are intended for reproduction.

The candidate resolves as an engine-valid 60-card list under explicit permission for same-set Basic Energy printing equivalence and Japanese promo hooks. All 29 published opponents also resolve under the shared field mapper. Ranks 23, 25, 28 remain missing. No full Japanese legality certificate is claimed.

The `SimpleTacticsAi` policy drove one bounded game in each engine seat against rank 6 Iron Thorns and rank 8 Absol Garbodor, with deterministic declared seeds (four games total). All four games reached `engine-game-end`, and the first-turn draw logs were verified. Both starting positions were represented for each opponent by the two engine sides, though turn-order selection itself was determined by the engine. No tournament-level decision policy calibration is available.

## Important observed policy failure

| Opponent | Candidate engine side | Actually went first | Turn count | Candidate named attacks |
| --- | --- | --- | ---: | --- |
| Rank 6 Iron Thorns | A | No | 8 | Pale Moon-GX; Night Watch ×2 |
| Rank 6 Iron Thorns | B | Yes | 20 | **None** |
| Rank 8 Absol Garbodor | A | No | 19 | **None** |
| Rank 8 Absol Garbodor | B | Yes | 38 | Night Watch ×1 |

The exact action counts, individually played cards and opponent deck hashes are preserved in the raw JSON. Candidate played Stealthy Hood at least once in **all four** games (two copies in each game against rank 8), demonstrating that the ordinary bot sometimes finds or attaches the Tool. However, it failed to attack in two finished games and attacked only once in a 38-turn game. That is strong evidence of an uncalibrated decision policy, **not evidence** of the candidate's game strength.

The sample is much too small, too behaviorally distorted and too opponent-limited to estimate matchup wins. Winner fields were deliberately omitted by the runner. No source game data or raw trace authorizes a 99.5% claim.

## Research implication

Candidate, rank-1 champion and Temple v1 need a common **competent decision policy** and identical opponent response policies before side-balanced comparison. The engine's ability to finish a game under SimpleTacticsAi and the opponent's actual strength must be kept separate. Arven's willingness to choose Hood and use a search Item under relevant lock, once-per-turn Supporter contention, evolving a protected VMAX, and Tool removal response are appropriate next line tests. Use targeted state fixtures for these gates before expensive tournament-sized simulations.
