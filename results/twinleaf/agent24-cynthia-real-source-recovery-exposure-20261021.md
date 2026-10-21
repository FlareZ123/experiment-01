# Source-printed Cynthia & Caitlin: actual rank-6 native skipped recovery and corrected-mode exposure

**Agent 24 | 21 October 2026 | pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.** **Manual upstream-compiled CI [39665984864](https://github.com/FlareZ123/experiment-01/actions/runs/39665984864) SUCCESS**, source HEAD `229efe44b13b215526b0f85a6bb162a701c6ca26`; full [source JSON artifact 12378160482](https://github.com/FlareZ123/experiment-01/actions/runs/39665984864/artifacts/12378160482) (GitHub SHA256 `0fd1d747733feb1bfa7f6c7a8081d8270f0dc87eee4e7cb87017600a66b9f1da`). **Zero competitively qualified games.**

## Printed rule and pinned native defect

The exact printed `Cynthia & Caitlin CEC 189` first effect instructs the owner to recover an eligible Supporter from the public discard. Its second effect optionally allows another hand-card discard to draw three. The pinned source `ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/cynthia-and-caitlin.ts` opens a `SelectOptionPrompt` with `allowCancel:true` when recovery is available, allowing default `SimpleTacticsAi` to answer `null` and skip mandatory recovery entirely. The existing `enforceSelectOptionLegality` cannot reject it because upstream marks the prompt cancelable.

Actual `Store` tests `tests/agent24-cynthia-caitlin-native-choice.test.cjs` verified null skip and legal mode-zero physical recovery, and the **opt-in** `printedCynthiaCaitlinRecovery:true` headless resolver plus `enforcePrintedCynthiaRecovery:true` fail-closed predispatch gate. These are independent versioned flags; baseline historical policy is preserved. The corrected resolver looks only at the real source-stamped played Trainer and option text, not concealed deck order or opposing hand.

## Fixed prospective source sample, both physical seats

Before dispatch the explicit seeds/ranks were frozen in `simulation/twinleaf/agent24-cynthia-source-exposure.cjs`, with pure attribution controls `tests/agent24-cynthia-source-exposure.test.cjs`. Each arm uses an unmodified published 60 source list against published rank-1 champion, `maxActions:240`, genuine physical Store setup, isolated policy RNG, `supporterDecisionCorrection:true`, `mandatoryOptionFallback:true`, `strictPromptValidation:true`, `enforceSelectOptionLegality:true`. Only the printed C&C fallback and its matching guard change. Real source 60 hashes and engine actual first-turn attribution agree across the paired arms in all four samples.

| Source and physical position | Source seed | Control: actual native C&C play/mode | Corrected: actual native C&C play/mode | Engine-only outcome |
| --- | --- | --- | --- | --- |
| Rank 6 Iron Thorns, physical A, first | 20624001 | Turn **9** root **50→51**, **null** mode | Turn **5** root **30→31**, mode **0**; T11 **59→60** mode 0; T17 **98→99** mode 0 | Both engine terminals, rank-1 champion wins, remaining Prizes **[6,2]** |
| Rank 6 Iron Thorns, physical B | 20624002 | No native C&C choice | No native C&C choice | Both censored at 240 roots, remaining Prizes **[6,5]**; **identical full root-ledger hashes** |
| Rank 24, physical A, first | 20624003 | T3 root 34 C&C play, **no native mode prompt** | Exactly same observed C&C play, **no native mode prompt** | Both engine terminals at 39 roots, remaining Prizes **[6,4]**; **identical full root-ledger hashes** |
| Rank 24, physical B | 20624004 | No C&C mode observed | T18 root **145→146**, T22 **166→167**, T26 **189→190**, T32 **218→219**, all mode **0** | Both censored at 240 roots, remaining Prizes **[6,6]** |

The rank-24 physical-A C&C play without a modal is a **negative control**, since its native code may use a discard-and-draw path when no Supporter is available for recovery. A card play alone must never be misclassified as a skipped required modal.

## What this actually establishes

An invalid **native source-owned** skipped C&C recovery choice occurred in a bounded real dealt game of exact rank-6 Iron Thorns when that published source started first against rank-1 champion. The corrected both-seat policy executed legal source-owned mode-zero selections under the same registered input deck hashes. The corresponding original choices can occur on different turns because the corrected resolver also influences **speculative Supporter valuation before actual play**. These paired whole-match histories therefore do not isolate the causal value of a single recovered Supporter.

Three negative/conditional examples remain recorded, including full no-change action-history checks for two samples. This evidence is materially stronger than one constructed card state, but **none** of these outcomes certifies optimal card choice, full-paper Expanded interaction support, opponent policy competence, a tournament clock, win rate, or candidate promotion. The source-first native same-root single-option intervention is a separate next-stage experiment.

**Status remains 29/32 published exact opponent source lists, zero independently qualified competitive games, 99.5% not demonstrated.**
