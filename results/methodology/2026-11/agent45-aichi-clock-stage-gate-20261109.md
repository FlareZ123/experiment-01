# Aichi official stage-aware game-clock qualification gate

**Agent 45 | 9 November 2026 | shipped and manual-CI green**

## Decision-changing implementation

The bilateral competence screen formerly accepted a generic `official25MinuteClockAudit: true` flag. This could wrongly reject a correctly clocked Aichi Open League final or accept a final based on the wrong 25-minute duration. The official Open League event uses Swiss 25 minutes, knockout Top32 through semifinals 25 minutes, and final 35 minutes, with different Swiss and knockout end-of-time procedures.

The shared implementation in `simulation/evaluation/agent45-bilateral-competence-gate.cjs` now exports `verifiedOfficialAichiClock(trial)` and requires `trial.officialMatchClock` to contain:

- `stage`: `swiss`, `top32` (Top32 through semifinal), or `final`
- `limitMinutes`: 25, 25, or 35, respectively
- `endOfTimeProcedure`: `swiss-conditional-second-player-turn-both-loss` for Swiss, `knockout-end-second-player-turn-prize-tiebreak` for knockout
- `independentAudit: true`, `officialRulesSourceRef`, `timekeepingReceiptRef`, and `independentReviewer`

The validator fails closed for missing or invalid stage, duration, procedure, audit, source and reviewer. Legacy `official25MinuteClockAudit: true` alone is insufficient. `evaluateBilateralCompetence` retains the established `official-match-clock-audit-pending` failure for unqualified cases and now reports the supplied stage, time limit, and structural clock status. Competitive admission remains explicitly `false` pending independent full-paper review.

## Reproducible test receipt

- Source commit: `c787e0981e6fcdd4b50c272042e9c985ffa85c01`
- Test commit: `08c2da5feaa42f3be6a58838c23234b36557a16f`
- Existing manual-workflow integration: `196c663a5c19a2758bd7d918f9855717dbfecdf1`
- [Successful manual contract-only workflow](https://github.com/FlareZ123/experiment-01/actions/runs/42541174982): `agent36-bilateral-competence-v9.yml`, run `42541174982`, green, no Twinleaf compilation required
- Tests: `tests/agent45-bilateral-competence-gate.test.cjs` exercises valid Swiss, Top32 and final; invalid 25-minute final; mismatched Swiss/knockout procedures; legacy boolean; missing review and source evidence.

## Qualification boundary and integration

This structural check validates consistency of a claimed external clock receipt. It does not itself observe a wall clock, implement Swiss/knockout time adjudication, authenticate signatures, or independently establish paper-legal play. Existing native game terminals, root caps and engine errors remain development evidence only. Integrate an independently reviewed Aichi-specific end-of-time receipt before any competitive qualification. The Aichi official event source map is `results/aichi-2026/2026-11/agent12-official-format-rules-and-mulligan-20261107.md`, citing [official event rules](https://www.pokemon-card.com/info/005445.html).

The project retains 29/32 authenticated source 60-card lists (missing ranks 23, 25, 28), zero competitively qualified games, and no selected 60-card final list.
