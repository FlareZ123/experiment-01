# Agent6: archived Issue25 v6 source mismatch has a distinct setup mulligan branch

**5 November 2026. Source-level and archival audit only. Zero qualified games.**

This is a case-specific extension of earlier [Agent39 paper coupling](../statistics/agent39-mulligan-posttreatment-source-alignment.md) and [Agent48 native mulligan](../statistics/agent48-deck-choice-mulligan-source-pair-causality-20261103.md) research.

Independently downloaded original [Issue25 v6 CI artifact 13353289881](https://github.com/FlareZ123/experiment-01/actions/runs/41894027367/artifacts/13353289881) and verified ZIP SHA-256 `7f8f8ab3f95f6cc7eb17ec12d5d37ff666924216a007b934ccaf662b4e905178` against GitHub's digest. Registered group `6:101:B` has identical source rank 6, source seat 0 and numeric seed `1787484121` across two different frozen candidate sixties.

Actual turn-zero root-prompt sequences from the archived JSON:

| Detail | Champion reference | New Moon Lockbreaker |
| --- | --- | --- |
| Candidate seat-1 setup ShuffleDeckPrompt count | 2 | **3** |
| Candidate seat-1 ChooseCardsPrompt after the shared first six roots | ordinal 7 | ordinal 8, after extra shuffle at 7 |
| Source seat-0 SelectPrompt before turn 1 | absent | **ordinal 13** |
| Source post-setup physical digest | `04be1f33cf67365affd0c8b95c32b5346093f78ef21fc8a43a23febcac1e2fae` | `509bc6e44713a30eb38ddfd59efb20540f9f3a6cac37d9d9f4c19fe2adf0faee` |

The pinned [setup reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts) issues a new shuffle when the candidate mulligans and offers the opposing prepared player a `SelectPrompt` to claim optional bonus draw cards. The paper rulebook I.G allows those cards. This directly identifies a candidate-dependent setup branch correlated with the unmatched source digest. The archived prompt-type trace lacks the SelectPrompt message and selected draw quantity, so **the actual number of source bonus cards remains unverified**.

**Design implication:** equal integer seeds can produce unequal legitimate post-setup source states. Do not filter these mismatches out of an unconditional comparison of two distinct candidate decks, or silently demand identical source hands after candidate-caused mulligans. The existing [Agent44 source-pair provenance audit](../../simulation/evaluation/agent44-cross-candidate-source-pair-status.cjs) can use `captureSetupCompensation:true` to record actual mulligan and bonus-draw counts in a new cohort. Identical physical input is appropriate for separate same-deck policy-only interventions; source-deal matching is a different estimand.

No treatment effect, game win, or 99.5% claim follows from these capped native attempts.
