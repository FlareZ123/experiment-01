# Agent 8 research memory

## Identity
Normal mode draw was 8, run_id 92c32920-5f04-4f7d-96a5-19a152e18e94, claimed `agents/agent8/.lease.json` at 2026-10-15T22:40:38Z; original claim commit 1e0cdf414efb04fa735601ad1c0c2532621061b7. **Do not refresh lease.** Original 70-minute release time 23:50:38Z. Shared repo `FlareZ123/experiment-01`, default `main`. Initial user request: execute prompt.md in Chat mode, no Work.

## Research completed and published
1. `simulation/evaluation/field-benchmark.cjs`: conservative exact-printing resolver and opponent field plan for 32 ranks, simulated trials balanced across seats with reproducible seeds, draw/timeout/error outcomes, one-sided exact Clopper-Pearson confidence bound. `tests/test-aichi-field-benchmark.cjs` and manual workflow `.github/workflows/aichi-benchmark-stats.yml` passed CI run 38819273749. This is not gameplay evidence and upstream bot policy remains weak.
2. Official Japanese Expanded banned identities applicable to Aichi event: site https://www.pokemon-card.com/rules/regulation/index.html, Expanded section dated 2026-02-19; new Medicham V ban effective 2026-02-20 per https://www.pokemon-card.com/info/005353.html. `results/legality/japan-expanded-aichi-2026.json` transcribes all 27 listed identities; `results/legality/README.md` explains caveats. `scripts/japanese_expanded_audit.py` checks precise abilities/attacks and two mutual-exclusion Supporter families against English printings. `tests/test_japanese_expanded_audit.py` and manual workflow `.github/workflows/aichi-jp-legality.yml` passed CI run 38819926100. Field audit found 973 rows/1709 physical slots no banned name; 16 rows/31 slots with names shared by prohibited Pokémon but **different legal card identities**; 0 listed banned identities and 0 indeterminate collision matches. Main examples: Marshadow UNB81 Resetting Hole versus banned Let Loose; Unown AOR30 versus banned HAND/DAMAGE; Duskull PRE35 versus banned Spiritborne Evolution. **This is a ban-identity audit, not comprehensive Japanese paper legality.**
3. Communicated to Agent 2 at `communications/agent2/2026-10-15T224700Z_agent8_evaluation-protocol.md`, and Agent 1 at `communications/agent1/2026-10-15T225200Z_agent8_japanese-banlist.md`.

## Important repository context
- 32 Aichi 10 May 2026 placements; 29 full published lists in `results/aichi-2026/full-decklists.json`. Missing ranks 23, 25, 28. No measured games/win rates. Baseline rank1 champion Shadow Rider Calyrex is not optimized.
- Agent 1 handling English card-data mapping; 923 of 989 source rows matched by English snapshot, 66 coverage gaps.
- Agent 2 built Twinleaf headless runner and initial one hundred action smoke, which did NOT finish a game. Adapter uses upstream SimpleTacticsAi whose internal move validation assumes ALL_HEADS/NO_SHUFFLE, a serious policy reliability gap. `simulation/twinleaf/card-coverage.cjs` now includes strict prism symbol alias logic; our benchmark index does not yet reuse it.
- Agent 3 ingested 29 source lists. Another researcher committed `scripts/aichi_evidence.py` and `results/aichi-2026/evidence-protocol.md` with two-sided simultaneous Bonferroni intervals, including upper bound 29/32 on fully unverified missing opponents. Avoid redoing this.
- Repo README forbids per-commit Actions. Use manual-only CI.

## Next high-value work
1. Improve `simulation/evaluation/field-benchmark.cjs` to use verified PRISM_STAR alias rule, support genuinely novel 60-card candidate source instead of published-rank-only candidate, attach cryptographic dataset/candidate fingerprints, and connect a dry-run/pilot to actual Twinleaf coverage.
2. Investigate smarter decision policy and verify completed games, or contribute card/rules fixtures to engine integrations while Agent 2 leads simulator.
3. Formal early-turn lock / prize-card quantitative models from the 29 real decks to guide actual deck optimization, avoiding generic consistency-only optimizations.
4. Keep `results/README.md` syntheses aligned; agent others may edit it concurrently.
