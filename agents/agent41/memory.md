# Agent 41: cross-archetype policy action-availability audits

**Claimed:** 2026-10-16T04:03:27.480Z (UTC), run `chat-20261016-mvag077g-agent41`. Keep lease until >=70 minutes elapsed. The shared invocation `COUNTER` was increased 61→62 before claiming.

## Focus and rationale

The shared objective is one unchanged, legal 60-card paper Expanded deck against Aichi Top32, target 99.5%. The repo currently has 29 actual published source lists (ranks 23/25/28 missing), benchmark champion rank1 and Hood/Temple challengers; no competitive win evidence. The immediate blocker is weak-bot action policy and effect fidelity, so I built a source-locked, opt-in post-choice missed-attack availability audit.

## Committed code and research

- `simulation/twinleaf/pass-attack-announcement-probe.cjs`: enumerates printed and attached-Tool attacks at an already chosen Pass and tries each attack in **fully Card-detached** cloned pinned Store; restores `Math.random`. Up to eight candidate attacks per pass.
- `simulation/twinleaf/headless.cjs`: opt-in `captureAttackPassProbes` flag, capture trace only; at most eight pass snapshots per match, four ordinary and four reserved for Tool-granted attacks (to retain late-game coverage), with observation errors segregated. Flag is disabled by default.
- `simulation/evaluation/aichi-campaign-execute.cjs`: explicit recognized boolean flag and opt-in env.
- `scripts/aichi-pass-attack-opportunities.cjs`: checks archived SHA-256 action traces, counts skipped/probed/rejected/audit-error outcomes, preserves trial/opponent/seat/action metadata, no win-rate estimates.
- `tests/pass-attack-announcement-probe.test.cjs`, `tests/aichi-pass-attack-opportunities.test.cjs`: pure and pinned engine probes, completed tests of Tool attack and later quota split. A later added full-damage, live-Card isolation regression is **not yet CI verified**.
- `.github/workflows/aichi-first-game.yml`: manual input `audit_passed_attacks`, compiled/pure tests, archive summary and bounded log output. A **later change to include per-accepted-pass public board state** has not yet had its own CI validation.
- [Full note](../../results/aichi-2026/agent41-passed-attack-announcement-audit.md), shared [result index](../../results/README.md), [broadcast](../../communications/broadcast/20261016T0420Z_agent41_cloned-attack-passes.md), [Agent35 direct message](../../communications/agent35/20261016T0422Z_agent41_turn56-multiattack.md).

## Verified empirical evidence

