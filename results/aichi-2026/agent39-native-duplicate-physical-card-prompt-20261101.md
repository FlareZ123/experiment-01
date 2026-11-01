# Agent39: one physical card submitted twice in a Twinleaf multi-card search prompt

**1 November 2026.** Development-only, direct pinned Store physical-selection control. Target: broad paper-prompt fidelity, **not** competitive game strength. Original Aichi field remains 29/32 exact opposing sixties and 0 qualified games.

## Mechanism from pinned source

The pinned `ptcg-server/src/game/store/prompts/choose-cards-prompt.ts` `chooseCardsSelectionValid` function checks result count, filtering, card-type limits, blocked indices and whether each selected reference appears in the supplied source CardList using `cards.indexOf(r)`. It lacks a *distinct physical card object identity* requirement; submitting `[a,a]` when `a` occurs once in the source can satisfy `min=max=2`. Separately `ptcg-server/src/game/store/store.ts` `reducePrompt` installs `action.result` directly without calling the native validator. `state/card-list.ts` `moveCardsTo` then moves each reference only when still physically present, so the second duplicated input has no source card left to move. Paper rules physically require two different cards when two cards are selected, including different copies with the same printed name.

## Two-seat actual pinned Store reproduction

[`simulation/twinleaf/agent39-duplicate-card-native.cjs`](../../simulation/twinleaf/agent39-duplicate-card-native.cjs) stages **two physically different, same-name Psychic Energy cards** in the own-deck CardList of a genuine pinned Store, with a `ChooseCardsPrompt(min=max=2, allowCancel=false)` callback physically moving selected cards to hand.

[Compiled original v1 CI 41332516682](https://github.com/FlareZ123/experiment-01/actions/runs/41332516682) **SUCCESS**, research HEAD `200e2679bf9115e7e046ab0259adfdb79f75e35e`, tests **111/111 passing** and genuine native Store fixtures in both actor seats:

- `prompt.validate([a,a])===true` even though two entries point to the **same** physical card object.
- The unchecked native Store accepts `ResolvePromptAction([a,a])`; only **one** physical card is moved to the hand and the other same-name physical Energy card remains in the deck.
- The reversible negative-only `Store.dispatch` guard blocks `[a,a]` **before any state mutation**, including unresolved prompt status.
- The two same-name but physically *distinct* references `[a,b]` are accepted and exactly two physical cards move. Guard restoration after the synchronous workload is checked.
- The same test's original Iron Thorns ex paper prompt fixture also proved that with **no own Benched Pokémon** (both seats), the original reducer correctly generates **no mandatory Volt Cyclone transfer prompt**. An exact-one transfer may only be demanded when an eligible Bench exists, consistent with paper rulebook C-10.

The original v1 guard only checked distinct identity. A stricter v2 implementation `simulation/twinleaf/agent39-paper-distinct-selection.cjs` also checks that each submitted card object **belongs to the prompt's physical CardList**. The v2 staged native fixture checks foreign physical cards from the opposing hand both with and without guard. Its manually triggered compiled [CI 41332735978](https://github.com/FlareZ123/experiment-01/actions/runs/41332735978) is **pending final result as of this document's creation**; do not claim the additional foreign-object native proof until inspecting its real workflow status.

## General negative-only helper and release scope

The default-off [`withDistinctPhysicalCardSelectionVeto`](../../simulation/twinleaf/agent39-paper-distinct-selection.cjs) is a minimal reversible native Store dispatch boundary, with physical source membership and distinctness based on exact object reference rather than same card name. It records separate live-Store versus auxiliary attempts and vetoes with no chosen-card identities exported. It uses first `AddPlayerAction` to recognize the live Store and does not claim unknown standalone staged Stores are registered live games.

**Critical evidence classification:** for any response with both distinct identity and source membership, the helper returns **unverified**, not paper-verified. Other printed conditions, actual chosen effect resolution, K0/K1 deck knowledge, arbitrary source zones, count/blocked/type constraints, player ownership, generic attack legality, and 25-minute clock remain independent. The staged two-seat prompt is synthetic `ChooseCardsPrompt` geometry; no source-specific original Aichi printing created that prompt naturally in the fixture, and no complete original physical-60 game played. Do **not** elevate this control to full-field validation or claim a simulator-exploitable win rate.

Possible integration: apply the negative-only card membership/duplicate veto to *all live* `ChooseCardsPrompt` replies in the single shared `agent41-paper-prompt-contract-portfolio.cjs` before any source-specific positive status. Prompt source stamping and printed-card checks still determine positive qualification. This avoids silently treating a valid native ResolvePromptAction as an independent paper proof. The [Agent41 handoff](../../communications/agent41/20261101T174200Z_agent39_generic_choose_cards_duplicate_negative_native.md) preserves the exact staged limitations and two-seat CI evidence.
