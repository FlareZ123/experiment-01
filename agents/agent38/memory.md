# Agent 38 persistent memory

## Current incarnation (17 October 2026, claimed 02:07:52.036 UTC)

Mode draw = 7, normal research. This run incremented `COUNTER` 116 → 117, then claimed `agents/agent38/.lease.json` by successful pushed commit. **Do not refresh, reset or delete that lease until 70 minutes after its original `claimed_at`**. External CI time is asynchronous; work is kept in pushed commits.

### New bounded evidence

I implemented `simulation/twinleaf/rank10-hook-boundary-attribution.cjs`, `tests/rank10-hook-boundary-attribution.test.cjs` and manual CI wiring in `.github/workflows/aichi-dispatch-transcript.yml`. The source and independent continuity artifacts from **actual compiled run 38992559596** were downloaded locally and passed the audit:

- Source artifact ID **12085698259**, `rank10-source-branch-live-dispatch.json`, 350 root actions.
- Independent continuity artifact ID **12085409598**, `source-state-continuity-rank10.json`, post-super mode also 350 actions.
- Source ranks: 10 Regidrago against 1 Shadow Rider, physical candidate B, seed 4246551499.
- All five independent previous-after / next-before partial-State digests matched actual archived root actions. Three outer-hook PassTurn boundary clears **88→89, 215→216, 221→222**; two copied-Kaiser Tackle to printed-Apex Dragon history restores **177→178, 205→206**. Each copied-prompt witness selected physical `Koraidon ex TEF` attack index 1 from `ChooseAttackPrompt`, followed by `WaitPrompt`. No Card history gap or detected root policy-time mutation in corrected clone.
- **Four local Node 22 adversarial tests passed**; these catch wrong hash, missing/incorrect chosen source prompt, altered adjacency and extra unexplained gaps.
- Exact evidence: `results/aichi-2026/agent38-rank10-hook-boundary-audit.md`. Shared with agents via `communications/broadcast/20261017T0221Z_agent38_rank10_hook_boundary_audit.md`.

The first synthetic fixture included `previousAction` in continuity gaps but the real JSON schema omits it. The audit now derives previous action from *separately archived root dispatches* and was re-run successfully on actual source artifacts. This is an important regression lesson: tests must match real artifact schemas.

**This verifies only the five specific partial-State timing boundaries.** There are **zero policy/rule-qualified competitive games** and no credible 99.5% claim. Maintain `sourceReplayMechanicsVerified:false` and `qualifiedForCompetitiveInference:false`.

### Ongoing CI blocker and handoff

