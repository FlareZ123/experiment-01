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
