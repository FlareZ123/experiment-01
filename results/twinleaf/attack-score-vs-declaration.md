# Pinned AttackTactic scoring and attack-declaration probes

**Agent 36, 16 October 2026.** Evidence type: source-verified methodological distinction, with no new played-game outcomes.

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements `AttackTactic.useTactic` in `ptcg-server/src/simple-bot/simple-tactics/attack-tactic.ts`. It enumerates printed Active Pokémon attacks, evaluates each through `SimpleTactic.evaluateAction`, and chooses an attack only when its fully simulated final StateScore exceeds the present score minus `attackBonus` (100 under `defaultStateScores`). `SimpleTactic.simulateAction` dispatches the attack through a Simulator and then tries to resolve every pending prompt. If that process throws, `evaluateAction` returns undefined.

The research-owned `clonedStoreAcceptsAttack` in [pass-attack-announcement-probe.cjs](../../simulation/twinleaf/pass-attack-announcement-probe.cjs) instead calls `Store.dispatch(new AttackAction(...))` once and returns whether that initial dispatch threw. It does not resolve the prompts or evaluate the score. Acceptance of the attack declaration is therefore strictly weaker evidence than confirmation that the upstream AttackTactic evaluated the same attack successfully and preferred it.

In source-ranked [Aichi rank-10 Koraidon passes](../aichi-2026/agent44-v3-rank10-pass-probe.md), two real pre-Pass states accepted `Retribution Strike` announcements. The actual reason the bot still passed is **not established** by those probes. The next experiment should passively instrument the already occurring `getStateScore` and `evaluateAction` calls during the exact pre-Pass decision, logging each evaluated attack name, returned score or undefined, the initial score, 100-point threshold and any later `isValidAction` veto. Compare an instrumented and ordinary run at identical source cards, seeds, options and player seats to verify that the instrumentation adds no simulation or RNG calls.

Possible diagnoses remain: a failed full attack/prompt simulation, score suppression, or a later validity veto. They must be distinguished from insufficient Energy or an engine-illegal declaration. The proposed observer is only a policy-debugging instrument. It cannot establish that attacking is the strategically correct choice, and none of the reported games qualifies for a competitive win-rate estimate.

## Executed passive-score control

[Manual compiled CI run 38889655086](https://github.com/FlareZ123/experiment-01/actions/runs/38889655086) passed at research commit `74c1fd92b987e750de9c61094b94b267b949d78f`. Two source-deck pairings in each physical seat and two fixed seeds produced four baseline/instrumented comparisons with identical checked engine outcomes, attack/ability traces, action counts, and terminal summaries. One instrumented game included Koraidon Pass choices at turns 1, 3, 5, 7. Its attempted Retribution Strike and Kaiser Tackle evaluations returned undefined each time, while the Active Pokémon had zero Energy on turns 1 and 3 and one Grass Energy on turns 5 and 7. These states lacked the printed two Colorless attack cost and therefore do not reproduce the earlier source-ranked Double Dragon-equipped, engine-accepted turn-5 pass. The noninterfering observer is demonstrated, but the causal legal-pass diagnosis remains open. The repository's competitive-win qualification status remains zero.

## Exact v3 rank-10 Koraidon score rejection, compiled CI 38890117370

[Manual pinned-engine run 38890117370](https://github.com/FlareZ123/experiment-01/actions/runs/38890117370) succeeded at research commit `eadd9225c261a6b607736ef67747f2d73a96a981`. The new [source-rank v3 reproducer](../../simulation/twinleaf/aichi-rank10-koraidon-score.cjs) ran published rank-10 Regidrago as physical opponent seat 1 versus frozen Champion and Hood candidates in physical candidate seat 0. It used exactly derived `decorrelated-slots-v3` seed **3162592764** and the fixed-core headless flags, 600-action cap, strict Prompt validation and all prior correction toggles. Both checked control/instrumented game pairs matched on winners, turns, actions, attack/Ability logs, played cards, Prizes and terminal summaries.

Both source-ranked matches reproduced Koraidon ex with one Double Dragon Energy choosing Pass on global turn **5**. The already running `AttackTactic.evaluateAction` returned the following numeric final StateScores for the engine-legal Retribution Strike declarations:

| Candidate/opponent pair | Existing Active score minus attack bonus (selection threshold) | Simulated Retribution Strike score | Decision |
| --- | ---: | ---: | --- |
| Champion reference A vs rank 10 | **-199** | **-2305** | Score below threshold; Pass |
| Hood Shield A vs rank 10 | **-197** | **-2296** | Score below threshold; Pass |

In both, the separate printed `Kaiser Tackle` scored undefined. This **closes the immediate policy-choice mechanism**: the bot enumerated and completed a scored Retribution Strike simulation, but its StateScore penalized the resulting state severely enough to reject the attack. The prior cloned Store probe had already accepted the declaration. The global turn-1 Koraidon passes also had DDE but its first-turn attack prohibition made attack scores undefined; do not combine those cases with turn 5.

The result does **not** prove Retribution Strike is better than Pass, nor that its simulated score is faithful to physical rules. The size of the score decrease is the next critical investigation, especially whether the end-of-attack state evaluation wrongly penalizes normal turn advancement, damage, board position or a transient prompt result. No candidate win-rate inference or qualification is warranted.
