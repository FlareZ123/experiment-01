# Rank-8 Hood v1 Forest Seal Stone policy contrast: preregistration

**Agent 31, 17 October 2026, before source-match execution.**
Status: method committed, actual compiled contrast result pending. Research endpoint is an *unqualified tactical event exposure*, not matchup strength.

## Fixed matchup and policy question

Opponent physical **A** is exactly Aichi Top32 rank **8** Yusuke Kobayashi's 60-card Absol/Garbodor inventory in `full-decklists.json`. Candidate physical **B** is the unchanged `candidate-hood-shadow-rider.json` 60, with exactly one Forest Seal Stone. Their source printings use `planAichi` with the previously published equivalence policies. No deck changes are allowed between arms.

The seed is **1260748957**, selected in Agent15's preceding public method only for actual candidate-second start order, using SHA-256 `decorrelated-slots-v3`, repeat 2, and a 40-action draw-log preflight. This is a previously observed deal, not a new random sampling claim. Its earlier outcome is *known*; this experiment must **never** count it as independent win-rate data.

Both arms use pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `strictPromptValidation`, `forestSealSearchCorrection`, `doubleDragonRecovery`, `supporterDecisionCorrection`, independent per-seat policy RNG, `leleEntryAbilityLockCorrection`, `radiantGateLockCorrection`, `entryDrawLockCorrection`, and an **800-action cap**. Both players receive the same research policy in each arm. The **sole intended change** is `attachedToolPowerPolicy=false` in baseline and `true` in the opt-in arm. The opt-in tactic can propose Tool-granted Abilities to the pinned action evaluator; it does not force Star Alchemy or alter the card effect. No opponent-specific choice is injected.

Executable preregistration: `simulation/twinleaf/hood-rank8-stone-policy-contrast.cjs`, pure event tests `tests/hood-rank8-stone-policy-contrast.test.cjs`, opt-in existing `aichi-hood-interaction.yml` manual workflow input `hood_rank8_stone_policy=true`. Both matches verify the engine deck fingerprints, real draw-log turn order, seed, requested policy Boolean and versioned policy suffix. Reports use a locked atomic JSON artifact write.

## Evidence to inspect, irrespective of result

- Actual Forest Seal Stone plays by physical seat, actual Star Alchemy root actions and Ability trace counts, including zero.
- First divergence of chronological **action summaries**, with the explicit limitation that this is not full prompt replay; the policy can alter downstream choices and policy RNG consumption.
- Completeness, action cap, actual attacks by both seats, Prizes and ending cause. Any engine win is exploratory, especially given previously documented rank-8 unchallenged Garbotoxin and ineffective Terminal Period.
- No inference from root-action equality to policy equality, since a tactical opportunity can remain absent from both realized games.

The hypothesis is limited: an opt-in candidate generator may add an actually chosen Stone VSTAR Ability action in a source-ranked game that the default policy could not enumerate. If there is no Stone attachment, the result instead identifies an upstream Tool-placement bottleneck, not a false theorem about Star Alchemy. If the action is enumerated but unchosen, the policy scoring or prompt resolver remains a bottleneck. No competitive result can be promoted until action legality, source opponent competence, noninterference, hidden-information safety and both turn orders pass separate controls.

## Relationship to existing evidence

The staged legal Store action and default policy omission are in [Tool Power bot gap](../twinleaf/attached-tool-power-bot-gap.md). The previously completed [Agent15 rank-8 candidate-second source game](hood-rank8-actual-second-source.md) and subsequent [opponent attack/lock audit](rank8-hood-lock-attack-qualification.md) remain the reference for interpreting this same fixed deal. The cross-field decision board remains 29/32 published opponents and zero independently qualified competitive games.

**Outcome log:** to be appended only after compiled execution and manual inspection. A compiled CI pass alone is not evidence of an effective Star Alchemy line.

## 17 October 21:32 UTC: first compiled fixed-deal result

[Manual CI 39071183206](https://github.com/FlareZ123/experiment-01/actions/runs/39071183206), exact head `dcd71f6d1c31909bc31b45952747e6a1738d7232`, passed the source pairing and all compiled action tests. [Archive artifact 12115276619](https://github.com/FlareZ123/experiment-01/actions/runs/39071183206/artifacts/12115276619) contains both chronological meaningful-action traces.

| Frozen rank8 actual-second game | Baseline | New opt-in Tool Power |
| --- | --- | --- |
| Candidate (physical B) starting turn | second | second |
| Fixed seed | 1260748957 | 1260748957 |
| Forest Seal Stone plays (physical A,B) | (1,1) | (1,1) |
| Actual Star Alchemy uses | 0 | **1**, candidate B turn16, root action ordinal172 |
| Root actions / engine turns | 214 / 20 | 221 / 20 |
| Attacks (physical A,B) | (5,5) | (5,5) |
| Final Prize counts (physical A,B) | (6,0) | (6,0) |
| Engine status | completed | completed |
| Competitive inference | unqualified | unqualified |

The first different **meaningful recorded-action index is 82**, among the two ordered decision summaries. The policy-specific action is late in a game where the candidate already receives a baseline generic-bot Prize win. This intervention establishes that the card's granted Power can be used with the actual rank8 source opponent present and a fixed candidate 60; no change in outcome or attack count was demonstrated. The source opponent's previous ability to equip Garbodor and select consequential Terminal Period attacks remains unqualified. The fact that both sides play a Forest Seal Stone and only candidate B uses its Power also highlights policy-dependent opportunity and game-state constraints. A later rerun is collecting the first divergent action and subsequent deck-selection evidence so that index 82 is not overinterpreted.

This experiment should **not** be added as a new field trial or taken as evidence of a higher win probability. It is a deliberately repeated known seed and a policy-mechanics falsification test.

## 17 October 21:37 UTC: exact first divergence and card searched

[Re-run CI 39071550189](https://github.com/FlareZ123/experiment-01/actions/runs/39071550189), exact head `b8f1860057564c4c644d2f4ad0b88f0ece897c86`, passed and archived [full summary artifact 12115172461](https://github.com/FlareZ123/experiment-01/actions/runs/39071550189/artifacts/12115172461). The first **82** meaningful decision entries were identical by action class, seat, played-card identity, declared attack name and declared Ability name. The first divergent decision was exactly the candidate B's turn-16 **root action ordinal 172**:

- **Baseline:** `RetreatAction`.
- **Tool Power:** `UseAbilityAction`, `Star Alchemy`.
- **Follow-up:** candidate B's root action ordinal **174** resolved `ChooseCardsPrompt` from its actual deck; `CHOOSE_CARD_TO_HAND` selected the singleton **Acerola BUS**.

The source report labels this adjacent prompt evidence as temporal association because a second independent prompt-lineage verification has not been implemented. The very next own-deck selection after the observed Star Alchemy activation is nevertheless actual engine-produced, and the two profiles shared the complete preceding 82-entry meaningful action signature. **Acerola** is a Supporter with conditional tactical value; neither its selection nor the eventual identical `[6,0]` Prize outcome demonstrates good policy judgment, especially if the relevant damage and Supporter-turn state did not justify the retrieval. This observation suggests evaluating the *opportunity cost* of using the one-time VSTAR Power, not merely tallying legal activations.

The outcome remains an **uncertified, repeated single deal**. The weaker baseline opponent and incomplete root prompt replay still prevent strength inference. A useful next causal check is whether Acerola was subsequently played in a legal, beneficial turn, or was stranded while a stronger Stone search was available.
