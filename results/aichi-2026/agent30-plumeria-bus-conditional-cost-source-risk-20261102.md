# Original Plumeria BUS120: one-card payment may reach opponent Energy discard in pinned Store

**Agent30, 2 November 2026. Evidence class: exact original-card roster and pinned-vendor static analysis. NO genuine native Plumeria payoff test, NO competitive games.**

## Original paper effect, availability and business importance

Plumeria (Burning Shadows **BUS 120**) reads: *“Discard 2 cards from your hand. If you do, discard an Energy from 1 of your opponent's Pokémon.”* Paying **two physical other hand cards** is mandatory for the conditional Energy removal, and the attack's opponent Energy must be a genuinely attached card.

Eight of 29 authenticated Aichi 2026 original 60s contain Plumeria, **20 copies total**. Exact original ranks: **2, 3, 6, 7, 9, 16, 24, 29** in [`full-decklists.json`](full-decklists.json). That includes the rank3 and rank7 Snorlax Stall lists, where taking a single opponent Energy can be disproportionately important for a tactical stall turn. These are real source-membership facts; play frequency and resource discardability are unknown.

## Source-code reason to request a real payment test

Pinned upstream Twinleaf commit **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, file [`ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/plumeria.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/plumeria.ts):

1. Source `canPlay` and root require **at least two** hand cards other than Plumeria, and an opponent Pokémon with Energy. These preconditions are present, so ordinary legal policy can always pay in that source state.
2. Root moves the Supporter to the Supporter zone, prompts from a temporary list with **min:2, max:2, allowCancel:false** and a callback `cardsInHand=selected||[]`.
3. The generator tests only **`if(cardsInHand.length===0)`**, then moves `cardsInHand` to discard and **unconditionally** opens target-`ChoosePokemonPrompt`, followed by a target-`ChooseCardsPrompt` for one opponent Energy and `MOVE_CARDS` to opponent discard.
4. The generic pinned [`Store.reducePrompt`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) assigns submitted ResolvePromptAction results without always enforcing the `ChooseCardsPrompt.validate` method. Confirmed underpaid payoff flows for Ultra Ball, Secret Box and Dowsing make the Plumeria **one-card** case a coherent, specific paper-fidelity hypothesis.

**Missing evidence:** no actual two-owner-seat, real native Store Plumeria payment-and-opponent-Energy movement trace has been created or executed for this proposed test. It is entirely possible to mishandle owner target orientation or that a different engine check prevents the predicted payout. Do not assert the exploit is proven, and do not count any illegal payoff or competitive game.

## Roster exposure accounting, separated by evidence status

- **Native-proven paper-underpaid payoff sources**: Ultra Ball MEG131, Secret Box TWM163 and Dowsing Machine PLS128 appear in **18 distinct original decks** (35 physical copies). Their genuine Store receipts are separately published.
- **Additional unverified Guzma & Hala CEC193 optional-cost source-code concern**: five other ranks, **2,6,15,24,29**, would raise possible-vulnerable membership to 23/29 if a native test corroborates it.
- **Additional unverified Plumeria BUS120**: only **ranks 3 and 7** are outside both previous groups. Thus the combined *upper inventory exposure* for the five named card paths is **25/29**, with unaffected ranks **1,10,13,31**. This is a conditional source-identity union and does not describe actual exploit incidence, wins, or policy selection.

## Minimum prospective test

Prepared original printed 60 from rank3 Snorlax Stall or rank6 Iron Thorns. In an actual pinned live Store, confirm Plumeria and two other original hand cards, a specific attached opponent Energy, and both owner seats. Submit zero, one and two distinct physically eligible hand cards to the authentic `CHOOSE_CARD_TO_DISCARD` prompt. Resolve *real* subsequent Pokémon and Energy selection prompts, then inspect owner hand/discard, opponent Energy attachment/discard, source Supporter zone, prompt validation and terminal flags. The **two-card paid branch is a required positive control**. Do not use a mocked returned result, a mere prompt-structure claim, or independently injected field changes as evidence of an actual native source payoff.

Only admit whole-game data after the shared bilateral policy selects the real source action and a consequential opponent continuation. Source-level findings are valid as release-gate warnings, never as proof of competitive win rates.
