# Native clock episodes: restart-aware, read-only structural validation

**Agent 17, 21 October 2026.** Diagnostic evidence only. The repository still has 29/32 exact Aichi opponent lists and zero competitively qualified game results.

## Motivation

The original compiled rank-6 historical attempt encountered an engine Store clock transition at root ordinal 38 from turn 4 to turn 0. [An independent audit](../twinleaf/agent17-rank6-ordinal38-archive-closure-20261021.md) confirmed the original failed archive retained only the error and lost its full reset metadata. The original run's reset classification remains unknown.

The bundled [Advanced Player's Rulebook](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), E: Win and Loss, describes a Tiebreaker game starting anew with six Prizes for each player when a match requires a winner after a tie. Internal restarts therefore require a different evidence treatment from ordinary in-game turns. The rulebook does not verify what happened in this specific simulator run.

## Pure validation and lineage API

[Source module](../../simulation/evaluation/native-clock-episodes.cjs): `segmentNativeClockEpisodes(native)` verifies chronological root and reset evidence. It checks exact headless protocol markers, a full nonempty root count, root ordinals, integer turns, public actor/action identities, consecutive native turns, and an exact one-to-one relationship between every observed clock reversal and a same-ordinal native reset record. A reset must identify native sudden-death state, entry into setup and before/after phases.

Each recorded root gets an episode-before and episode-after index. The reset-producing root is marked as a boundary. Structural episode count increases at each reset; **outer registered trial count remains one**. `requireOneEpisode(partition, ordinals)` enforces ordered root events in one episode. It rejects any claimed source-pressure, candidate-reply or source-continuation chain that passes through a reset.

This validates public chronology only. A legitimate tournament tiebreak additionally needs independent proof of new shuffled deals and starting order, official terminal semantics and correct paper rules. The module always sets `competitiveQualified:false`.

## Tests and CI

[Six deterministic tests](../../tests/native-clock-episodes.test.cjs) verify valid two-episode partition, stable outer trial count, same-episode lineage, rejection of crossing, unreported reversals, false or duplicate reset records, clock discontinuities, actor mismatch, incomplete reset phases and normal single-episode handling.

[Manually dispatched CI 39521442482](https://github.com/FlareZ123/experiment-01/actions/runs/39521442482) **passed** at `df4abf7`, in the existing `.github/workflows/aichi-global-field-gate.yml` suite. These fixtures certify software behavior; they contain no qualifying simulated game outcome.

## Next steps

Agent 3 can run a clearly labeled pinned diagnostic reproduction that preserves actual same-run root/reset metadata before the existing canonical packet assertion. Agent 41 can use the pure episode validator inside the existing integrated source/reply packet. Any new per-episode result needs original fresh-deal fingerprints, verified round clock/tiebreak adjudication and actor-safe policies before it can enter preregistered fixed-deck win-rate inference. Until then, use the strict single-epoch [raw evidence stopgate](agent17-native-single-epoch-raw-stopgate-20261021.md).

No deck changes or 99.5% win claim are made here.
