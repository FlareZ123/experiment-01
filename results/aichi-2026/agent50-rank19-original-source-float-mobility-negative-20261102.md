# Agent 50: original rank-19 Raging Bolt source Float Stone mobility does not achieve an Active attack in four paired native matches

**2 November 2026. Developmental historical comparison; zero competitive-qualified games.**

## Question and causal boundary

Four exact original Aichi rank-19 Mark Takahashi Raging Bolt 60-card matches had 86 recorded original-source owner roots and **zero Raging Bolt ex TEF Active roots** under the frozen bilateral v2 player. Agent 28's original Store census established that in two source-seat-0 games, Raging Bolt was already on the Bench with Double Dragon Energy while Ho-Oh EX DRX remained Active. The source held Float Stone repeatedly without completing a promotion. Earlier properly built native fixtures independently demonstrated a valid Float Stone equip followed by a free retreat into DDE-funded Raging Bolt in both physical seats.

This experiment tests the *existing* source-only `sourceFloatStoneMobility` option in the canonical bilateral runner on precisely these same four previously inspected original-source matches. It tests the feasibility of the complete decision path, rather than treating a prepared-board native retreat as representative play.

## Reproducible paired design

- Source: original printed rank-19 Raging Bolt 60, immutable `results/aichi-2026/full-decklists.json`, including Raging Bolt ex TEF 123, Ho-Oh EX DRX, Float Stone BKT and Double Dragon Energy ROS.
- Opponents: unchanged `champion-reference` and `new-moon-lockbreaker-v1` fixed printed candidate 60s, each in original candidate seats A and B.
- Native pinned Twinleaf commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; canonical `simulation/evaluation/agent41-bilateral-v2-development.cjs`, frozen v2 options `simulation/evaluation/agent41-frozen-bilateral-development-v2.json`.
- Control: v2 unchanged. Treatment: `sourceFloatStoneMobility:true`, preserving every other policy option. This option is scoped to the original-source physical seat. The native Store physically settles all selected actions; the separate observer reads original Store owner roots without intervening in decisions.
- All four source-deal SHA-256 fingerprints matched exactly **within each frozen source/candidate trial**. All eight attempted native arms are retained, including engine terminals and any caps/errors.
- Repeat metadata and exact registered seeds inherit the already observed Agent 25 rank-19 alias retrospective; these are intentionally **not independent or preregistered performance samples**.

## First successfully compiled native paired result

