# Aichi 2026 authenticated original 29: greedy starting-Basic choices consume future Bench Ability opportunities

**Agent 50 | 4 November 2026 | Exact opening-hand census, developmental evidence only**

## Decision question

The *actually selected* Issue #25 executing v0/v1/v2/v3 stack installs `simulation/twinleaf/agent50-owner-starting-basic-choice.cjs` as its only starting Pokémon choice. Its `chooseOwnedStartingBasics` selects every owner-hand eligible Basic Pokémon until the native setup prompt maximum. The pinned Twinleaf source `ptcg-server/src/game/store/reducers/setup-reducer.ts` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` sets normal initial `CHOOSE_STARTING_POKEMONS` to `min=1,max=6,allowCancel=false`: the first selected card goes Active; subsequent selections go directly to the Bench **during setup**. The advanced paper rulebook's E-06 trigger occurs only when a qualifying Pokémon is played **from hand onto the Bench during its owner's turn**. Thus eligible in-turn support Pokémon consumed at setup forfeit that later entry trigger.

This is a concrete weakness in the **executing** generic opening policy. It does not establish that a particular competing opening policy, deck, or matchup is stronger.

## Verified exact-printing trigger classes

The indexed, source-printing-verified on-Bench Ability Basic Pokémon present across the authenticated original 29 sixty-card inventories are:

| Printed Pokémon | Ability | Qualifying effect |
| --- | --- | --- |
| Articuno-GX CES 31 | Legendary Ascent | When played from hand onto Bench during turn |
| Crobat V DAA 104 | Dark Asset | Same hand-to-Bench condition; draw |
| Dedenne-GX UNB 57 | Dedechange | Same hand-to-Bench condition; draw/discard |
| Eldegoss V RCL 19 | Happy Match | Same hand-to-Bench condition; Supporter recovery |
| Radiant Eternatus CRZ 105 | Climactic Gate | Same hand-to-Bench condition; VMAX setup |
| Tapu Lele-GX GRI 60 | Wonder Tag | Same hand-to-Bench condition; Supporter search |

**62 physical copies** of these printings occur in **23 of the 29** authenticated original 60s. This is based on exact source set and card number and their printed Ability text, not name-only assumptions. Three separately Basic-verified promotional printings missing from the English index (SMP217, XYP67, XYP49) remain **unknown as to text** and are not silently classified as non-triggering; rates below are therefore conservative for unresolved source card text.

## Exact finite-population model

For a given original printed 60, let `B` be its eligible starting-Basic count and `S` the count of indexed Basics with the exact qualifying printed Ability. The opening seven physical cards are uniform, conditional on containing at least one Basic. Since the selected native policy can select only six Basic cards, opening hands with seven Basics are excluded from the counted exposure events rather than pretending all seven are automatically consumed.

The **consumed-trigger opportunity** numerator is:

`sum C(S,t)*C(B-S,r)*C(60-B,7-t-r)` over integer `t>=1,r>=0,t+r<=6` and feasible seven-card hands.

The **avoidable-trigger opportunity** numerator is the same sum restricted to `r>=1`, meaning a distinct nontrigger Basic was already in the opening seven, so that other Basic could legally become Active while the trigger Pokémon remains in hand. Both probabilities divide by `C(60,7)-C(60-B,7)`.

The word *avoidable* describes a physical setup option under a bounded first-hand model. It deliberately excludes opponent locks, card draw, Bench contention, actual legal in-turn plays, native Store acceptance, strategy, Prizes, or game outcome. Holding a trigger Basic in hand could still be worse in a particular game.

### Equal-rank findings, 29 known originals

- **26.5586623355%**: mean probability the all-eligible-Basics selected setup consumes one or more known on-Bench trigger Basics, given a valid seven.
- **18.4379338784%**: mean probability of a *physically avoidable* trigger consumption, requiring at least one alternative nontrigger Basic in that same valid seven.
- **36.4514206082%**: rank 4 (Raichu Electrode), `B=13,S=6`, has the largest known avoidable-exposure rate.
- **34.198055576%**: ranks 18 and 19, each `B=16,S=4`, are also unusually exposed.
- **18.5337488184%**: rank 11 (Absol Garbodor), `B=11,S=2`.
- **0%**: ranks 2, 6, 7, 17, 24 and 29 have no indexed qualifying copy in their registered source printing; the zero is conditional on the three unresolved promos not introducing new relevant trigger facts.

The mean treats each of the 29 **authenticated historical opponents** as one equal-weight rank, and conditions separately on each valid seven. The benchmark still lacks original lists for ranks **23, 25 and 28**, so there is no asserted 32-field statistic.

## Reproduction and native-source audit

- Exact indexed source parser, explicit unknown-promotional status and combinatorial physical-hand calculation: [`simulation/evaluation/agent50-opening-bench-trigger-exposure.cjs`](../../simulation/evaluation/agent50-opening-bench-trigger-exposure.cjs).
- [Four independent regression suites](../../tests/agent50-opening-bench-trigger-exposure.test.cjs): miniature physical-card brute force versus exact `BigInt` count; six exact printed Ability positives plus one nearby negative; real selected greedy setup mock; complete 29-original rank enumeration with frozen expected values.
- Source-input inventory: [29 exact name/count originals](../aichi-2026/full-decklists.json), [printed Basic stage classifier](../../simulation/evaluation/agent1-original-field-mulligan-bonus.cjs) and [printed card corpus](../../resources/cards/en/).
- Pinned vendor setup reducer verified independently in GitHub at `twinleafgg/twinleafgg@a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; source-only confirmation of the `max=6`, first-is-Active semantics. Twinleaf is not treated as definitive paper legality.
- Compiled CI gate is registered in the **existing manual** workflow `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml`; dispatch [run 41878325484](https://github.com/FlareZ123/experiment-01/actions/runs/41878325484). Check the actual conclusion; dispatch alone is not proof of success.

## Implication and follow-through

The **selected** Issue #25 v3 setup may spend hand-held Tapu Lele-GX, Crobat V, Dedenne-GX or similar in the pre-turn setup, preventing their printed entry Abilities later. This materially affects policy expressiveness and can bias source-versus-candidate comparison: any policy claiming competent original opponents must account for the owner-visible option to retain those cards for a turn. Agent 4's single-Basic/optional-Bench-decline strategy and Agent 5's ADP counterexample show competing options, but this report makes **no unilateral change to the running frozen v3 selected policy**. An integration steward should preregister one explicit comparison under matched **physical** opening hands, owner-only observations, real Store settlements and paired original-source outcomes before changing the shared policy.

**Qualification:** zero full competitive games, no selected best fixed 60, no calculated win rate; 99.5% target remains unproven. These are exact conditional combinatorial results and a reproducible setup-policy structural counterexample.
