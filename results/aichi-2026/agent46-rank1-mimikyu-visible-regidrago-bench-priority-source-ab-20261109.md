# Agent46: original rank-1 Mimikyu Bench-priority source A/B (9 November 2026)

**Result:** The narrow owner-hand Bench-priority rule failed to produce an actual native Copycat attack in the registered original rank1 versus original rank10 comparison. This is a negative developmental result on the fixed original printed 60s. It offers a concrete reason to prioritize full search, discard and Energy setup rather than further tuning the isolated Bench heuristic.

## Executed

- Registered before the runner in [the frozen protocol](../methodology/registrations/agent46-rank1-mimikyu-visible-regidrago-bench-priority-ab-20261109.md).
- Source candidate: original Aichi 2026 rank1 Shadow Rider Calyrex full 60. Source opponent: original rank10 Regidrago full 60. Native engine pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. 12 fixed seeds, both physical seats, one baseline and one Bench-priority treatment per seat/seed.
- GitHub Actions [native run 42585454786](https://github.com/FlareZ123/experiment-01/actions/runs/42585454786) succeeded. Its immutable `agent46-mimikyu-bench-priority-source-ab` artifact is preserved. The read-only [artifact audit run 42586998568](https://github.com/FlareZ123/experiment-01/actions/runs/42586998568) extracted that artifact and summarized it without executing any additional games. Two-seat actual Store tests passed.
- All **48 native attempts** and **24 paired same-source starting positions** were retained. Every physical source opening matched within its A/B pair.
- **30 native attempts terminated**. **18 reached the 180-action censoring limit**.
- The treatment's owner-visible tactic generated **7 Mimikyu Bench-placement proposals** across 24 treated attempts; proposals were seen at registered seed/seat combinations `2007978395/1`, `1937982055/1`, `1744110989/1`, `48896019/1`, `1446869584/0`, `1083154278/0` and `595758446/1`.
- The actual native attack traces contain **zero Mimikyu Copycat attacks in either arm**. The tactical trigger has no demonstrated positive counter-attack effect in this sample.
- No qualified competitive paper games or win-rate claims follow. Results are fully limited by the existing native decision policy, action horizon, game engine and single opposing matchup.

## Mechanistic interpretation and next executable work

The earlier staged two-step Copycat/Apex/Timeless-GX fixture verifies mechanics after the needed board is created. Natural source games require additional access: finding the singleton Mimikyu, deliberately getting the selected Dragon printed attack into the owner's discard, attaching two Energy, promoting Mimikyu and triggering the response during the suitable opponent attack window. A Bench-priority policy only acts when Mimikyu is already held and the opponent Regidrago is publicly visible.

The separately preregistered [Fog Crystal owner-search treatment](../methodology/registrations/agent46-rank1-mimikyu-fog-owner-search-preserve-ab-20261109.md) and [Mysterious Treasure dual-axis treatment](../methodology/registrations/agent46-mimikyu-treasure-dual-axis-source-ab-20261109.md) attempt additional real native setup actions while preserving both printed original 60s. Their outcomes must be reported separately; mechanical staged successes remain distinct from source-game outcomes.

The source data, frozen seeds and code are at:
- `simulation/twinleaf/2026-11/agent46-mimikyu-priority-basic.cjs`
- `tests/2026-11/agent46-mimikyu-priority-basic.native.test.cjs`
- `simulation/evaluation/2026-11/agent46-mimikyu-bench-priority-source-ab.cjs`
- `simulation/evaluation/2026-11/agent46-source-artifact-summary.cjs`

**Research status:** An informative negative setup-policy result, zero competitively qualified paper games, zero demonstrated incremental native Copycat actions.
