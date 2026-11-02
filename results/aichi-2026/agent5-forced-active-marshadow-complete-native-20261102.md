# Native proof: forced-Active Marshadow can Fog, retreat, and Resetting Hole a Prism Star Stadium on one turn

**Agent 5 | 2 November 2026 | four preregistered staged original Store action chains, both physical seats**  
**Evidence classification:** original pinned Twinleaf card/effect/prompt mechanics. **Zero competitive game wins.**

## Previously open question and exact intersection

The existing [rank1 original-source forced-Active constructive paper line](agent5-forced-active-marshadow-same-turn-rescue-20261031.md) identified a **0.7194733328716315%** subset of valid original 7-card openings, when rank1's **Marshadow UNB** is the only Basic, holds no replacement Stadium, but holds **Fog Crystal** and either **Basic Psychic Energy** or **Float Stone**. This exact probability is a restricted initial-hand screen, not a game incidence or matchup success rate. The paper line was previously untested as a complete native action sequence. An earlier [two-seat native proof](agent5-marshadow-vs-source-thunder-prism-native-20261031.md) had begun with Marshadow **already on Bench**, bypassing the key position/mobility difficulty.

The authentic original May 10 Aichi Top32 rank1 **Shadow Rider Calyrex** source has Marshadow UNB×1, Fog Crystal CRE×4, Float Stone BKT×1, 11 Basic Psychic Energy and other searchable Basic Psychic. Original ranks6/24/29 **Iron Thorns** each carry Iron Thorns ex TWM and Thunder Mountain Prism Star LOT. Their complete unchanged source 60s are in [full-decklists.json](full-decklists.json). Iron Thorns ex's Initialization suppresses Abilities on opposing Rule Box Pokémon, yet Marshadow UNB has no Rule Box. Thunder Mountain's Prism Star destination on removal is the owning player's **Lost Zone**, not their ordinary discard pile.

## Preregistered design and limitations

[Preregistration](registrations/agent5-forced-active-marshadow-chain-20261102.md) was committed **before the first native run**. Source [native four-arm CJS](../../simulation/twinleaf/agent5-forced-active-marshadow-chain-native.cjs) runs real `Store.dispatch` of native `PlayCardAction`, `ResolvePromptAction`, `RetreatAction`, `UseAbilityAction` without modifying upstream Twinleaf. Four independent staged Stores contain the required own printed cards, an initially Active Marshadow and no Benched Pokémon, an opposing Active Iron Thorns ex, and opposing Thunder Mountain Prism Star. They vary **owner physical seat 0 or 1** and **payment resource Float Stone BKT or Psychic Energy SVE**.

All steps are actual native actions:
1. Play held Fog Crystal, resolve the authenticated owner-deck `ChooseCardsPrompt` selecting an exact printed **Shadow Rider Calyrex V CRE** that is native-valid.
2. Resolve the native `ShowCardsPrompt` to the opposing player and `ShuffleDeckPrompt` with a deterministically staged valid permutation. The fixed synthetic shuffle is deliberately *not* evidence of paper-random sampling.
3. Play the searched Basic from hand to own Bench, then attach held Float Stone or Psychic Energy to Active Marshadow.
4. Dispatch genuine `RetreatAction`, paying the printed retreat cost by either one discarded Psychic Energy or the Tool's no-Retreat-Cost effect, promoting the searched Shadow Rider.
5. Dispatch genuine `UseAbilityAction('Resetting Hole')` from the newly Benched Marshadow and resolve only nondiscretionary animation prompts.

Tests assert the opponent's Thunder Mountain is absent from Stadium/discard and physically located in **opponent Lost Zone**, Marshadow plus its attached Tool (when used) end in **owner discard**, own Active is Shadow Rider, the turn remains the same, and for the Energy branch the retreat-payment Energy has reached owner discard. Every action is native-dispatched; no simulated winner is credited.

## Observed 4/4 native staged mechanisms

| Original Store owner seat | Retreat resource | Full Fog → Bench → pay → retreat → Ability chain | Native Stadium destination |
| ---: | --- | --- | --- |
| 0 | Float Stone BKT | **Accepted** | Opponent Lost Zone |
| 0 | Psychic Energy SVE | **Accepted** | Opponent Lost Zone |
| 1 | Float Stone BKT | **Accepted** | Opponent Lost Zone |
| 1 | Psychic Energy SVE | **Accepted** | Opponent Lost Zone |

**CI:** [run 41376207812](https://github.com/FlareZ123/experiment-01/actions/runs/41376207812), **success**, source head `37c18cc83bcab778ef6eb3b9eaf6314f5688cfdf`, pinned engine commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both [step 12 native run and step 13 outcome-ledger report](https://github.com/FlareZ123/experiment-01/actions/runs/41376207812) completed. Raw source-visible **full native per-action JSON** was retained in [artifact 13111825314](https://github.com/FlareZ123/experiment-01/actions/runs/41376207812/artifacts/13111825314), archive `actor-only-root-native-retrospective-rank11`, reported SHA-256 `b68469353db208e4cb4ce4e651cd037cfc8abe40a8ccc06ffb4168a99869e973`; scheduled artifact expiration **2 December 2026**. File `agent5-forced-active-marshadow-chain.json` records all four step sequences, payment and discard zones.

## Failed-run chronology, retained to distinguish harness defects

- First dispatch [41375445117](https://github.com/FlareZ123/experiment-01/actions/runs/41375445117), 0/4 **harness completions**: exact native Fog search caused a mandatory `ShowCardsPrompt` not handled by the initial stage. Native card text proves Fog Crystal must reveal searched card. There is no evidence this was an illegal paper line.
- Second dispatch [41375867674](https://github.com/FlareZ123/experiment-01/actions/runs/41375867674), 0/4 **harness completions**: accepted reveal result is boolean `true`; audit logger incorrectly tried to call `.map` on the boolean after dispatch. No game-state illegality was established.
- Third dispatch [41376207812](https://github.com/FlareZ123/experiment-01/actions/runs/41376207812), 4/4 native successes after implementing exact pinned-engine typed `ShowCardsPrompt` acknowledgement, `ShuffleDeckPrompt` permutation validation and typed result serialization. No target cards or staged input conditions changed between arms or dispatches. No nonnative shortcut was introduced.

The original upstream `fog-crystal.ts`, `show-cards-prompt.ts` and `shuffle-prompt.ts` at the pinned Twinleaf revision were consulted for prompt mechanics. The native card and prompt implementation are executable evidence, but may still have uncovered paper-rule gaps. User-provided Advanced Player's Rulebook supports basic search, normal retreat and Bench placement; printed Marshadow and Stadium effects specify the ability and replacement outcome.

## Significance and next falsification

This closes **one mechanical reachability failure** in the champion source's mobility/anti-Stadium repertoire: **being forced to start Active Marshadow does not make its Bench-only ability permanently unavailable**, even without any held alternate Stadium, given the prescribed Fog/retreat resources. The line's strategic cost includes one Item, a consumed Energy attachment or the singleton Float Stone, surrendering the original Active position, the used Marshadow, and any available alternative search routes.

A real bilateral policy must first **observe and choose** this sequence from its allowed owner information, while comparing immediate attacking or a held replacement Stadium, respecting opposing Item and Ability locks and Bench capacity, and executing all native prompts. A true unchanged original 60 with natural hidden Prizes/deals and opponent decisions must then be evaluated, including per-seat source competence and event clock. This staged result establishes no policy selection frequency, no win likelihood, no original 60 native game completion and **zero competitively qualified games**. Exact rank23,25,28 original 60s remain unrecovered and the 99.5% objective remains unattained.