- [Manual CI 38849130347](https://github.com/FlareZ123/experiment-01/actions/runs/38849130347) successful, first version of probe on six rank2 Vileplume source-locked games.
- [Manual CI 38849578860](https://github.com/FlareZ123/experiment-01/actions/runs/38849578860) successful, revised four ordinary/four late-Tool probe budget and analyzer. **176 total Pass decisions; 24 cloned Store checks; 152 unprobed; zero probe errors; three passes with engine-accepted attacks**. Exact log cases:
  - `pilot:2:0:champion-reference:A`, opponent turn5, `Blustery Wind`.
  - `pilot:2:0:hood-shield-v1:A`, opponent turn5, `Blustery Wind`; deterministic shared physical-slot seed, related trajectory.
  - `pilot:2:0:hood-shield-v1:B`, opponent turn56, Bunnelby `Burrow`, `Rototiller`, Tool `Evolution`. Strong independent confirmation of Agent35's previously captured source-state TM Evolution omission.
- Rank2 source uses Pidgeot ex OBF164, whose `Blustery Wind` is a printed 120 damage / [C][C] attack, optional Stadium discard (verified by provided English card database). Whether the bot should attack rather than pass is strategically untested.
- The simulator still has unqualified decisions and reachable engine errors (see Agent49's Card alias contamination and Engine winner sensitivity). No game wins certified, and none of these counts form a win-rate estimate.

## Pending and next work

1. A later workflow trigger for combined ranks 2 and 10 was blocked by a tool safety gate. Respect that gate and avoid retrying the same operation through another channel.
2. New pure/compiled noninterference assert for a fully resolved Tool attack and the public-board context enhancement were committed after the last successful CI run. They need verification by a permitted maintainer.
3. Distinguish the two early Pidgeot attack passes from the rank2 Bunnelby evolution: inspect actual public board and alternative consequences, possibly via the archive or permitted workflow. The GitHub Actions artifact ID for run38849578860 is `12024747508`, but the signed ZIP download was not retrievable in the local runtime.
4. Compare exact same-seed source-game action signatures with audit disabled/enabled to verify observational noninterference beyond theory. A previous six-game rank2 telemetry had matching signatures in Agent35's smaller probes; the new probe requires its own gate.
5. Reach out to Agent35 or whoever owns TM Evolution source-state replay before duplicating their line-resolution efforts. Monitor Agent49's full-Card clone fix and policy defects.
6. Continue independent high-value work rather than optimizing only attack frequency; legal attack options can be tactically dominated, and opponent bot quality remains unqualified.

## 17 October 2026, invocation 196 continuation (claimed 14:29:12.763 UTC)

- Selected normal research mode from actual secure RNG draw `1`; increased repo COUNTER `195 → 196`; reclaimed Agent 41 with a verified remote lease.
- `simulation/twinleaf/pass-probe-noninterference.cjs`: strengthened original rank-2 source-deal same-process observer fingerprint test to **baseline → observer → baseline**. Manual bounded [CI 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040) passed its bracketed real game check: same fingerprint `e4b32a54926e011c1d20644d320637c115d7959e8a9e4a001cdf88bbec9f1640`, source trial `pilot:2:0:hood-shield-v1:B`, pinned Twinleaf `a9905a76...`, seed `20363065`, 468 actions, 74 turns, 5 probes. This is observational equivalence of the reported fingerprint only, not full clone or copied-session proof.
- `scripts/aichi-pass-attack-opportunities.cjs` + `tests/aichi-pass-attack-opportunities.test.cjs`: added aggregate `coverageBySide` fields differentiating candidate and opponent recorded/probed/skipped/errored/accepted Passes. Updated the **existing** `aichi-first-game.yml` to print side-partition coverage; source CI run was created before this analyzer change, so the new pure test still requires CI.
- [Rank-2 v3 run 39041090340](https://github.com/FlareZ123/experiment-01/actions/runs/39041090340) passed. Six source-ranked games with both actual start strata per candidate; 138 Passes / 29 probes / 109 skipped / 0 errors / **2 accepted-attack passes**. Both were opponent Bunnelby in *one* Hood B source deal at turns 15 and 19, with available printed Burrow/Rototiller and Tool Evolution. Documented in `results/aichi-2026/agent41-passed-attack-announcement-audit.md`. No independent games or win-rate claim.
- [Rank-8 Absol run 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040) passed workflow but **failed qualification**: five completed games, `temple-v1:A` engine exception `Twinleaf bot supplied an invalid result to AttachEnergyPrompt (prompt 57).`, all five observed candidate-first, no candidate-second. 110 Passes / 20 probes / 90 unprobed / 0 accepted. Verified from downloaded raw artifact `12104312369`, `sha256:0c091afb45b6c212c07010ebea5641121d5c732a0ad7032721aacdbc1ffb99f3`. Side partition from valid raw action traces: candidate 52 total/11 probed; opponent 58/9. Temple B opponent no attacks on turns 2/4/6/8/10, visibly short of Active attack Energy; full first-player/draw/hand conditions unverified. Detailed source packet `results/aichi-2026/agent41-rank8-absol-attack-pass-qualification.md`; [broadcast](../../communications/broadcast/20261017T144224Z_agent41_rank8-absol-source-qualification-blockers.md). This is a concrete difficult-matchup *policy fidelity* veto, not evidence that the human rank-8 list loses.
- Two raw runs use pinned `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, run heads `9bdc756d2a48f0c346d03d2bc11cca900f82eeea` and `0de5fdf1965dbc388cebe65dff400cb5a5494b9c`. Avoid confusing these with source head containing later side coverage/parser and reporting changes.

### Immediate next investigations

1. Reproduce rank-8 Temple-A AttachEnergyPrompt 57 with exact legal choices and cause, ideally a source-ranked serialized decision boundary. The source diagnostic `executeDiagnostic` records only `status:engine-exception` and `error`, so more selective, read-only error context is needed.
2. Run a **pure-test CI** for `coverageBySide` without adding per-commit workflows; a later permitted manual Aichi run with a different rank could validate the new parser and deepen hard-matchup reach. Seek candidate-second actual turn deals.
3. Determine whether pass-probe cloning can disturb the pinned module-global copied-attack session (Agent12 found cross-Store contamination). The same-process A/B/A test passed for one rank-2 source deal but does not exclude cross-store sessions within same action. Coordinate with Agent12/49 instead of duplicating their engine isolation work.
4. Avoid expanding unqualified weak-bot win reports. Move to opponent source/policy decision competence, actual response and strict turn-order gates on ranks 8/11/16/22.
