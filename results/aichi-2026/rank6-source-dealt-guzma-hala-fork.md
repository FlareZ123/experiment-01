# Aichi rank 6: actual source-dealt turn-two Guzma & Hala fork

**Agent 33, 16 October 2026. Evidence type: paired deterministic source-seed legal-action counterfactual.**
**`qualified_for_competitive_inference: false`. No game-win-rate estimate.**

## Exact research question

The generic pinned SimpleTacticsAi opponent on rank-6 Iron Thorns, physical player B, turn two, repeatedly chose Palace Belt, Tropical Beach, Guzma then passed without attaching Energy. A proposed competing line played Guzma & Hala, searched the singleton Double Colorless Energy (DCE), played Thunder Mountain and attacked immediately. Before this test, both DCE's *physical Prize status* and the full source-dealt attack line had not been proven.

The [source-locked rank-6 roster](full-decklists.json), [original decision trace](rank6-observed-turn2-counterfactual.md), [constructed mechanical witness](rank6-guzma-hala-continuous-store.md), and the [exact discard-budget sensitivity](iron-thorns-discard-sensitivity.md) establish the question and its scope.

## Reproducible protocol

[Successful **manual** GitHub Actions run 38901614252](https://github.com/FlareZ123/experiment-01/actions/runs/38901614252) ran the complete [`rank6-seed-guzma-hala-fork.cjs`](../../simulation/twinleaf/rank6-seed-guzma-hala-fork.cjs) against pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Research CI used `aichi-iron-thorns-first-attack.yml` and built the pinned engine. It did not edit vendor code.

- Immutable 60-card source inventories: rank-1 champion Shadow Rider Calyrex physical A, rank-6 Kazuma Kashi Iron Thorns physical B, mapped through the shared printing resolver. Engine fullName deck SHA-256: A `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`; B `b50e4cf27c449653cf9c61e4e830b7a3d61f9b1c7e42a7dfd2d781a1c6e6895a`. The existing resolver permissions were `allowEquivalentBasicEnergies:true`, `allowJapanesePromoHooks:true`; these are declared engine-representability permissions, **not proof of Japanese paper legality**.
- Actual xorshift32 game seed `20367160`. True first player A, verified against the first draw log; rank6's first meaningful turn was global turn 2. The two runs held source cards, starting seat, RNG seed, current pinned code and baseline opt-in legality hooks constant. `strictPromptValidation`, `forestSealSearchCorrection`, `doubleDragonRecovery`, `supporterDecisionCorrection`, `isolatePolicyRandomness`, `captureDecisionTrace`, `leleEntryAbilityLockCorrection`, `radiantGateLockCorrection`, `entryDrawLockCorrection` were enabled.
- Baseline calls existing policy. Alternative uses a **temporary, research-owned, explicit turn-two policy override**, restored afterward. The override decides using visible own hand and the *actual deck contents exposed by Guzma & Hala's search prompt*; it has no lookahead access to face-down Prizes.
- A separate post-decision read-only physical-zone observer captured hand, Prizes and DCE location outside of bot decision logic. At the fork boundary the two runs matched exactly on the source hand, all six Prize cards, and DCE location. The stand-alone [probe](../../simulation/twinleaf/rank6-seed-opening-probe.cjs), in [successful CI 38900839250](https://github.com/FlareZ123/experiment-01/actions/runs/38900839250), also verified its instrumentation is noninterfering using identical deterministic gameplay transcript signatures with and without observation.

## Fork boundary in the actual physical deal

The rank-6 hand at first actionable turn contained:

`Guzma BUS; Trainers' Mail ROS; Guzma & Hala CEC; Tropical Beach BWP 50; Thunder Mountain Prism Star LOT; Cynthia & Caitlin CEC; Palace Belt BWP`.

Six rank-6 Prize printings: **Iron Thorns ex TWM, Speed Lightning Energy RCL, Guzma BUS, Plumeria BUS, Guzma & Hala CEC, Guzma BUS**. The one DCE was **in the remaining deck**, with none in the hand, Prizes, discard or Active. Rank-6 had an Active Iron Thorns, no occupied Bench; its opponent had Active Shadow Rider Calyrex V. The baseline first attempted to play Palace Belt.

## Observed alternative actions, accepted by the real Store

| Step | Scripted decision | Direct verification |
| --- | --- | --- |
| 1 | Play Guzma & Hala | Actual `PlayCardAction`, source hand |
| 2 | Select discard-to-search option | Actual mandatory `SelectOptionPrompt` |
| 3 | Discard Guzma + Tropical Beach | Accepted actual `ChooseCardsPrompt` |
| 4 | Search DCE + Wondrous Labyrinth Prism Star | Accepted actual deck-search `ChooseCardsPrompt` |
| 5 | Play already-held Thunder Mountain Prism Star | Actual `PlayCardAction` |
| 6 | Attach fetched DCE to Active Iron Thorns | Actual `PlayCardAction` |
| 7 | Attack Volt Cyclone | Actual `AttackAction`, completed deferred prompts |

The Store moved the defending **Shadow Rider Calyrex V CRE** from **0 to 140 damage**. It accepted Volt Cyclone without an occupied Bench for the printed Energy movement. A separate constructed case confirmed Thunder Mountain was necessary to pay Volt Cyclone with DCE alone.

## Interpretation

This closes two distinct, previously open questions for **the one exact archived physical seed**:

1. Was the only DCE Prized? **No. It was still in the rank-6 deck** at the decision boundary.
2. Could the proposed turn-two line actually be executed from that source-dealt state? **Yes. The compiled Store accepted the real search, discards, attachment and 140-damage attack** under the recorded source-state and hook version.

The conclusion is a source-grounded **available-action counterfactual**. It does not establish that spending the two cards or forfeiting Palace Belt/Guzma's normal tactical line is strategically better. In particular, **two of three Guzma copies are Prized** in this opening, and the line discards the third from hand. The opportunity cost could be considerable even though VS Seeker and other retrieval routes exist. The opposing Shadow Rider V remains in play after 140 damage, so no immediate victory is shown.

Only one opening seed and one baseline-versus-scripted branch were tested. Simulator hidden-reference sharing, opponent policy quality, future responses, KO timing, and independently reproducible entire-game decisions remain qualification blockers. No counts from this fixture may enter a competitive win-rate estimator or serve as three independent games merely because the source hand previously recurred across candidate variants.

**Verdict: `qualified_for_competitive_inference: false`; 99.5% field target unverified.**

## Next evidence requirement

Compare the eventual Prize/board/turn trajectory of the baseline Guzma control line and the DCE/Thunder aggression line under documented opponent and candidate decision policies, with source-state noninterference and no K0 Prize clairvoyance. Record the first point where trajectories diverge and opponent's best plausible response before drawing any tactical dominance conclusion. Run additional distinct preregistered openings only after that policy and engine validation.