[GitHub Actions 41408734499](https://github.com/FlareZ123/experiment-01/actions/runs/41408734499) succeeded, and [artifact 13124084613](https://github.com/FlareZ123/experiment-01/actions/runs/41408734499/artifacts/13124084613) archives the eight raw paired rows (ZIP SHA-256 `a410f8071c6c1f96de3972f9e0839ff62ee0b83bc088d09a5301f01d0ff32e63`). Exact four source physical deal comparisons passed.

| Exact trial | Control funded Raging Bench roots | Treatment funded Raging Bench roots | Control held Float Stone at funded Ho-Oh roots | Treatment held Float Stone at funded Ho-Oh roots | Raging Active owner roots, control → treatment |
| --- | ---: | ---: | ---: | ---: | ---: |
| rank19, candidate seat A, champion | 0 | 0 | 0 | 0 | 0 → 0 |
| rank19, candidate seat A, New Moon | 0 | 0 | 0 | 0 | 0 → 0 |
| rank19, candidate seat B, champion | 22 | 19 | 12 | 1 | 0 → 0 |
| rank19, candidate seat B, New Moon | 35 | 22 | 23 | 1 | 0 → 0 |

All eight arms ended as **untimed native engine terminals**, and none declared `Bellowing Thunder`. Reduced repeated held-Float roots demonstrate a policy-sensitive physical-game trajectory, but do not establish successful attachment, legal promotion or a source attack. A held card counted at many owner roots is one card carried across roots, rather than many independent opportunities.

## Independent native Energy fixture correction

The older Agent 50 staged Bellowing test incorrectly populated `PokemonCardList.energies.cards` without placing the **same Energy objects** in `PokemonCardList.cards`, causing its native payment prefab to see zero available Basic Energy. The repaired `tests/agent50-raging-bolt-nominal-ko.native.test.cjs` now populates both indices with shared card identity and requires a native owner-owned `DiscardEnergyPrompt`, nonzero decoded legal Basic discard, physical Energy move to owner's discard, and defender damage **90 → 160** in both native physical seats. [Compiled passing run 41408734499](https://github.com/FlareZ123/experiment-01/actions/runs/41408734499) includes these paid-attack positive controls and a six-card Burst Roar draw positive control. The old malformed-fixture logs remain historical failure evidence, not a known game-engine attack defect.

## Independent read-only Tool-index audit issue

The original rank-19 source observer read attached Tools as `player.active.tools?.cards`, whereas the pinned native `PokemonCardList.tools` is an **array**. This silently produced zero attached Tool observations. Agent 50 corrected the observer to use `player.active.tools.map(...)` and added a pure Tool-array regression `tests/agent50-rank19-native-original-tool-census.test.cjs`. Any prior zero-Float-attached source census must be reevaluated from the corrected native observer. The first passing paired result above was executed **before** this observation correction, so its negative Active and Bellowing counts are unaffected, but historical attached-Tool counters were not reliable.

## Interpretation and next necessary proof

The original four deals expose two structurally different failure categories. In source-seat-1 games Raging Bolt never reaches the Bench at any source root. In source-seat-0 games it is Benched and funded, but the selected Float Stone policy still yields zero source Raging Active root. A fresh native audit should distinguish a physically attached Tool from an attempted or rejected root, establish the real Ho-Oh Energy/retreat clock after attachment, verify whether any actual `RetreatAction` was selected and settled, and compare the next source-owned root and opponent reply. No legal AttackAction / nonzero Bellowing chain has been observed in an authentic source match.

These data demonstrate source-policy limitations and a formerly malformed native fixture. They **do not measure win strength**, certify either player's decision quality, or promote one fixed candidate 60. Benchmark remains **29/32 authenticated original Top-32 source 60s, zero paper/clock-qualified games, no validated 99.5% win rate**.

### Reproduction files

- `simulation/evaluation/agent50-rank19-float-stone-paired-development.cjs`
- `tests/agent50-rank19-float-stone-paired-development.test.cjs`
- `simulation/twinleaf/agent28-rank19-native-source-root-readonly.cjs` with explicit attached Tool array correction
- `tests/agent50-rank19-native-original-tool-census.test.cjs`
- `tests/agent50-raging-bolt-nominal-ko.native.test.cjs`
- Existing manually dispatched `.github/workflows/aichi-dusclops-self-ko.yml`

All released tests and observations remain default-off in the natural shared field policy. No on-push workflow was created.


## Corrected attached-Tool remeasurement, same exact original-source deals

The corrected active Tool-array observer and new pure test passed in [compiled manual run 41409207827](https://github.com/FlareZ123/experiment-01/actions/runs/41409207827), [artifact 13124324298](https://github.com/FlareZ123/experiment-01/actions/runs/41409207827/artifacts/13124324298), ZIP SHA-256 `bf7ae5a1f066aeff6cc4da1f47264ec1ccd6df1e0d231bee28c57b648537c4b1`. All four original-source physical fingerprints matched their frozen comparison partner, with 8/8 native engine terminals, zero Bellowing and zero Raging Active owner roots.

Crucially, each source-seat-0 **treatment** game recorded **one original-source owner root with Float Stone actually attached to Active Ho-Oh** while Raging Bolt remained Benched and funded. Each corresponding baseline recorded zero such attached-Tool owner roots. The earlier repeated-held counts fell from 12→1 and 23→1, but an actual promotion still did not happen before game termination. This establishes a real Tool attachment on the tested sources, and narrows the remaining defect to the *continuation after attachment*: owner retreat clock, Source Store acceptance, another competing decision, or an intervening loss of the position. It does not establish which of those explanations is correct.

At the first five funded-Ho-Oh owner roots in the treated seat-0 games, Ho-Oh had **zero attached Energy**, `retreatedTurn=0`, and no Tool. The later observed attached Float Stone root must therefore be inspected in its actual chronology. The follow-up source-root action ledger is being preserved separately to distinguish these stages without conflating repeated owner roots with turns.
