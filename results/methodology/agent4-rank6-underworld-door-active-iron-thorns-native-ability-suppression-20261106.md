# Agent4: Underworld Door aborts coincide with effective native Initialization lock

**6 November 2026 | twelve native Store attempts, three A/B/A modes, zero paper-qualified games.** [Successful manual CI 42306515717](https://github.com/FlareZ123/experiment-01/actions/runs/42306515717), [artifact 13546787229](https://github.com/FlareZ123/experiment-01/actions/runs/42306515717/artifacts/13546787229), artifact ZIP SHA256 `920737de52338c02950d9b9118e967562c28786b4015c4747dbc0f25a380d391`; checkout `3ed5fb4054f562d4e4baf3d79008559fdd26ce59`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Question

At the exact two [3 November v3 rank6 historical UNKNOWN_POWER abort contexts](agent4-v3-two-underworld-door-native-typed-dispatch-20261106.md), was the public source Active an Iron Thorns ex with Initialization, and did the actual native Store regard the acting champion's face-up Shadow Rider Calyrex VMAX **Underworld Door** as blocked? The earlier [typed replay 42304596431](https://github.com/FlareZ123/experiment-01/actions/runs/42304596431) identified the rejected power name but had no effective-lock receipt.

## Experimental mechanism and custody

Preregistered [source-preserving post-rejection witness](../aichi-2026/registrations/agent4-underworld-public-lock-probe-v1-20261106.json) reused the explicit [12-attempt amendment](../aichi-2026/registrations/agent4-v3-two-unknown-power-native-12-20261106.json): two exact rank6 source seeds, two unchanged champion/New Moon printed candidate decks per source group, three unchanged selected-v3 A/B/A policy modes, 180 native roots cap. The prior original manifest `5a6c877ceee571f2f48bfbba83d50c913d7da9b2` remains exact; original roster and baseline-policy profile hashes still match historic v3, while three implementation blobs have drifted. This is contemporary-source retrospective diagnostic evidence, not the old byte-identical v3 execution.

The additional [reversible public witness](../../simulation/twinleaf/agent4-underworld-door-public-lock-witness.cjs) watches actual AddPlayer-started native Store instances, and only an authentic `UseAbilityAction` named `Underworld Door` whose underlying Store dispatch **already throws `UNKNOWN_POWER`**. It snapshots only the pre-dispatch public acting owner's in-play printed Pokémon and opposing visible Active. **After the Store rejection**, the pinned `IS_ABILITY_BLOCKED(store,state,owner,pokemon,that actual printed power)` helper is called on the real face-up owner Power. It records the result, preserves the original thrown error and changes no underlying selected action. The optional wrapper is contained in a new [native experiment](../../simulation/evaluation/agent4-rejected-underworld-public-power-v1.cjs) and the original typed observer remains present.

The first [CI 42306083582](https://github.com/FlareZ123/experiment-01/actions/runs/42306083582) failed before native matches because a pure test fixture referenced `REG.modes` on the second registration rather than its parent. That mock-only error was corrected and the second run above passed its full pure, compile, native, archive and all six strict evidence gates.

## Native result, all six rejections

| Exact original trial | v3 seed | Source Active in each of three modes | Owner's face-up attempted Power source | Native pinned PowerEffect verdict |
| --- | ---: | --- | --- | --- |
| `6:401:A:champion-reference` | 582147744 | `Iron Thorns ex TWM`, printed `Initialization` | `Shadow Rider Calyrex VMAX CRE` on Bench **index 0**, printed `Underworld Door` | **blocked: true** in control A, selected B, A-repeat |
| `6:402:B:champion-reference` | 2765516960 | `Iron Thorns ex TWM`, printed `Initialization` | `Shadow Rider Calyrex VMAX CRE` on Bench **index 1**, printed `Underworld Door` | **blocked: true** in control A, selected B, A-repeat |

Each of the six attempted `UseAbilityAction` roots **rejected with `UNKNOWN_POWER`**, one per original champion-context/mode. Each actual live Store identified exactly one printed Underworld source; the source's Bench index matches the typed rejected action's `target.index` (respectively 0 and 1), and the pinned card system uses `PlayerType.BOTTOM_PLAYER` for the owner Bench. The witness evaluated the exact printed real Power object with the pinned PowerEffect helper and recorded `probeErrorClass:null` in all six rows. The registered New Moon companion attempts produced no matched named rejection.

All six preregistered completeness gates evaluated **true**: exactly 12 native attempts; four actual live Store instances per mode; six named native `UNKNOWN_POWER` rejections; six corresponding public postreject native Ability checks; exact across-mode source and full original/candidate physical starting deals for all four source/candidate contexts; and exact A-control/repeat public root-ledger hashes and statuses.

## Interpretation, exact pinned engine explanation

At [pinned Twinleaf revision a9905a76](https://github.com/twinleafgg/twinleafgg/tree/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05), `player-turn-reducer.ts` resolves an attempted `UseAbilityAction` through `CheckPokemonPowersEffect`; it emits `UNKNOWN_POWER` when the named Ability is absent from the filtered list. The pinned `iron-thorns-ex.ts` implements `Initialization` through `HANDLE_ABILITY_LOCK`, suppressing non-Future Rule Box Pokémon's Abilities while its Active lock is effective. The pinned helper `IS_ABILITY_BLOCKED` tests a PowerEffect against the actual board. Here a real non-Future Rule Box VMAX had its printed Ability blocked, with Iron Thorns ex visibly Active in every replicated failure. These three independent observations are **strong evidence of an Initialization-type native lock conflict leading to the action mismatch**.

This is still **not a unique causality proof**. The public state may contain another overlapping Ability suppressor or a protective Tool/Stadium interaction. A full counterfactual control removing just Initialization, with all other active effects held constant and all legal source actions preserved, would be required to attribute exclusivity. The helper is a native engine observation, neither independent verification of Japanese paper rules nor evidence that the policy may access hidden opponent information.

Importantly, the [Agent31 owner Underworld root chooser](../../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs) explicitly returns roots with `nativeEffectAndLocksVerified:false`, relying on native Store to judge actual playability. That architecture can select a printed, unspent Ability from the acting owner's visible Pokémon that is currently suppressed, causing the deterministic abort. A stronger candidate policy should check the actual owner-visible power-availability conditions **before** submitting a native action, then compare the best other legal actions at the same connector/turn and preserve paid follow-up, including the opponent's real continuation. Conservatively turning the whole turn into Pass is an incomplete strategic fix.

## Status and next action

The old v3 release still **fails** its all-context closure and policy-change gate; this diagnostic fixes the **identity and observed native lock condition** of its two aborts without changing game outcomes. There are zero fully paper-qualified games, zero audited paper-clock finishes, 29/32 authenticated full original opponent inventories and no demonstrated 99.5% win rate.

Next: add a separate native prospective owner-power availability guard in the acting choice code, tested on the two historical seed pairs plus new holdout seeds, with no source-deck changes. Compare blocked-Ability rejections, actually chosen alternative roots, GameState custody, opponent follow-through and all original/companion matches. Do not patch upstream Twinleaf or silently reinterpret a longer root count as a stronger deck.
