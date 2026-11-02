# Secret Box TWM: source-printed three-card discard is bypassable in the pinned real Store

**Agent 4, 2 November 2026. Original real native Store, both physical seats, prepared-game research only.**

## Why this matters

The supplied card list's **Secret Box TWM (sv6-163)** requires discarding three OTHER hand cards before searching the deck for up to one each of an Item, Pokémon Tool, Supporter and Stadium. It is an ACE SPEC. Card-search connectivity and payoff should only be credited after that mandatory physical cost is actually paid. The general engine's typed prompt validator is insufficient evidence of physical legality if the Store accepts an invalid ResolvePromptAction.

## Compiled witnesses

The existing manual Twinleaf suite [CI 41430274242](https://github.com/FlareZ123/experiment-01/actions/runs/41430274242) **passed**, pinned upstream a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, checkout 5c19bd4bc846a7be89876634fd3aa3f1b9ec55d8. The original Secret Box is genuinely printed TWM. Prepared owner hand was Secret Box, Psychic Energy SVE, Grass Energy MEE, Fire Energy MEE and Battle VIP Pass FST, with real source-printed Item Field Blower GRI, Tool Powerglass SFA, Supporter Crispin SCR and Stadium Sky Field ROS in the owner's physical deck. Each Store uses a genuine original source card, source-stamped prompt and immutable physical card objects. This is not a naturally dealt source-60 game.

- With just two OTHER hand cards, native original Store cannot play Secret Box. Guard independently rejects root without physical mutation, both player seats.
- With four OTHER hand cards, native original Store prompts CHOOSE_CARD_TO_DISCARD, **min=3/max=3**, with all four actual owner-hand cards offered. The source native prompt's own validate method returns **false for empty payment**.
- Despite that false validation, **the actual unguarded Store accepts the empty ResolvePromptAction**, settles the prompt and discards Secret Box without discarding ANY of the four owner-hand cards, both physical seats. Its next genuine prompt is CHOOSE_CARD_TO_HAND with owner-deck Trainer categories.
- The reversible, source-printed [V1 guard](../../simulation/twinleaf/agent4-secret-box-paper-payment-hook.cjs) vetoes zero-card payment **before** the native Store mutation. It leaves Secret Box and all four payment candidates in hand with the mandatory prompt still pending.
- A genuinely paid **three-Energy** selection passes the guard, physically discards exactly those three cards, retains Battle VIP Pass, consumes Secret Box and permits the subsequent own-deck category search on both seats. The native prompt validator for that three-card selection returns true, all prompts settle.

Physical native fixture: [simulation/twinleaf/agent4-secret-box-payment-native.cjs](../../simulation/twinleaf/agent4-secret-box-payment-native.cjs); pure and real Store tests: [tests/agent4-secret-box-payment-native.test.cjs](../../tests/agent4-secret-box-payment-native.test.cjs), included in the existing manually dispatched native-energy-probe job. No change to the canonical v10 paper-payment guard default; this V1 is default-off. It supports optional live-Store-only restriction and trial custody but is not yet integrated or game-tested.

## Relation to Quick Ball and discrete search access

This extends the independently verified [Quick Ball FST paper-payment problem](agent4-quickball-fst-mandatory-discard-native-20261102.md). Both genuine native Store ChooseCardsPrompt instances declare their mandatory minimum (1 for Quick Ball, 3 for Secret Box), but native Store can settle an actual reply containing zero selected physical cards. Quick Ball's zero-payment control consumed the Item and skipped the Basic search; Secret Box's zero-payment control **opened a separate category-search prompt**. This is concrete evidence that a game-engine wrapper must inspect actual source-printed mandatory payment and physical owner card custody rather than trusting the return value of prompt.validate outside dispatch.

The first green staged suite chose an empty selection at the subsequently offered Secret Box search, so it proves search prompt availability and printed payment bypass, not a free four-card retrieval. A separately registered native four-category continuation test is pending; do not silently promote that conjecture until it has passed.

## Evidence limits

No match completed here, no authentic whole-60 deal, no comparison against 32 adversaries, no policy-rate estimate and no qualified result. Strong paper-cost invalidity exists even if the current bot happens never to select empty mandatory payment in a realistic game. Prioritize owner-specific physical paper constraints in the shared optimizer; keep any unrepaired native game terminal out of the win-rate numerator.

**Shared benchmark still 29/32 authenticated original source 60s, zero competitively qualified games, no demonstrated 99.5% win rate.**
