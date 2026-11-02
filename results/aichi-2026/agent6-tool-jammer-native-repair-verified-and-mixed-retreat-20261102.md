# Agent 6: recovered native Tool Jammer repair, bounded paper-fidelity positive

**2 November 2026, new invocation | preserved historical baseline and actual compiled Store artifact | no qualified game**

The earlier staged [native Tool Jammer report](agent6-tool-jammer-floatstone-native-fidelity-20261102.md) establishes that the unchanged pinned Twinleaf Store wrongly allowed an uncharged Latias ex SSP with Float Stone to retreat under opposing Active Tool Jammer while Skyliner was suppressed. This note closes its previously pending **isolated adapter repair** test. It does not generalize to other Tools, cost-modifiers or shuffled matches.

## Recovered independent compiled receipt

The existing manually dispatched [Actions run 41436648697](https://github.com/FlareZ123/experiment-01/actions/runs/41436648697) had overall **failure** due to the intentionally preserved uncorrected 30-case baseline. Its separate opt-in repair step exited successfully, produced [artifact 13135964517](https://github.com/FlareZ123/experiment-01/actions/runs/41436648697/artifacts/13135964517), and was independently downloaded and checked during the present invocation.

- ZIP SHA-256: `b095839a7b01a78f448d8fb95907b941a59c8d14031a849ddae26505ee6ab1b8`, agreeing with the native Actions digest.
- Internal file: `agent6-tool-jammer-repair.json`.
- Exactly four genuine pinned Store staged rows: **Path + Float Stone + opposing Active Tool Jammer** and **opposing Active Iron Thorns ex + attached Tool Jammer + own Float Stone**, each with original source in **seat 0 and seat 1**.
- Each row has `repairApplied:true`, two `CheckRetreatCostEffect` patch receipts showing cost `0 -> 2`, `nativeRetreatCost:2`, rejected native `RetreatAction` with `NOT_ENOUGH_ENERGY`, and unchanged Active Latias.
- **4/4 rows passed all seven machine-check fields**; `failedChecks:0` and `qualifiedCompetitiveGames:0`.
- Original actor still proposed a nominal Skyliner retreat; both owner-visible conservative guards vetoed it. The repaired native action outcome is therefore separate from root policy behavior.
- Actual tested source runner: [agent6-skyliner-public-suppression-native.cjs](../../simulation/twinleaf/agent6-skyliner-public-suppression-native.cjs), opt-in synchronous [adapter hook](../../simulation/twinleaf/agent6-tool-jammer-floatstone-retreat-hook.cjs), original pinned `vendor/twinleaf` revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

**Evidence boundary:** The staged game state manually installs public cards and requires suppressed Skyliner. The hook only adjusts the published Latias/Float Stone/Tool Jammer combination after the Store's existing `CheckRetreatCostEffect` computes zero. It deliberately does not fix all Tool Jammer semantics. A genuinely paid retreat or source paper interaction outside this stage remains untested. The native runner uses `try/finally` restoration on its action sequence. Do not automatically merge the default-off hook into the frozen bilateral source policy.

## Second, separate research question

Agent10 provided an exact original rank-9 source owner-root scenario in which Active Electrode-GX CES has **Prism Energy + Basic Darkness**, the Bench has **Mega Absol ex with Telepath [P] + two Prism**, and the later attacker potentially has `Claw of Darkness` at `[D,D,C]`. The original conservative [paid-retreat frontier](../../simulation/twinleaf/agent6-actor-paid-retreat-frontier.cjs) necessarily abstains because it assumes exactly one attached Basic and a Bench attack paid entirely with Basics.

Added an **unselected, default-off, owner-public-only proposal** at [agent6-actor-mixed-energy-retreat-proposal.cjs](../../simulation/twinleaf/agent6-actor-mixed-energy-retreat-proposal.cjs) and [six pure regressions](../../tests/agent6-actor-mixed-energy-retreat-proposal.test.cjs). It reuses Agent17's tested context-sensitive Special Energy matcher and proposes discarding a publicly attached **Basic Darkness** to fund a one-Colorless printed retreat while preserving the existing Bench Specials. It refuses any known Stadium, attached Active Tool, statuses, repeat retreat, unknown payment or already-payable damaging Active attack. This is intentionally a **proposal** with marker `UNVERIFIED_NATIVE_PROMPT_AND_ATTACK`, never a selected native Store action or paper-valid game. Genuine Energy-discard prompt choice, effective retreat-cost modifiers, status/lock interactions and native attack payoff must be tested before integration. The original same-deal rank-9 source window is a specific future native falsification target.

The opt-in existing rank30 workflow now runs the new pure tests with the previous native stage; [run 41474308508](https://github.com/FlareZ123/experiment-01/actions/runs/41474308508) was dispatched at 15:42 UTC, initially in progress. Its unmodified 30-case baseline is deliberately expected to fail. Inspect the **new regression step** and the separate repair artifact; do not call the whole workflow green merely because the correction path succeeds.

No single deck can be selected from these results. **29/32** original field lists recovered, **zero** competitively qualified games and no 99.5% evidence remain unchanged.
