# Held replacement Stadium is a genuine one-root alternative to the five-root forced-Marshadow counter

**Agent 5 | 2 November 2026 | 4/4 scripted native original-Store replacements, plus independently checked owner-only hold policy**

## Context

The [staged complete mechanical](agent5-forced-active-marshadow-complete-native-20261102.md) and [owner-visible five-root actor policy](agent5-owner-visible-marshadow-five-root-native-policy-20261102.md) each demonstrate four genuine native Store successes using a held Fog Crystal to get a Basic, Bench it, attach Float Stone/Psychic, retreat an initially Active Marshadow UNB, and use Resetting Hole to remove an opponent's Thunder Mountain Prism Star LOT. That anti-Stadium mechanic is available, but the previous tests did not present a direct replacement Stadium in hand. An optimizer that always rewarded executing the five-root chain would miss an immediately available competing line.

The authenticated exact rank1 **Yasunori Kato Shadow Rider Calyrex** source plays **2 Sky Field ROS**, **1 Dimension Valley PHF**, **4 Fog Crystal CRE**, **1 Float Stone BKT** and **1 Marshadow UNB**. Both replacement printings are real source resources, confirmed by [original 60](full-decklists.json).

## Locked four-arm original Store test

[Preregistration](registrations/agent5-direct-stadium-vs-forced-marshadow-20261102.md), [CJS native runner](../../simulation/twinleaf/agent5-direct-stadium-marshadow-counterfactual-native.cjs), and original [pure owner-root policy](../../simulation/twinleaf/agent5-owner-visible-marshadow-chain-policy.cjs). The four synthetic fields independently vary **owner physical seat 0/1** and **held Sky Field ROS or Dimension Valley PHF**. Each own hand additionally holds Fog Crystal CRE and Float Stone BKT, initially Active Marshadow with zero Bench, opponent Active Iron Thorns ex TWM and Stadium Thunder Mountain Prism Star LOT. The source's actor-only five-root policy is first evaluated at the visible root and deliberately returns **no Fog counter** because the simpler held Stadium may be played on this turn.

The experiment then dispatches a real native `PlayCardAction` for the held Stadium in the matching original Store. It asserts the correct replacement card occupies the owner Stadium slot, Thunder Mountain enters **opponent Lost Zone** (and not discard), original Marshadow stays Active, original owner's turn is preserved, and the two held alternative resources **Fog Crystal and Float Stone remain unspent**. The actual Stadium play consumes the owner's once-per-turn Stadium entitlement.

## Observed results

| Native source actor physical seat | Held Stadium used | Replacement accepted | Opposing Thunder Mountain zone | Fog + Float Stone remain held |
| ---: | --- | --- | --- | --- |
| 0 | Sky Field ROS | Yes | Opponent Lost Zone | Yes |
| 0 | Dimension Valley PHF | Yes | Opponent Lost Zone | Yes |
| 1 | Sky Field ROS | Yes | Opponent Lost Zone | Yes |
| 1 | Dimension Valley PHF | Yes | Opponent Lost Zone | Yes |

**4/4 native successes**, [Actions run 41377759514](https://github.com/FlareZ123/experiment-01/actions/runs/41377759514), pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The full original owner/prompt/native before-after event ledger is in [artifact 13112271598](https://github.com/FlareZ123/experiment-01/actions/runs/41377759514/artifacts/13112271598), `agent5-direct-source-stadium-counter.json`, SHA-256 of artifact reported `722a24b8b4559db16cf25a912e928ae820414b141b53aac5edddc31ea4de2e76`. Source result emitted from main head `427be2fa6171c8428e9928a7e0baf89f03aa5240`, where the task-specific source/registration was already committed. Mechanic assertions cover both printings and both physical seats.

## Improved opportunity-cost guard

The pure source policy initially vetoed the expensive five-root line whenever it **held** Sky Field or Dimension Valley. This was incomplete: a Stadium in hand is not an available alternative if that player's Stadium play was **already spent this turn** or a public lock prohibits Stadium plays. The policy now checks `ownTurnResources.stadiumPlayedTurn!==globalTurn` and `stadiumPlayLocked!==true` before applying the hold veto, and deliberately resumes the Fog-root candidate when the competing Stadium cannot be played. The correction and nine owner-only pure policy tests passed [manual Node Actions run 41377920085](https://github.com/FlareZ123/experiment-01/actions/runs/41377920085).

This distinguishes **card possession** from **currently executable alternative** and reflects the human research warning about connector domination, resource contention and Active Move Realism.

## Strategic inference limit

The short direct Stadium replacement uses **one card and one root**, preserving Fog Crystal, Float Stone, Bench space and Marshadow ability for later turns; the five-root line instead consumes an Item, a mobility payment, an Ability user and normal Retreat, while preserving the once-per-turn Stadium play. Accordingly a held and currently playable Stadium is an important competing line. **This is a strictly conditional resource comparison**, not a universal dominance theorem: playing Sky Field early may make future Stadium replacement difficult; keeping Dimension Valley could reduce a future attack cost; Fog/Marshadow could have benefits that dominate in some board states. Quantifying the matchup value requires opponent responses, threat and attack lines, real 60-card resource availability and time pressure.

All eight previously reported four-arm native setups remain **mechanical source/policy tests**. There were no full natural 60-card games or independently playing opponents here. **Zero competitively qualified games**, **29/32 authenticated exact opposing original sixties**, no demonstrated fixed-list 99.5% win rate.
