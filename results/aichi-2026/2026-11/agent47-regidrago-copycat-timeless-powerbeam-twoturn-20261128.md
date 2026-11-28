# Agent47: two-consecutive-turn Mimikyu→Apex→Timeless / Power Beam policy, both seats

**28 Nov 2026.** Branch `agent47/copycat-timeless-two-turn-plan-20261128`, based on source-only draft PR #98. No qualified competitive game, no benchmark win claim, and no replacement of either candidate fixed 60. Scope is an exact public-state ranking repair in the **existing** Agent46 pure candidate worker, not a new competitor deck.

## The actual previously broken line

The authenticated Aichi ranks 10/12/13/14/18/20/21/27/32 include Dragon **Dialga-GX UPR100** and **Regidrago VSTAR SIT136**. After an opponent's non-GX `Apex Dragon` is actually observed, the candidate's Mimikyu GRI58 can conditionally use `Copycat` to use that copied attack, selecting one of its **own Dragon discard Pokémon** via delegated Apex. Candidate sixties contain Dragon Dialga UPR100 and Dragon Radiant Eternatus CRZ105 as payloads.

The prior uncoordinated Agent46 worker scored `Copycat` at root as **50000** for observed Apex + own Dialga + unspent GX, regardless of whether its subsequent Apex Dragon prompt selected `Timeless-GX` (150, extra turn) or `Power Beam` (200). In absence of live Fairy Zone, nested prompt scored Power Beam 200 versus Timeless 150, taking Power Beam without the extra turn. After a Timeless-GX *was* used, root's Copycat predicate categorically failed because GX was spent, abandoning the second half of the 150+200 two-turn plan before the opponent could act.

## Candidate-only source change

`simulation/evaluation/2026-11/agent46-candidate-policy.cjs` now makes the following line *conditionally* executable in the opaque-token pure worker, under exact actor-visible predicates:

1. **First Mimikyu turn:** with an authenticated non-GX Apex attack history row, active Mimikyu GRI, unused GX, own discarded Dragon Dialga-GX UPR100 and Radiant Eternatus CRZ105, and a clean 280-HP Regidrago VSTAR SIT136 without a Tool or Fairy Zone, choose Copycat at root then `Timeless-GX` at nested Apex prompt (rather than `Power Beam`). Timeless 150 damage is below Regidrago's 280 HP, but grants another immediate own turn.
2. **Consecutive actor turn:** if public owner `extraTurnActive===true`, `gxUsed===true`, same Mimikyu/Regidrago target, damage `[150,279]`, own discard still contains Radiant Eternatus, and the independently source-stamped last opponent-owned turn still contains non-GX Apex, root Copycat is permitted and ranked at 50000. In a synthetically offered first Copycat source-choice prompt it selects Apex, and in the nested Apex discard attack prompt it selects **non-GX Power Beam** 200. With Regidrago's printed lack of Weakness/Resistance and absent other modifiers, 150+200=350 defeats the 280-HP Pokémon and would secure its 2 Prizes before the opponent's next normal turn.
3. **Fail-closed scope:** no paid-GX/extra-turn flag, stale/mismatched source receipt, wrong Pokémon printing, absent Radiant, healed target, unknown defender Tool, or already-KO target blocks this special bonus. Other attacks and unspecified matchups retain existing worker scores. GX legality, attached Psychic/Colorless requirements, and native action-frontier availability still come from the real engine.

**Important limits:** this is an attack-ranking heuristic, not a certified playable two-turn attack in the native pinned Store. The 150/200 damage can be altered by defense, other effects, prior GX use, or target movement; the benchmark opponent might have a different board when reached. `copycatAttack` flags and GX printing must be handled by PR #98. The synthetic two-step prompt used in tests does **not** prove Twinleaf actually presents both nested prompt layers; printed native `Copycat` may delegate automatically to Apex and produce only the Apex attack-choice prompt. `agent36-prompt-projection.cjs` currently explicitly rejects untyped `effectName==='Copycat'` prompt provenance, so any real first-stage source-choice prompt requires separate host provenance work. The staged tests never fabricate a real native game.

## Reproducible source tests

- `simulation/evaluation/2026-11/agent47-copycat-timeless-two-turn-plan.test.cjs`: **42/42** actual Agent46 source-worker V8 callbacks, two seats, first prompt, spent-GX extra-turn root, both nested prompt scores, missing Radiant, tool, stale turn, wrong target/printing, no extra turn, prior Apex absent. 18 original +24 additional source tests.
- `simulation/evaluation/2026-11/agent47-copycat-full-actor-pipeline.test.cjs`: **4/4** actual source-executed integration tests, physically both seats, fake but stateful Store observer → `copycat-multiattack-history` → public `agent8-public-event-receipt`+Agent47 bridge → Agent49 exact strict receipt validator → genuine `actorObservation` from actor-visible synthetic State → Agent46 policy root and prompt decisions. Positives follow opponent Apex t2, actor copied Timeless t3 (outcome explicitly *staged*, not native attack), actor copied Power Beam t4; negatives show opponent no-attack extra turn t3 superseding t2 Apex.
- Combined with PR #98's **60/60** source-executed tracker/protocol/actor board/bridge test callbacks, this stacked draft chain passes **106/106 V8 in-process callback groups** under synthetic Store classes and assert/test shims. Node full native simulator, physical decks, true GX resolution, game play, CI dispatch, and 99.5% are **not tested**.

## Next owner decision

Review with Agent46 (worker), Agent8/49 (turn/receipt), Agent24 (rank13), and Agent36 (prompt host). Coordinate one typed printed Copycat/Apex prompt source and candidate v3 contract to produce this end-to-end in real native Store without granting the worker arbitrary hidden zones or unsupported prompts. This research branch should be a **draft PR against the PR #98 source branch**, not merged to main independently. Native/CI/game dispatch requires separate authorization under existing sealed-candidate lane.

— Agent47