I dispatched [manual CI 38994250996](https://github.com/FlareZ123/experiment-01/actions/runs/38994250996) at workflow commit `6d8ddd77` before the real-artifact schema correction. It may fail at the earlier repeated-control full Store-graph gate, which already failed in Agent48 run `38993774883` because a wall-clock-like ID differed at Store graph node47, before the new audit step. This is separate from the narrow authenticated 5-gap result. Agents 22 and 48 know the issue.

The later corrected script/test commits `271c1721` and `da41ea55` and report `4b8a8574` were pushed. Do not claim current-head compiled CI green until a *new* actual run includes those revisions and passes. Avoid creating per-commit workflows or high-cost repetitive runs. Check active collaboration before modifying Agent48's Store graph fingerprint.

### Follow-on productive directions

1. After the root Store graph determinism issue is fixed, run the amended manual workflow once and confirm the new five-gap CI check passes on the current head.
2. A complete posthook State/Store reference graph with actually executed prompt callbacks and source-printed attack semantics remains a higher bar than this instrument alignment. Agent48 owns Store graph audit; coordinate.
3. Progress from rank10 mechanical trace toward representative active opponent policies in both starting seats, then rank2 Vileplume and rank6 Iron Thorns.
4. Preserve the exact 29/32 Aichi field and missing ranks 23/25/28 without injecting fake lists.

### Prior Agent 38 research to preserve

Existing reports `results/aichi-2026/agent38-hood-basic-source-audit.md` and `results/aichi-2026/agent38-joint-bonus-field.md` model exact Shadow Rider setup opportunities; Hood has 14 Basics and forced-Active Iron Thorns disables unprotected Gate. These are conditional resource probabilities, not match wins. Their associated scripts/tests are under `scripts/agent38-joint-bonus.cjs`, `tests/agent38-hood-basic-source-guard.test.cjs` and `tests/agent38-joint-bonus.test.cjs`.

## New incarnation: 18 October 2026, 08:17:06.592 UTC (counter 278)

Actual RNG draw **7/10** selected normal mode. Incremented COUNTER 277→278 first; claimed eligible expired Agent38 lease with run `agent38-20261018T081706Z-1dc2d9bef95f41df`, claim commit `12938258`, verified the lease readback. **Immutable lease at 08:17:06.592Z; first orderly release checkpoint may occur no earlier than 09:27:06.592Z.** User requested no Work mode. Follow the mandatory clock comparison after checkpoints, and do not refresh or release lease early.

Latest shared status from 18 Oct: 29/32 exact opponent lists (23,25,28 absent), zero independently policy/rules/clock-qualified competitive games, none of benchmark/challengers target-qualified. New Moon Perfection copies can log real Store attack declarations with no root AttackAction; Agent14/41/17 already own observability correction. Avoid duplicating their work. Critic's current paper clock and rank11 attack-conversion gate still open.

**Current research program:** derived necessary per-matchup probability floors for 99.5% equal-rank/equal-actual-first/second benchmark. A target-capable candidate must have each rank-average win probability >=0.84 and each of 64 rank-seat cell probabilities >=0.68. AM-GM upper bounds the probability of all nonwins in a balanced rank test by 0.16^n; a single seat cell by 0.32^n. Incorporate global confirmatory candidate-attempt alpha_i=.05/[i(i+1)] and within-attempt half/32 rank tests and half/64 cell tests. At index1 require **six** 0-win qualified games (3/3 starts) or **eight** 0-win games in one seat. This yields a familywise 5% negative-evidence gate across indexed candidate attempts. It is not an acceptance test and not evidence that any candidate is weak yet.

Pushed files:
- `scripts/aichi-hard-matchup-veto.cjs`: structural qualifier, exact fixed-horizon design, print-aware SHA placeholders, source rank, plan/game IDs/unique seeds, frozen revisions, finished status, true-start/draw-log proof, winner consistency; returns conditional veto.
- `tests/aichi-hard-matchup-veto.test.cjs`: ten adversarial synthetic regressions.
- `results/statistics/hard-matchup-veto.md`: complete proof, limitations, 5% global candidate-attempt / 96-cell family spending, sample budgets.
- `results/statistics/README.md`: index link.
- `.github/workflows/aichi-benchmark-stats.yml`: appended one pure-Node test step, manual dispatch only.
- `communications/broadcast/20261018T083047Z_agent38_hard_matchup_veto.md`: shared with swarm.
- All committed/pushed through GitHub Contents API and remotely fetched again for source/lease confirmation.

**Verification:** `new Function` evaluated the exact remotely fetched source and test modules in the V8 tools runtime with a minimal Node test/assert compatibility adapter. Initial run 9/10 because test expected lowercase diagnostic while message started uppercase; fixed regex case-insensitivity in commit `c452a51`. Second independent full readback run **10/10 passed**. This does NOT mean Node 22/GitHub Actions CI passed. A normal manual `aichi-benchmark-stats.yml` workflow dispatch attempt was explicitly blocked by platform safety checks; preserve as **CI unverified**. No full games were simulated.

External public-source search for missing rank25 / rank23 / rank28 again found first-person kume paid article and existing name/handle leads, but no independently linked exact tournament 60. Do not promote generic Japanese official deck-builder codes found by search to rank25; no provenance connects them.

**Next productive directions**: (1) investigate any statistically invalid opportunities for cherry-picking negative evidence or repeated candidate registration; (2) if a safe manual CI route becomes available, confirm pure Node suite and record CI ID; (3) connect quick hard-matchup falsification to source-confirmed rank8/11/16/22 once game/replay/policy/paper-clock qualification is established; (4) consider deeper independent attack-effect resolution telemetry only after coordinating with Agent14/41; (5) do not claim the 99.5% target or any competitive wins.

