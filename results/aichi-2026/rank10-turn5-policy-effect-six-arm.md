# Rank-10 champion-A turn-five policy × Pale Moon rule-correction matrix

**Agent 1; 17 October 2026.** Source-specific, diagnostic **six-arm** simulation. No competitive-game qualification. This summarizes the earlier [manual compiled CI 39003389536](https://github.com/FlareZ123/experiment-01/actions/runs/39003389536), head `dabf1f044d7f0247260a95236cf1b239e1da8ca7`, which passed all workflow steps and emitted the `rank10-source-policy-pale-moon-matrix-v1` object. The runnable source is [`aichi-rank10-policy-effect-matrix.cjs`](../../simulation/twinleaf/aichi-rank10-policy-effect-matrix.cjs).

## Fixed source and comparison

- **Fixed actual inventory:** published Aichi rank-1 Shadow Rider 60 in physical A and published rank-10 Regidrago 60 in physical B. `planAichi` resolves physical printings. Engine pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Physical deal:** `decorrelated-slots-v3` pilot rank-10 seed `3162592764`; rank-1 candidate actually goes second, rank-10 actually first. `maxActions:600`; strict prompts and recorded policy/compatibility correction flags are frozen in the source runner.
- **Action variable:** `original` is generic bot's source turn-five Pass after existing setup actions; `aligned` invokes the opt-in horizon attack policy and announces Koraidon ex TEF's printed **Retribution Strike**; `retreat` is an explicit real source action fork that changes the original Pass to Koraidon retreat then Pass, without claiming the bot would prefer it.
- **Effect variable:** `corrected:false` uses raw Twinleaf `Pale Moon-GX` delayed KO behavior; `corrected:true` activates the reversible [Active-to-Bench queue cleanup](../../simulation/twinleaf/pending-end-turn-switch-cleanup.cjs). All six arms had the same initial deck hashes, actual starting order and complete **pre-turn-five source action array**; these checks were asserted by the successful CI.

## Exact compiled six-arm outcomes

Prizes are **remaining A/B** (champion/Regidrago), not taken. Winner slot **1** is Regidrago in every arm.

| Turn-five choice | Raw delayed KO: winner, prizes, turns | Corrected delayed KO: winner, prizes, turns | Correction exercised |
| --- | --- | --- | --- |
| Bot **Pass** | B, **2/0**, turn 13 | B, **2/0**, turn 13 | **0** root removals; 5 speculative Store removals |
| Printed **Retribution Strike** | B, **2/0**, turn 13 | B, **2/0**, turn 13 | **0** root removals; 5 speculative Store removals |
| Explicit **Retreat → Pass** | B, **4/0**, turn 11 | B, **2/1**, turn 42 | **1** real root removal; 5 speculative Store removals |

For Retreat, the predecision source digest matched exactly between raw and corrected arms (asserted). In the raw live Store, Koraidon moved to the Bench yet retained a queued **`knock_out`** from Trevenant & Dusknoir-GX's `Pale Moon-GX`; the subsequent Pass removed Koraidon. With the hook, the root queue disappeared upon retreat, and Koraidon survived that turn. The 11→42 turn progression and 4/0→2/1 terminal Prizes demonstrate downstream consequence. The fact that Regidrago wins both continuations cannot distinguish game strength.

## Interpretation and exposed confounds

1. The **printed-attack fork** changed the announced turn-five action, but left the measured terminal winner, remaining Prizes and turn count unchanged in this one physical deal. Those aggregate equalities do **not** establish identical downstream actions, equal expected value, optimal generic policy or lack of tactical value. A same-horizon evaluation remains a bounded policy sensitivity test.
2. **Raw-versus-corrected Retreat** has a direct, actually exercised paper-rules issue. The [independent source/rule audit](rank10-pale-moon-source-rule-discrepancy.md) already documented this condition and 4/0→2/1 Prize change for the source game. The six-arm result independently locates it among same-seed Pass/Attack alternatives. A rule defect in this one source-A fork is not evidence that the separately replayed champion-**B** 350/235 arms exercised the same defect; [both B arms recorded zero queued instances](qualification-packets/rank-10/pale-moon-exposure-ledger.md).
3. **The cleanup also fired in five speculative Store evaluations in each corrected arm**, including corrected Pass and Attack despite **zero** root queue removals there. This means the correction can potentially alter policy scoring even without a live-source trigger. Only pre-turn-five and the displayed turn-five actions were expressly asserted equal. Do not treat this as an isolated mechanical single-factor terminal experiment without checking post-fork policy RNG, speculative Store noninterference, source inputs and opponent reactions.
4. No archived six-arm full input-and-graph replay, independent opponent-response competence check, paper-effect full coverage, both-seat/fresh-seed replication or confidence interval is supplied. **`sourceReplayMechanicsVerified:false`; `qualifiedForCompetitiveInference:false`; zero qualified competitive games**.

## Next decisive measurements

- Freeze each actual pre-turn-five public/hidden zone and policy RNG checkpoint, then align **post-choice** policy RNG streams. Report the first subsequent source action and opponent choice that differ, including whether altered simulated Store cleanup affects scoring.
- Reconstruct at least one opponent decision and legal alternatives after Retreat under the corrected delayed-KO rule. Audit hidden-information access and full relevant attack/reducer outcomes.
- Preserve this as a **physical-A** rule-exposure study. Continue the separate champion-B full-transport acceptance path without treating these six game completions as competitive wins.

This result is a source-anchored engine/policy diagnostic that explicitly leaves the fixed deck nomination unchanged.
