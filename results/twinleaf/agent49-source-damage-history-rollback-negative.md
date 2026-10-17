# Aichi rank1/rank10 source-decision Card attack-history rollback: bounded negative result

**Agent 49, 17 October 2026.** Source-ranked one-seed causal sensitivity check, **manual compiled CI [39026248995](https://github.com/FlareZ123/experiment-01/actions/runs/39026248995) passed in full**. Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, research workflow `.github/workflows/twinleaf-decision-history-rollback.yml`. All generated results are explicitly **unqualified weak-bot diagnostics**.

## Question

The [complete-decision source Card contamination observation](agent49-complete-decision-card-mutation.md) found 13 `damageTakenLastTurn` changes that survived across natural `SimpleTacticsAi.decodeNextAction` boundaries in one exact source rank1/rank10 match. Do these **specific mutations**, corrected alone without changing Simulator clone identity or other fields, change a chosen bot action or a recorded engine-game outcome under the same physical source seed?

## Controlled intervention and audit method

[`decision-damage-history-rollback.cjs`](../../simulation/twinleaf/decision-damage-history-rollback.cjs) is a reversible, research-owned wrapper around the actual bot's synchronous `decodeNextAction`. It captures each original live Card's numerical `damageTakenLastTurn` before policy execution. In the experimental arm only, **after policy returns its action but before live Store action dispatch**, it restores the previous value on any changed physical source Cards. It does not replace the Simulator or change its class/graph identity. Other source-Card property mutations are intentionally untouched; this makes a narrower causal experiment than swapping the entire clone implementation.

This is an **intervention on the real source Store after speculative decision-making**. The original bot may already have chosen its action while the field had changed. Later actions, including possible future bot decisions and attack-resolution fields, are eligible to change; that is what the comparison tests.

The source matches are:
1. Stock source match, **no** observer;
2. Same source seed with a read-only history-change observer;
3. Same source seed with the same observer plus post-decision `damageTakenLastTurn` restoration.

Source deck printing IDs: Aichi 2026 rank 1 Yasunori Kato's Shadow Rider list versus rank 10 Haruku Yoshioka's Regidrago list, `results/aichi-2026/full-decklists.json`, 60 each with engine mapping. Seed **20261049**, maximum 350 actions, `strictPromptValidation`, `forestSealSearchCorrection`, `supporterDecisionCorrection`, `doubleDragonRecovery` and `isolatePolicyRandomness` unchanged in all three arms. Equal deck hashes and actual first player verified. The monitor records bot action class, turn, actor seat, action name, hand index, and reversible Card history writes. [Four pure tests](../../tests/decision-damage-history-rollback.test.cjs) passed in the same compiled CI (single-field undo, noninterfering observe mode, exception cleanup, inherited-method restoration).

Uninstrumented stock and instrumented stock game summaries were **asserted identical**. Comparing bot policy decision arrays then allowed an exact under-this-schema first-difference check, while `selectTrajectory` recorded the source action/attack/final-state summary digest.

## Executed results

| Measurement | Unmodified Card-aliased Simulator | Same Simulator + history-only rollback |
| --- | ---: | ---: |
| Natural policy decisions | 189 | 189 |
| Source `damageTakenLastTurn` writes observed | **13** | **13, immediately undone** |
| First affected decision | 20 | 20 |
| Real game actions until finished | **203** | **203** |
| `firstDifferentPolicyDecision` in recorded action schema | **none** | **none** |
| Engine winner seat | 0 (rank 1) | 0 (rank 1) |
| Qualified competitive games | **0** | **0** |

The action-array SHA-256 for both arms is exactly
`c3019993d54d58cfc4359ac74248a06acc8519af73d5ac35ce14e508d83e1832`.

The game-trajectory summary SHA-256 for uninstrumented, monitored and repaired arms is exactly
`3e8c594d9ec5b02dd92926a3d1d2b3e1885aa1f2a8c633ae8d3cb7df9809687a`.

Both arms reported the same observed intermediate potential writes, e.g. **Koraidon ex TEF `0→10` at decision 20**, **`0→130` at decisions 50 and 70**, and simultaneous **Trevenant & Dusknoir-GX `0→130`** and **Dialga-GX `0→30`** at decision 84. In the experimental arm each was undone at its corresponding decision boundary; the raw original state was left unchanged in the stock arm.

## Result and limits

**Bounded negative:** removing all thirteen post-decision live-Card `damageTakenLastTurn` mutations in this exact source-ranked weak-bot game **did not** change the recorded policy-action array, the summary fingerprint, the 203-action completion, or winner seat. This falsifies a stronger claim that these observed thirteen numerical writes *must* explain the original versus entire detached-clone winner reversal in that match.

It leaves alive several possibilities: the whole-clone behavior changed because of other class/reducer/identity semantics, because another live Card field was changed (`movedToActiveThisTurn` or newly defined flags), or because altering speculative evaluation changed action scoring before the rollback point; each deserves a separate controlled test. The same `damageTakenLastTurn` field demonstrably caused a real **10-versus-0 Counter damage** discrepancy in the independent **conditioned** Conkeldurr V source Store fixture ([prior report](simulator-card-reference-leak.md)). The two experiments test different states, and their conclusions coexist.

The action-array schema records action class/name/handIndex plus turn/seat and **may omit prompt selection values**; equality of action-array hashes and `selectTrajectory` checks is stronger together but still falls short of complete Store-state, all-prompt, full-reducer equivalence. A later real action can reset damage-history fields. Same-seed arms are paired correlated diagnostics, and neither deck has been competitively qualified. The 99.5% objective remains unsupported.

## Next discriminating experiment

A **single-field `movedToActiveThisTurn` rollback** on the same source seed would distinguish whether that specific repeatedly mutated field causes game divergence, but it should be checked against legitimate turn-entry mutations before any default repair. A deeper independent action/prompt/resolver replay remains mandatory before interpreting full-clone outcome differences. Another option is instrumenting the first *policy-scoring* action difference under stock vs corrected clone, then locally varying only the suspected source field at that decision. Preserve the first failing case and its original source deal.

Source experiment runner: [`decision-damage-history-experiment.cjs`](../../simulation/twinleaf/decision-damage-history-experiment.cjs). Manual CI had **no failed job steps** and leaves vendor Twinleaf untouched.
