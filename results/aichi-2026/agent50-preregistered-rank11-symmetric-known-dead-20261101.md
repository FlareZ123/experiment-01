# Agent 50: eight genuinely new rank-11 source deals, both-seat attack-choice policy comparison

**Registered 1 November 2026 at 18:51:52 UTC before observing any gameplay from these new seeds.** Native Store research on original rank-11 Absol/Garbodor, two existing unchanged candidate sixties, two intervention policies, 32 scheduled games. Zero competitive-qualified games at registration.

## Experimental design

Registration: [`registrations/agent50-prospective-rank11-bilateral-known-dead-20261101.json`](registrations/agent50-prospective-rank11-bilateral-known-dead-20261101.json), initial immutable seed commit `30378d011fc75c404e2599d039a7a325c5de35a5`. Python `secrets.randbits(32)` sequential independent uniform draws, accepted first **two projected heads and two projected tails per physical candidate seat** under the pinned `seededRandom` first xorshift32 output. All **12 drawn values** retained in registry, including **four rejected excess-stratum draws**. No game outcomes or simulator requests preceded the original registration.

| Candidate physical seat | Selected projected tails (seed) | Selected projected heads (seed) | Source physical seat |
| --- | --- | --- | --- |
| A, candidate seat 0 | `1550013320`, `2680168583` | `1068765975`, `4039884054` | 1 |
| B, candidate seat 1 | `1767975561`, `3831234043` | `3831821809`, `1131666043` | 0 |

The engine's native accepted setup coin, choice, first draw and actual start must confirm every projected first seat. For each of eight exogenous physical seed groups, hold rank-11 exact original opponent printing and original seed fixed; play both the unchanged champion-reference and New Moon candidate 60s under (1) historical frozen v2 policy option set and (2) the same option set with **one extra `bilateralKnownDeadAttackRoot:true` option applying identically to both players**. This yields **8 groups × 2 printed candidate 60s × 2 original-Store policies = 32 native game attempts**. Each baseline/treatment pair must prove identical source deck, candidate deck, initial physical full-deal SHA, source deal SHA and actual starting seat.

Allow all action-cap, paper-integrity failure, prompt failure, engine abort, and complete game outcomes; never select or regenerate seeds after observing execution. The source profile’s old frozen transitive closure cannot certify this new option. Explicit registration pins original roster and both central source modules by Git Blob SHA and the unchanged upstream Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Reproducible files and CI

- Generator/strict real Store wrapper: `simulation/evaluation/agent50-prospective-rank11-bilateral-known-dead-native.cjs`.
- Reusable paired public root, attack, first-source-response, physical-prompt receipt comparison: `simulation/evaluation/agent50-rank11-bilateral-known-dead-native-pair.cjs`.
- Precommit, native-setup and eight-count regression tests: `tests/agent50-prospective-rank11-bilateral-known-dead-native.test.cjs` and `tests/agent50-rank11-bilateral-known-dead-native-pair.test.cjs`.
- Reuses **existing manual-only** `.github/workflows/aichi-benchmark-stats.yml` via `agent50_fresh_rank11_bilateral` flag; default is off. Full raw output uploaded on failure or completion.

## Preserved integration failures

1. [Native run 41339286445](https://github.com/FlareZ123/experiment-01/actions/runs/41339286445) failed before playing a game: registered trials had a noncanonical string ID. Source driver requires `rank:repeat:seat:candidateId`. Corrected ID and regression added, with seeds unchanged.
2. [Native run 41339545218](https://github.com/FlareZ123/experiment-01/actions/runs/41339545218) executed two 16-arm native batches, then failed to assemble a paired report because a postgame helper incorrectly asserted Map cardinality four. No game outcome packet was emitted to the investigator and the new seed groups were kept unchanged. Fixed helper cardinality and added a 16-arm regression. Registration records both analytical amendments with the earlier blob IDs and never overwrites the original random draws.
3. [Native run 41340025588](https://github.com/FlareZ123/experiment-01/actions/runs/41340025588) was dispatched after that repair. **Its eventual outcome is to be read from the run and its complete archive, not assumed here.**

## Qualification boundary

The study measures how the same public-actor native attack-choice repair affects results on uninspected, prospectively selected **rank-11 source seeds**. Even if every native Store attack, Prize, setup and card-custody receipt passes, the general bot still lacks a complete hidden-information-safe policy, native Night Watch paper-random fulfillment, universal paper-prompt correctness, and the official 25-minute game clock. It represents **one** of 32 opponent rankings, with just two candidate sixties. Native outcomes are developmental observations only. Full benchmark still needs three exact original sixties and currently has **zero** competitively qualified games.
