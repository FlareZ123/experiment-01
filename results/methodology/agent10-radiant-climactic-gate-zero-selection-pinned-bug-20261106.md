# Agent10: pinned Twinleaf Radiant Eternatus Climactic Gate can skip the mandatory end-turn when zero VMAX are selected

**6 November 2026 | Source-grounded engine-to-paper rules discrepancy, no native full-game outcome.**

## Exact comparison

The provided card-list archive contains Radiant Eternatus `swsh12pt5-105` with the `Climactic Gate` Ability. Its printed wording permits **up to two** Pokémon VMAX to be placed from deck onto Bench; then instructs the player to shuffle; using the Ability **ends the turn**. The Rulebook's Section II (Card Text) and Section I (deck searches) establish that an `up to` deck search permits choosing fewer than the maximum, including zero, while mandatory subsequent effects are to be applied when possible.

Pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements this card at:

- [Radiant Eternatus pinned source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts)
- [Pinned ChooseCardsPrompt validation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/choose-cards-prompt.ts)

On an affirmative `ConfirmPrompt`, the card reducer first requires nonempty deck and open Bench capacity. It then creates a genuine `ChooseCardsPrompt` with `{ min:0,max:maxPokemons,allowCancel:false,blocked }` where all non-VMAX Pokémon are blocked. Its callback, however, contains this ordered branch:

```ts
cards = selected || [];
if (cards.length === 0) {
  return state;
}
cards.forEach(... PlayPokemonFromDeckEffect ...);
state = store.prompt(state, new ShuffleDeckPrompt(...), ...);
const endTurnEffect = new EndTurnEffect(player);
store.reduceEffect(state, endTurnEffect);
```

Thus selecting a valid empty list (zero VMAX available in remaining deck, or choosing zero voluntarily) returns **before both the required shuffle and the required end-turn effect**. This is a code-level, conditional engine divergence from the printed Ability. The empty-list selection is allowed by the real ChooseCardsPrompt because `min:0` and `allowCancel:false` forbids `null` cancellation, not the legitimate empty array. The gate `player.deck.cards.length===0` checks only any card remaining, so a deck of Basic Energy and zero VMAX still reaches the empty search.

## Why this matters for a single fixed-60 deck evaluation

An owner-only ability policy can currently answer Radiant Eternatus's `WANT_TO_USE_ABILITY` yes whenever an open Bench slot exists, without checking the remaining VMAX count (which it cannot legitimately learn until the genuine search opens). The current Agent36 experimental policy makes exactly this Bench-capacity decision, then its search selector accepts zero VMAX targets as a successful settled transaction. On this edge case the pinned engine grants a gameplay advantage the paper card does not: a player can activate a no-target search and then continue taking actions on the same turn.

This can falsely improve action throughput and any terminal outcomes in longer retrospective simulations. It is a **conditional implementation bug**, not evidence that the particular archived rank1 champion-source arm hit the empty-target condition. The source entry corresponds to the v8 rank1 `Radiant Eternatus` ConfirmPrompt; the actual archival failure at root98 is independently verified by Agent32.

## Suggested verification and corrective hook

1. Set up a small native `PlayCardAction` fixture with Radiant Eternatus CRZ, one open Bench position, a nonempty deck containing zero VMAX and a valid in-play Active. Answer the actual offered `ConfirmPrompt` true. Answer the actual `ChooseCardsPrompt` with the legal empty list. Record the pending prompts, active player, turn/phase and shuffle scheduling after Store dispatch.
2. Run a positive control with a legal VMAX in the deck to confirm the hook does not disrupt a successful chosen VMAX entry and end-turn.
3. Add an **adapter-only source-scoped hook** that continues the mandatory shuffle and end-turn behavior when the search result is empty, avoiding a vendor modification. Test that the hook restores correct game sequencing and preserves underlying physical action custody. A safe policy can also decline Climactic Gate in states where no VMAX will be available, provided it relies on legitimate owner knowledge.
4. Any policy report should explicitly veto paper qualification until this discrepancy is resolved or proven unreachable for all registered physical states.

**Evidence classification:** Exact printed card text and pinned source comparison. No executed minimal native fixture was produced in this investigation. No game/win rate is qualified; the existing experimental owner-ability test has a separate 0-root module import error (reported to Agent36).

