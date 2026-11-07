# Agent 1: rank-3 turn-15 Fog Crystal search attribution

**7 November 2026 | Read-only pinned native mechanism audit.** This classifies the previously unexplained third card in the rank-1 owner's turn-15 deck loss during the exact original rank-3/rank-1 native replay. It does not change either deck, any decision policy, or Twinleaf.

## Frozen deal and provenance

- Original Aichi rank 3 Snorlax Stall 60, physical seat 0, versus original rank 1 Shadow Rider reference 60, physical seat 1.
- Seed 290134; native action horizon 260.
- Twinleaf gitlink a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
- Full physical deal fingerprint e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb.
- Rank-3 source deal fingerprint ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a.
- The rank-1 list is preserved at [benchmark-shadow-rider.md](../aichi-2026/benchmark-shadow-rider.md); line 34 lists four Fog Crystal copies.
- The pinned repository card pool entry is [resources/cards/en/swsh6.json](../../resources/cards/en/swsh6.json), card ID swsh6-140.

## Question

The piecewise owner-deck schedule reconstructed eleven Mimikyu turns with owner-side losses [2,2,2,2,2,2,3,2,2,2,2]. The turn-15 loss of three had one unexplained card removed by ResolvePromptAction before Filch. The audit asks which owner-visible action caused that extra decrement.

## Method and controls

The first observer version recorded public per-seat deck counts, action classes, pending prompt classes and the acting owner's last non-prompt action. It deliberately emitted no deck identities, Prize identities or other-player concealed hand contents.

- [v1 manual run 42362364958, artifact 13569952653](https://github.com/FlareZ123/experiment-01/actions/runs/42362364958/artifacts/13569952653) localized the event to a seat-1 ResolvePromptAction at turn 15, with a pending ChooseCardsPrompt owned by seat 1. The preceding seat-1 root was PlayCardAction, but the card was not identified because the action carried handIndex rather than a card object.
- A preregistered v2 observer resolved that integer handIndex only against the acting owner's pre-dispatch hand array. It also retained prompt property names while omitting nested options and card identities.
- [v2 manual run 42362799667, artifact 13570273839](https://github.com/FlareZ123/experiment-01/actions/runs/42362799667/artifacts/13570273839) passed all ten frozen controls. The v1 and v2 runs have identical full/source deal fingerprints, 133 actions, 25 turns, winner seat 0, and the same root-ledger SHA-256: 827d9989e5a03c35886e0cc654a81c8147bf35ce7131140181f60f8f7b7e20e0. This is a strong read-only observer non-interference check.
- The v2 audit has four pure observer tests and one native replay test; the pinned manual CI job completed successfully.

## Exact native event

| Action ordinal | Turn | Acting seat | Native action / prompt | Owner deck before | Owner deck after | Owner deck delta |
|---:|---:|---:|---|---:|---:|---:|
| 74 | 14 | 0 | AttackAction Burrow | 22 | 21 | -1 |
| 77 | 14 | 0 | ResolvePromptAction | 21 | 20 | -1 |
| 79 | 15 | 1 | PlayCardAction, handIndex 16 resolves to Fog Crystal CRE | 20 | 20 | 0 |
| 80 | 15 | 1 | ResolvePromptAction; pending ChooseCardsPrompt owned by seat 1 | 20 | 19 | -1 |
| 85 | 15 | 1 | AttackAction Filch | 19 | 17 | -2 |

At ordinal 79, the exact card object at index 16 of seat 1's own pre-dispatch hand resolves to Fog Crystal CRE. At ordinal 80, the prompt is a ChooseCardsPrompt owned by that same seat; its safe scalar type is "Choose cards". The deck loses one card when that prompt resolves. Filch then removes two more cards at ordinal 85.

The separate ordinal-77 decrement is preserved as its own prompt settlement; it is not the Fog Crystal search. The source's later deck decrement at ordinal 87 is also retained in the raw artifact and does not affect this owner-side classification.

## Card-text cross-check

The repository card pool entry swsh6-140 identifies Fog Crystal as a Trainer Item and marks it Expanded Legal. Its printed effect searches the deck for a Psychic Energy card or a Basic Psychic Pokémon, reveals that card, puts it into the player's hand, then shuffles the deck. This removes exactly one card from the deck. The original rank-1 list contains four copies.

Therefore, the turn-15 owner-side loss of three is **one Fog Crystal deck search plus Mimikyu Filch's two-card draw**. It is not a three-card Filch draw and the third card is not a mandatory turn-start draw.

## Model impact

No recurrence change is required. Agent 1's existing schedule field ownerDeckLoss deliberately counts every card removed from the owner's deck by its own effects. The turn-15 row's value 3 was numerically correct; this audit supplies the missing causal decomposition.

A future owner-only Filch policy or horizon estimator must include Item searches such as Fog Crystal when projecting owner-deck survival. Counting Filch's printed draw alone underestimates deck depletion. The schedule model does not yet value the selected Psychic Energy or Basic Psychic Pokémon, nor infer whether the search is strategically worthwhile.

## Limits

This is one retrospective native deal and one observed Fog Crystal play. It does not estimate the frequency of Fog Crystal use, prove the owner policy optimal, qualify a paper game, or support any matchup win-rate estimate. The full Aichi field remains 29/32 complete name/count inventories, with ranks 23, 25 and 28 missing; zero competitively qualified games; no selected final fixed 60; no demonstrated 99.5% win rate.

**Agent 1**
