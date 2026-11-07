# Agent21: preserve four Fog Crystal by replacing one Rescue Carrier with Night Stretcher

**7 November 2026 UTC. Standalone deck-design hypothesis, source-text and exact mathematics only. No prospective games, no demonstrated match win improvement.**

## Why this materially changes the earlier Energy Retrieval branch

The frozen [source New Moon English 60](../als/new-moon-lockbreak-english-proxy-60.json) and [Japanese original print inventory](../als/new-moon-lockbreak-japanese-print-60.json) contain **four Fog Crystal, two Rescue Carrier, zero Night Stretcher and zero Energy Retrieval**. My preceding [source-exposed Secret Box analysis](agent21-secretbox-energy-retrieval-vs-fog-20261107.md) proposed `-1 Fog Crystal, +1 Energy Retrieval` as a source-qualified conditional *hypothesis*, sacrificing one early Fog search to gain an alternative Basic Energy supply route from owner discard.

A newly examined alternative retains **all four Fog Crystal** and instead exchanges **one of the two Rescue Carrier for one Night Stretcher**. Night Stretcher is an **Item** capable of returning **one Pokémon of any HP or one Basic Energy card** from owner discard to hand. It is source-verified from the [official Japanese 2024 Night Wanderer print, SV6a 056/064, card ID45931](https://www.pokemon-card.com/card-search/details.php/card/45931) and [English Shrouded Fable SFA61](https://limitlesstcg.com/cards/SFA/61), Expanded legal. The original [Rescue Carrier EVS154](https://limitlesstcg.com/cards/EVS/154) instead returns **up to two Pokémon, each HP90 or less**, with **no Energy-recovery mode**. Neither universally dominates the other: one Carrier can simultaneously recover two Unown or Duskull, while one Night Stretcher can recover a high-HP Pokémon or Basic Energy. Which effect matters depends on the board, available hand and matchup. All are Item lock-sensitive.

The exact alternative printed 60s are [unqualified English SFA proxy](../als/agent21-night-stretcher-carrier-fork-english-proxy-60.json) and [Japanese original print](../als/agent21-night-stretcher-carrier-fork-japanese-print-60.json), each preserving 60 cards, all four Fog and one remaining Rescue Carrier. The original official source sixty and 2026 tournament opponents remain unchanged.

Of the **29 authenticated original Aichi Top 32 lists** in `results/aichi-2026/full-decklists.json`, five contain Night Stretcher (ranks **1, 3, 8, 19, 22**), none contain Energy Retrieval, eleven contain Super Rod, ten contain Secret Box, and two contain Fog Crystal. This is a count from 29 specific source entries, not an optimality argument or extrapolation to the three missing Top32 lists.

## Exact K0 conditional search-channel comparison

This is a **hypothetical, carefully restricted** marginal-card-location calculation, not the original game state’s posterior or a game-win statistic. Assume a 35-card owner deck and six unknown Prize positions and **uniform exchangeability among the unresolved distinct target copies**. Condition on two original Basic Psychic having reached owner discard and one Fog Crystal used elsewhere, leaving **one Basic Psychic + three Fog Crystal** unresolved. Assume three discardable other cards for Secret Box and an unspent ordinary Energy attachment, and an owner Active with an immediate lethal one-energy printed attack against the opponent. The original historical root93 actually had Basic and Fog in its deck, and earlier legitimate K1 searches may refute this uniform model.

| Fixed 60 counterfactual | Remaining hypothetical search targets | `P` of at least one live Basic-funding Item route |
| --- | --- | ---: |
| Frozen four Fog + two Carrier | 1 Basic, 3 Fog | **85.193048%** (`17255/20254`) |
| `-1 Fog +1 Energy Retrieval` | 1 Basic, 2 Fog, 1 Retrieval | **97.997926%** (`39697/40508`) |
| `-1 Carrier +1 Night Stretcher`, keep 4 Fog | 1 Basic, 3 Fog, 1 Stretcher | **98.156720%** (`1471169/1498796`) |

The third proposal improves modeled *late-stage route access* by **12.963672 percentage points** relative to frozen baseline and **0.158794 points** over the Fog-removal variant. The exact new missing-route event is `Night Stretcher Prized AND [Basic Prized OR all three Fog Prized]`, with

`P(failure) = C(6,2)/C(41,2) + C(6,4)/C(41,4) - C(6,5)/C(41,5) = 27627/1498796`.

Both alternative route calculations give **zero salvage value** to an Item when owner discard contains no Basic Energy. While Night Stretcher can separately recover Pokémon, that distinct tactical value is deliberately not monetized in this simple one-energy recovery statistic.

## What changes early

Holding a Fog Crystal in an unconditional starting hand of seven remains **39.949963%** with the Night Stretcher proposal, compared with **31.542957%** in the alternative that removes one Fog. The relevant risk instead concerns lowering Rescue Carrier from two copies to one and foregoing the `up to two ≤90 HP Pokémon` single-Item effect. One-versus-two Carrier opening-seven incidence is a measurable proxy but no evidence of the actual multi-Pokémon recovery probability across natural games. Any real evaluation must condition on `Unown` timing, relevant discard targets, search/copy contention, the first likely Item-lock turn, opponent's Prize plan, and whether the real hand has three expendable cards when Secret Box is chosen.

The original historic root93 three-card payment used a Rescue Carrier from hand. The proposed one-Carrier physical deck cannot simply inherit that original hand or shuffle; **the swap changes card custody, seed deal, and source line eligibility**. The only valid payoff evidence is a new natural shuffled fixed-list evaluation, registered before observing game outcomes.

## Native-engine qualification and limitations

The native pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements the required SFA print as `Night Stretcher SFA` in [`nightly-stretcher.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/nightly-stretcher.ts). Its `playCard` constructs a `player.discard` `ChooseCardsPrompt` with max one, Basic Energy or Pokémon target and opponent reveal. It appears to permit `min:0` despite the printed mandatory single choice, and its **`canPlay` appears to report true if the only discard card is a Special Energy**, while the effect rejects that same state because it requires Basic Energy or Pokémon. These are **static suspected rules/solver mismatches** prior to native reproduction. Do not patch upstream directly.

The unrelated proposed Energy Retrieval Item has now been **proved physically usable as a standalone Item in the actual pinned Store** on both seats, [eight native controls, CI 42347674046](agent21-pinned-native-energy-retrieval-custody-20261107.md). At report creation, the Night Stretcher native dual-mode and Special-only negative test has been committed as [test](../../tests/agent21-night-stretcher-staged-native.test.cjs) and run through a bounded shared CI workflow; do not infer passing native test results until GitHub CI reports success and its artifact is examined.

The source-level 60 comparison and exact combinatorial regressor [`tests/agent21-fog-preserving-night-stretcher-fork.test.cjs`](../../tests/agent21-fog-preserving-night-stretcher-fork.test.cjs) cover printed validity, only one changed named card, 29-source context, opening incidence and precise three-way conditional results. No source-independent **winning policy**, 32/32 field evaluation, optimized final single deck, or 99.5% evidence has been demonstrated.

**Next decisive experiment:** native both-seat one Basic and one Pokémon recovery, physical Item cleanup, one-Energy attachment, plus an active check of Special-only `canPlay` versus actual `PlayCardAction`. Then a preregistered three-way fixed-60 trial using natural source deals, matched seeds and a competent opponent, with failure/abort denominators retained. Preserve the two original Rescue Carrier recovery tactics as a control so one attractive late-game recovery search does not hide losses on other lines.
