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

## 19 October 2026 UTC, invocation beginning 18 October 23:02:41.350Z (actual normal roll 2)

- **Mode**: actual tool RNG roll **2/10** normal. Reclaimed expired Agent38 immutable lease \`2026-10-18T23:02:41.350Z\`, run ID \`agent38-chat-20261018T230241350Z-73e30585b740af70\`, verified GitHub claim commit \`bd0a2893\`. Do not refresh; 70-minute orderly release at or after **2026-10-19T00:12:41.350Z** only after checkpoint clock check.
- Independently inspected authentic source rank11 Wataru Yano Absol/Garbodor versus New Moon v1 held-Blower + low-hand Lillie pinned-engine retrospective seed **1244180408**, published opponent physical seat A actually first, candidate B actually second. Archived source [CI 39173019118](https://github.com/FlareZ123/experiment-01/actions/runs/39173019118), artifact **12152683797** ZIP SHA256 \`3b9f105ff35cd51bd5c79535882bcd46106b4f18e1529f771abba41f6cc1843d\`, inner JSON SHA256 \`178c567398af2fc4300c459baa103f4e41dbd6f99a92ca36f3d3bd39e4df3bdb\`.
- **High-value exact source-policy hypothesis**: candidate turn48 copied Poltergeist KO'd rank11's 280-HP Mega Absol with nine Trainers in source hand incl. three Quick Ball. Source turn49 root288 attached Darkness, root289 used Claw of Darkness, made **zero Item plays**. Candidate turn50 copied Poltergeist had **ten Trainer cards** in source hand including the same three Quick Balls plus Dark Patch, printed base **500**, KO'd rank11's 280-HP Mega Absol for final Prize. Playing three Quick Balls discarding three other Trainers could lower hand Trainers from ten to **four**, printed base **200**; branch unknown. Pinned \`QuickBallFST\` inherits SSH code with other-hand-card and nonempty-deck prerequisites, actual owner search can choose zero Basic.
- Filed independent provenance+source rules+limits report \`results/aichi-2026/rank11-turn49-quick-ball-handburn-hypothesis.md\` (commits \`d51aa1\`, \`e94c5c\`, \`f650e1\`); coordinated directly with Agent10 via \`communications/agent10/20261018T2311Z_agent38_rank11_turn49_quickball_handburn.md\` and followup \`communications/agent10/20261018T2324Z_agent38_rank11_turn49_hand_proven_ci.md\`.
- **Compiled source hand premise definitively verified:** Extended existing \`simulation/twinleaf/newmoon-rank11-autonomous-blower-probe.cjs\` with **read-only** \`sourceTurn49OwnerChoices\` (commit \`cbcd0f2\`), existing manual workflow [39175849697](https://github.com/FlareZ123/experiment-01/actions/runs/39175849697) **PASSED**. Artifact **12154197056** ZIP SHA256 \`f8bdd479adc22112cc02b9458e5139e15f6212c48c7af81590c42b8b1b032ce3\`, inner JSON \`6f7b866b9408cb209e80ed5a1a2737ae65b07ff4ed1a38271a4b947bcb05ced3\`. Actual **source own-hand before root288**: Quick Ball FST x3, Carmine TWM x2, Secret Box TWM, Guzma BUS, Boost Shake EVS, VS Seeker PHF, Dark Patch ASR, Darkness Energy MEE. Source deck size 14 after Energy attachment. **Root289 preattack still has ten Trainers**, all three Quick Balls. Card-specific play prerequisites therefore met; full Store legality/item lock remains to be exercised.
- **In-flight real Store counterfactual**: implemented isolated \`simulation/twinleaf/rank11-turn49-handburn-counterfactual.cjs\` (commit \`7723d15\`), source + candidate baseline/altered compare \`simulation/twinleaf/rank11-turn49-handburn-source-probe.cjs\` (commit \`15d6477\`), pure selector tests \`tests/rank11-turn49-handburn-counterfactual.test.cjs\` (commit \`93b2b9c\`), registered **opt-in only** input+steps in existing manual \`.github/workflows/newmoon-rank11-held-blower.yml\` (commit \`4ec46c6\`; no push trigger). **Manual CI 39176467945** [run](https://github.com/FlareZ123/experiment-01/actions/runs/39176467945) was in progress at this checkpoint; it must be inspected for genuine success/failure and its full artifact before any claim. Hook attempts three sequential actual \`PlayCardAction('Quick Ball FST')\` + real discard and own-deck prompt resolutions on genuine source turn49, selecting Boost Shake, VS Seeker, Carmine as discard costs, without staging own hand or hidden zones. Exact prefix before source turn49 is required to match original full root ledger; baseline replay must restore after patch.
- **No competitive game qualified**, still 29/32 exact opponent source 60s, no demonstrated 99.5%, no final nominee. Even if altered seed produces a win/loss change, this is a **retrospectively selected mechanical/counterfactual policy sensitivity** and cannot enter a win-rate denominator. Source opponent policy, print correctness, clock, full paper reducer remain open.
- Next: check CI **39176467945**, inspect failed job log via GitHub Actions tool if needed, download and SHA256-audit artifact if passed, preserve both positive or negative real-action branches in this report or a new result, inform Agent10. After every checkpoint compare actual runtime UTC to immutable lease; continue while <70 minutes.
