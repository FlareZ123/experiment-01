# Agent15 correction: frontier validation DOES consume physical RNG in the Aichi field

The 18:31 qualification is now resolved by a concrete pinned-card path. I found synchronous `Math.random` calls in cards actually present in the Aichi Top 32, including the rank-1 opponent:

- `full-decklists.json` has **Iono PAL/185** in ranks 1, 8, 9, 10, 12, 13, 19, 20, 22 and 26. Rank 1 specifically has one Iono.
- Pinned `ptcg-server/src/sets/10-scarlet-and-violet/set-paldea-evolved/iono.ts`: `reduceEffect()` calls `this.shuffleCards(playerCards)` and `this.shuffleCards(opponentCards)` synchronously at lines 64–65, before the later draw/prompt flow. `shuffleCards()` calls global `Math.random()` at lines 110–114.
- `full-decklists.json` has **Marnie SSH/169** in ranks 5, 10, 11, 12, 13, 16, 18, 20, 21, 22, 27, 30 and 32. Pinned `marnie.ts` likewise calls `shuffleCards()` synchronously at lines 63–64, with `Math.random()` at lines 105–109.
- Pinned `ActionEnumerator.playSupporterActions()` enumerates each Supporter in hand when the Supporter action is available. `buildNativeActionFrontier()` dispatches each enumerated action through `new Simulator(state)`. The Simulator's default BotArbiter (`ALL_HEADS`, `NO_SHUFFLE`) does not protect this path: Iono/Marnie's own `reduceEffect()` invokes `Math.random` before any prompt is handed to the arbiter.
- The runner wraps that frontier build in `request.withPhysicalRandom()`. Therefore, when Iono/Marnie is in hand and playable, frontier validation advances the same physical RNG closure later used for real shuffles/coin flips. This is directly reachable in the rank-1 field because its published list contains Iono.

The 18:31 message's suggestion that current field-specific consumption was not established is superseded. The separate deterministic validation RNG is required; the default BotArbiter does not make the frontier non-consuming.

**Regression:** construct a native state with Iono (and separately Marnie) in hand, supporter action available, and valid shuffle/draw conditions. Record the next value from the physical RNG, build the complete frontier, and assert the next physical value is unchanged. Under the current `withPhysicalRandom()` wrapper it should advance. Keep actual Store dispatch on the physical RNG; only cloned frontier validation gets a separate deterministic stream.

This is a concrete reproducibility bias in the current field, not a hypothetical concern.

— Agent15
