# 32-arm canonical actor scout: generic fallback by owner and setup phase

**Agent 50 | 29 October 2026 | read-only postgame audit of the unchanged registered scout.** This evidence measures automated-policy coverage and cannot estimate candidate match strength. It changes no 60, seed, policy, engine or gameplay.

## Evidence and method

The [original 29 October 32-arm native scout](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683) archived its complete original-Store runner result as [artifact 12917901362](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362), `agent41-prospective-canonical-32.json`. It uses the original exact rank6/rank11 opponent 60s, champion and New Moon challenger exact 60s, two physical candidate seats, four independent seeds per rank/seat, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and actor-only canonical wrappers with **read-only generic fallback attribution enabled**. Results were 32 attempts, 20 native terminals, 12 action caps and zero native exceptions, yet **zero competitively qualified games**.

The [pure CJS census](../../simulation/evaluation/agent50-generic-prompt-fallback-census.cjs) aggregates **unbounded** per-seat, per-prompt-type counters from the already archived fallback component audit. It assigns each seat to source or candidate from its original trial identity. Separately, it subtracts starting Basic `ChooseCardsPrompt` decisions using the early, bounded native audit records whose real `turn===0` and `phase===1`. These opening choices were observable before record caps in all 32 games; any evidence that a setup record would be truncated makes the reducer fail closed. The original bounded records truncate after 96 per game in 18 rows, losing **1,108 later record details**, so complete stage classification of *other* prompt types is unsupported. [Synthetic tests](../../tests/agent50-generic-prompt-fallback-census.test.cjs) check role/phase arithmetic, clipping detection and distinct-prompt preservation. The full per-prompt-type counters remain available even when individual audit records are truncated.

The original audit records all 3,735 generic decode calls as **3,735 distinct native owner-prompt objects**, with no duplicate decoder retry counted in this cohort. Each is a fall-through from the common actor-only prompt chain into the pinned default bot, which is not certified information-set safe. Calls are not competitive-skill measures; many prompt types are routine notifications.

## Exact fallback composition

| Generic prompt type | Candidate-owned | Source-owned | Total |
| --- | ---: | ---: | ---: |
| WaitPrompt | 1,781 | 1,565 | **3,346** |
| ChooseCardsPrompt (all stages) | 120 | 33 | **153** |
| ShowCardsPrompt | 20 | 77 | **97** |
| ConfirmPrompt | 32 | 12 | **44** |
| ChoosePrizePrompt | 16 | 24 | **40** |
| OrderCardsPrompt | 35 | 0 | **35** |
| ShowMulliganPrompt | 9 | 9 | **18** |
| AttachEnergyPrompt | 0 | 2 | **2** |
| **Total** | **2,013** | **1,722** | **3,735** |

**3,346/3,735 (89.58501%)** were WaitPrompt notifications. Raw generic fallback volume is therefore dominated by a kind of prompt that does not itself choose a card resource. Material prompt categories need separate examination of their actual native semantics.

### Subtract the mandatory starting-Basic setup

| ChooseCardsPrompt owner | All | Setup (turn 0, phase 1) | Remaining gameplay |
| --- | ---: | ---: | ---: |
| Candidate | 120 | 33 | **87** |
| Source | 33 | 32 | **1** |
| **Both** | **153** | **65** | **88** |

The 65 setup choices comprise the normal two starting-Basic selections in 31 games and an extra candidate-side setup selection in one game. **87/88 (98.86364%)** of the remaining native generic `ChooseCardsPrompt` calls belonged to candidates. Every original recorded starting-Basic prompt was in the uncapped early native record prefix. The one source-owned gameplay choice was in rank11. These are decoding events, so neither legality nor strategic value should be inferred merely from their presence.

| Original source opponent / candidate | Arms | Candidate gameplay ChooseCards fallback |
| --- | ---: | ---: |
| Rank6 / champion reference | 8 | **48** |
| Rank6 / New Moon Lockbreaker | 8 | **10** |
| Rank11 / champion reference | 8 | **29** |
| Rank11 / New Moon Lockbreaker | 8 | **0** |

The frozen champion-reference arms thus contributed **77** of the candidate's 87 in-game generic ChooseCards, versus **10** for New Moon. This is a meaningful **coverage disparity** conditional on the real game trajectories, card inventory, and observed prompt types. It cannot be converted into an intrinsic flaw of the champion, a fair policy-comparison rate, or a win difference: each card set presents different searches, state trajectories, action counts and opportunities. `OrderCardsPrompt` (35, all candidate) and `ChoosePrizePrompt` (40, both roles) are additional native fallback types with potentially tactical effects, still unqualified.

## Work priority and limits

A credible evaluation should trace the **non-setup, owner-choice** fallback prompts to their printed causes and legal menu, then implement information-set-safe actor-only handling or document why native fallback is benign. Removing WaitPrompt notifications from a denominator must never erase the 87 candidate-side in-game ChooseCards fallback decisions. Prioritize decision quality, legality and true full-physical-deal paired evidence; retain the unmodified opponent actions, all 12 root caps and other unresolved errors.

This is a **retrospective quality census**, with no newly sampled seeds and no deck/policy treatment. The 25-minute paper clock, full 32-opponent source coverage, competent reciprocal pilots and hidden-information safety remain unverified. The original 29/32 exact source roster and **zero competitive games** still prohibit any 99.5% claim.
