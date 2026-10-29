# Same-root native attack versus Bench Special Energy sequencing, 29 October 2026

**Agent 5.** **Evidence type:** Preregistered, staged, matched genuinely native Store actions on **both physical seats**. **Competitive-qualified games: zero**.

## Research question

Does the existing common `chooseActorRootIntent` first-return order remove a physically executable, owner-visible alternative when a printed attack is already payable? A structural `attack` return currently comes before the optional `choosePublicContextSpecialEnergy` branch, so a useful Energy play can remain unexplored even when both actions have a genuine Store route.

This investigation was [registered before code and execution](../aichi-2026/registrations/agent5-staged-attack-special-arbitration-20261029.md). Its purpose is a **mechanical action-opportunity witness**, not a decision that all or most Bench attachments are strategically preferable.

## Frozen true-Store stage

At global turn 2, in Expanded, owner Active is printed `Venonat MEW` with a physical `Psychic Energy SVE` attached; it has the printed `Gnaw` attack costing one Colorless. Owner has `Regidrago V SIT` on Bench index 1, and one `Double Dragon Energy ROS` in hand. Opponent has `Pidgey MEW` Active, no Energy, plus a staged nonempty deck and six Prize cards; owner also has a staged deck and six Prize cards. Each physical player gets five genuine `PokemonCardList` Bench slots. The initial physical setup is reconstructed identically for each branch and both seat orientations, with no natural draw claimed.

Use `actorObservation` for frozen owner-visible root state, `buildActorCardCatalog` for printed metadata, `chooseActorRootIntent` with `publicContextSpecialEnergy:true` and `choosePublicContextSpecialEnergy` independently for the proposed alternative. The actual attack and Energy effects come only from the pinned Twinleaf `Store` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Actual comparison

```text
Same actor-visible root, both seats:
  First-return route: chooseActorRootIntent -> attack Gnaw
    -> native AttackAction -> native WaitPrompt resolution
    -> real opponent damage; owner attack window ends
    -> Double Dragon remains in hand, Regidrago Bench unpowered

  Alternative route: choosePublicContextSpecialEnergy
    -> Double Dragon Energy on Regidrago V (Bench slot 1)
    -> native PlayCardAction physically attaches exact printing
    -> real Store physical-target witness; no prompt pending
    -> chooseActorRootIntent -> same Gnaw attack
    -> native AttackAction -> native WaitPrompt resolution
    -> real opponent damage; owner attack window ends
```

The independent first-route and resource-route stores must have **identical detached owner-observation inputs**. In the alternative, native `PlayCardAction` must consume Double Dragon from owner hand, physically add it to Regidrago's Bench Energy, leave owner turn available and produce `confirmed-public-effect`. The subsequent policy root must select `Gnaw`, and both native attacks must settle with the same positive opposing Active damage. All of these assertions passed in both seats.

## First failure and engine resolution

[Initial compiled native CI 40966362253](https://github.com/FlareZ123/experiment-01/actions/runs/40966362253) failed at the first branch after dispatching `AttackAction`, because the immediate opponent damage was zero. Inspection of the pinned `game-effect.ts` implementation shows that `useAttack` enters the attack phase and issues a native animation `WaitPrompt` **before** its `BeforeDoingDamageEffect`, `DealDamageEffect`, and `EndTurnEffect`. A submitted attack without prompt settlement is therefore incomplete.

The script was corrected to resolve only genuine `WaitPrompt` instances through `ResolvePromptAction`, recording prompt types and failing closed on other decision prompts, with a bounded maximum. The corrected [CI 40966939379](https://github.com/FlareZ123/experiment-01/actions/runs/40966939379), head `ef94563d5880c112548e63a7f3a91c14f4f5a7a1`, **succeeded**. All original pure policy tests, the pinned submodule compilation, previous native Stadium and Special Energy target controls, and the two-seat staged arbitration comparison passed. The action receipt is retained in workflow artifact `agent5-attack-special-arbitration-native.json` under that run (30-day retention).

## Inference and limits

**Observed:** In the stated staged position, the baseline first-return actor policy takes a natively payable attack before exploring a second natively executable action; the alternative `attach -> attack` settles on the same turn in both seats. This is a validated **sequencing-coverage conflict** for the optional Special Energy route.

**Not established:** The play `attach -> attack` is not necessarily the strategically best choice. It consumes a scarce Energy which might have much greater future value. A real action planner must score state-dependent discardability/resource protection, threats, opponent response, attack damage and Prize implications, and competing search/Supporter use. Also absent: naturally dealt original-source opportunities, opponent autonomous reply, full-board continuation, completed 60-card matchups and objective win rates.

The result supports the 29 October Critic's recommendation to replace independent first-return heuristics with a common **simultaneous action-affordance and opportunity-cost arbitration** layer. Reusing the existing Agent 16 owner-only action-contention seam is preferable to making automatic Energy-before-attack an unconditional new rule.

**Aichi status unchanged:** 29/32 registered exact original opposing 60s; missing original full lists at ranks 23, 25, and 28; zero competitively qualified matches; no evidence-backed fixed 60 that achieves 99.5%.
