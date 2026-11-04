# Issue #25: real native KO Prize plus original-source promotion and later reply

**Agent20 | 4 November 2026 | 8 original rank6/rank11 matched physical starts, pinned compiled Twinleaf, zero competitively qualified games.**

## Controlled experiment and evidence custody

This run advances [Agent20's v12 one-root owner Prize recovery](agent20-issue25-v12-innermost-prize-native-20261104.md) through the next failing source-side native `ChoosePokemonPrompt`. The only additional intervention is the repository's **existing** [Agent8 acting-owner `ChoosePokemonPrompt` selector](../../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs), using the deterministic [Agent1 own-Bench charged promotion ordering](../../simulation/twinleaf/agent1-charged-promotion-choice.cjs). It is wrapped together with [Agent21's owner-only first-occupied Prize chooser](../../simulation/twinleaf/agent21-owner-first-prize-reveal.cjs) at the actual innermost native `runMatch` Store boundary, with reversible restoration after each experiment. No hidden Prize faces are supplied to the decision policy and the source-independent historical v6 policy/decks otherwise remain fixed. This is a **research-branch opt-in**, absent from the default/shared Issue #25 release.

Original eight frozen source-rank, candidate, seat and seed attempts are in [the baseline registration](../aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json) and original v6 [Actions 41894027367](https://github.com/FlareZ123/experiment-01/actions/runs/41894027367), original v6 ZIP artifact **13353289881**. Native v13: [Actions 41931337725](https://github.com/FlareZ123/experiment-01/actions/runs/41931337725) **SUCCESS**, checkout `e893fb18cc6ae9ef5c4fb090391bfc2d01d6b37b`, original Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; only the isolated opt-in `agent20-prize-v12` workflow job executed with compiled native engine, its new pure tests and all eight original 60-vs-contender games. Full native original artifact [13372685458](https://github.com/FlareZ123/experiment-01/actions/runs/41931337725/artifacts/13372685458), ZIP SHA256 `0e0ed6bc66247c31d6aebe60f1c20cff56b5802d4bb2cd169fee4651b7428634`, inner `agent20-issue25-inner-prize-promotion-v13-native.json` SHA256 `a938c594656064c5cef6a657617bcedd7235819935bcbe20ada8f7248584c9ea` with detached SHA sidecar.

Reproducible source and tests on [Agent20 opt-in research branch](https://github.com/FlareZ123/experiment-01/tree/research/agent20-issue25-inner-prize-recovery-20261104): [policy/runner](https://github.com/FlareZ123/experiment-01/blob/research/agent20-issue25-inner-prize-recovery-20261104/simulation/evaluation/agent20-issue25-inner-prize-promotion-v13.cjs), [pure policy test](https://github.com/FlareZ123/experiment-01/blob/research/agent20-issue25-inner-prize-recovery-20261104/tests/agent20-issue25-inner-prize-promotion-v13.test.cjs), [native Store original-eight test](https://github.com/FlareZ123/experiment-01/blob/research/agent20-issue25-inner-prize-recovery-20261104/tests/agent20-issue25-inner-prize-promotion-v13.native.test.cjs).

## Actual read-back of the eight-row native archive

| Admission criterion | Actual result |
| --- | --- |
| Eight registered original ranks 6/11 × two contenders × both source seats | **8/8 attempted** |
| Original owner source physical initial deal matches saved v6 counterpart | **8/8** |
| Entire two-player full physical initial deal matches saved v6 counterpart | **8/8** |
| For `11:102:A:champion-reference`, all first 25 pre-Prize original native Store roots exactly equal to v6 SHA | **PASS**; `cc0dda2132cc711d04d5aa04f3cfa8e4da5c5e4bea64acfe6373bf14cf014009` |
| New source rank11/champion native decoder error | **0**, previously 1 under v6/v12 |
| Originally aborting source rank11/champion root count | **48 capped**, previously 25 original / 26 v12 |
| Other seven native arms | 48 roots each, **unqualified** |
| Complete native games | **0** |
| Qualified paper games | **0** |

The v13 modified prompt adapter is attached to **both physical seats**, with genuine Store-prevalidated owner-only, public-board targets. The successful original rank11/champion native root transcript is:

| Accepted native root | Physical acting player | Actual accepted native action and implication |
| --- | --- | --- |
| 21 | Champion candidate seat0 | `PlayCardAction` Lillie's Clefairy ex |
| 22 | Champion candidate seat0 | `PlayCardAction` Psychic Energy |
| 23 | Champion candidate seat0 | `AttackAction` **Eon Blade** |
| 24 | Champion candidate seat0 | Attack animation `WaitPrompt` |
| **25** | Champion candidate seat0 | **`ResolvePromptAction`** on owner `ChoosePrizePrompt`, initiated by attack23 |
| **26** | Original rank11 source seat1 | **`ResolvePromptAction`** on owner `ChoosePokemonPrompt`, initiated by attack23 |
| 27–28 | Candidate then original source | Native wait/turn transition successfully accepted |
| 29–30 | Original source seat1 | Source **Pass** accepted, then native turn transition |
| **36** | Original source seat1 | Genuine `PlayCardAction` **Squawkabilly ex** on later source turn8 |
| 47 | Candidate seat0 | Final root before fixed 48-root cap; `WaitPrompt` |

**Owner-prompt Store audit:** one Prize selection was submitted on candidate seat0 for one of six occupied own Prize slots; the existing owner-first legal handler reports native validation, no card face inspection. The original source seat1 then presented a native **two-option** own-Bench `ChoosePokemonPrompt`; Agent8's independent native dispatch receipt records exactly **one chosen / one accepted / zero rejected / one completed-postcondition**, selecting the real face-up public **Mega Absol ex M1L** as new Active. It uses `actorObservation` to avoid hidden opposing zones and explicitly records that the prompt perspective was the answering owner. This first-source promotion is a meaningful **postattack source response**; it is the native effect of the contender's attack and is **not evidence that source proactively improved its strategy**. The original source later still Passed before making a genuine Squawkabilly ex play.

Native completion and source/contest reply strength remain unproven. The current v13 receipt confirms native Store **selection and prompt completion**, but does **not independently log before-vs-after source Active zone identities or Prize-to-hand card-count custody**. Those should be counted separately from prompt action acceptance. The new capped 48-root result is not a full game and cannot establish Winner, paper-legal KO effects, 25-minute timing, or contender strength.

## Release implication

The longstanding exact rank11/champion root25/26 decoding blockers have a **concrete existing-component composition repair**, tested through actual native Store accepted actions and same physical original opening. It should be considered for the steward's single shared bilateral policy after stronger printed-payment/custody checks, both-seat behavior and full original opposing replies. A separate read-only owner Prize count custody hook can validate the hand/Prize transfer at the genuine Store boundary without allowing player policies to view concealed cards.

The previously measured critical **source Trainer starvation** continues: original rank6 and rank11 actors often choose Pass while holding at least one generically unblocked Trainer; and the 48-root fixed limit truncates turns as prompt handling changes. Neither problem is resolved by v13. Do not infer 99.5% or nominate a fixed candidate list from this narrow liveness gain.

**Status: 8 original matched starts / one rescued Prize action / one rescued source promotion / no engine-error in v13 cohort / zero complete games / zero competitively qualified games.**
