# Agent 8: source Quick Ball and Trainers' Mail physically improve original opponent actions, 2×2 native experiment, 9 November 2026

## Completed prospective native experiment

The source-only first intervention (see [v1 findings](agent8-source-policy-fourway-native-20261109.md)) had zero change in original-source root actions despite three enabled tactical options. This *second* experiment introduces original-source-actor, owner-visible **Quick Ball** and **Trainers' Mail** actions to address real original Aichi opponent nonplay.

- [Frozen before execution: original eight physical deals, exact source ranks and 60s](../../aichi-2026/registrations/agent8-source-challenger-prospective-v2-20261109.json), ranks **5, 11, 13 and 31**, with candidate in both physical seats. Fresh cryptographic seeds unrelated to v1, no post-result seed selection.
- [Real pinned native runner](../../../simulation/evaluation/2026-11/agent8-source-challenger-2x2-v2.cjs). Four combinations per physical deal: P0S0 baseline, P1S0 donor-funded Perfection pivot, P0S1 original-source search-item challenge, P1S1 both. Candidate and original source 60s held unchanged; original source-actor challenge isolated to original player's physical seat. Real Store card dispatch, owner-search, hand-discard and opponent prompt handlers are the native outcome authorities. Baseline and treatment share the bounded owner-search and discard prompt adapters.
- [Completed CI run #42545804391](https://github.com/FlareZ123/experiment-01/actions/runs/42545804391), successful 9 November 2026 at 01:32 UTC, **nine pure tests passed**, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Raw results artifact #13643482131](https://github.com/FlareZ123/experiment-01/actions/runs/42545804391/artifacts/13643482131), original full native ledger and all 32 complete/aborted arms. Result below independently counted from this archived native action ledger.

### Physical Store results

| Measure | Result |
| --- | ---: |
| Native attempts | 32 |
| Four-arm original full and source physical-deal matches | **8/8** |
| Four-arm naturally terminal groups | **6/8** |
| Native errors | **2** |
| Root caps (censored at 260) | **1** |
| First source-response root changed, without pivot | **4/8** |
| First source-response root changed, with pivot | **4/8** |
| Source-side Quick Ball, P0S1 | **7** |
| Source-side Trainers' Mail, P0S1 | **3** |
| Source-side Quick Ball, P1S1 | **6** |
| Source-side Trainers' Mail, P1S1 | **3** |
| Source-side Quick Ball or Mail on S0 controls | **0** |
| Winner changes in fully native four-arm terminal groups | **0** |
| Qualified competitive paper wins | **0** |

**Important reporting correction:** The original CI console printed `sourceQuickBallRootsS1=0` and `sourceMailRootsS1=0` because its receipt-summary helper incorrectly required a trailing space after the Item card name. The **actual original source's native action ledger** encodes `PlayCardAction.card` as the base name (for example `Quick Ball` or `Trainers' Mail`). These actions **did occur**. Corrected parser now accepts exact base names and longer printing names, with an added regression test. The frozen raw native ZIP is preserved unmodified. The numbers in this table were independently recomputed from the raw original-source `PlayCardAction` records (7+6=**13 Quick Balls** and 3+3=**6 Mails** in treatment arms), instead of treating the stale console zeros as truth.

### Concrete changed first original-source actions

| Original rank, candidate seat | Native ordinal | Baseline original source action | Stronger source action |
| --- | ---: | --- | --- |
| 5 Mew Genesect, A | 8 | Pass | Trainers' Mail |
| 5 Mew Genesect, B | 53 | Pass | Quick Ball |
| 11 Absol Garbodor, B | 100 | Psychic attack | Quick Ball |
| 13 Regidrago, B | 7 | Pass | Quick Ball |

Rank13 candidate seat A showed three genuine source Quick Ball plays with accepted source owner hand-discard and deck-search prompts in S1, whereas S0 native runs aborted; that does **not** establish a winner reversal. Rank5 candidate seat B had one S1 root-cap but three natural terminals. Rank31 two original physical seeds produced no new source-choice opportunities. Six four-arm naturally terminal groups maintained the same winner in all four modes. Some source changes are tactically debatable: the rank11 Quick Ball displaced a payable attack. This is evidence of a search-resource contention problem, rather than evidence the source's strength improved.

## Decision

The source-seat-only owner decision bridge now achieves **real native search actions** in matchups where earlier original opponents passed. Its impact on board development is physically observable. It has not yet improved outcome against the fixed candidate or produced a competitively credible original opponent. The immediate next methodological priority is opponent decision quality: choose attack, Ability, draw, and evolution actions with their opportunity cost and native settlement, rather than maximizing legal search action count. The existing source Mew Genesect 60 has Genesect V Fusion Strike System, which is an obvious next public Ability action candidate, while preserving native one-use constraints.

Complete benchmark remains 29/32 authenticated original Aichi sixty lists, missing ranks 23,25,28. Nothing here demonstrates the required 99.5% game win rate or qualifies even one competitive paper match.
