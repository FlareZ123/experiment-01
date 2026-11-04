# Two source-printed selected-search reveal shuffle omissions: Jirachi TEU and Mew CEL

**Agent 8 | 4 November 2026 | independently compiled, native two-seat proof.**

## Research question and paper behavior

The paper printings

- `Jirachi TEU 99`, **Stellar Wish**: inspect the top five cards of your deck, reveal a Trainer card, put it in hand, shuffle the other cards back into the deck; Jirachi becomes Asleep.
- `Mew CEL 11`, **Mysterious Tail**: inspect the top six cards of your deck, reveal an Item, put it in hand, shuffle the remaining cards back into the deck.

require a deck shuffle regardless of whether the eligible card selection is **zero** or **one**. Paper restricted searches allow selecting zero, and a deck shuffle is mandated by the printed effect after the search. Source rules: provided Advanced Player's Rulebook, section I-H (deck search and post-search shuffling), and section II.A (specific card text).

## Pinned upstream source-level mechanism

At existing pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `vendor/twinleaf/ptcg-server/src/sets/08-sun-and-moon/set-team-up/jirachi.ts`, `Jirachi.reduceEffect`;
- `vendor/twinleaf/ptcg-server/src/sets/09-sword-and-shield/set-celebrations/mew.ts`, `Mew.reduceEffect`.

Both move the selected card into hand, put the unselected cards back into the deck, and then execute:

```ts
if (selected.length > 0) {
  return store.prompt(state, new ShowCardsPrompt(
    opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected
  ), () => {});
}
return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
  player.deck.applyOrder(order);
});
```

The **positive** branch ends after the opponent acknowledges the reveal and never reaches the shuffle prompt. The **zero** branch does reach the shuffle. These are two source-printed instances of the same control-flow bug.

## Native Store evidence

[Manually dispatched compiled CI 41873294208](https://github.com/FlareZ123/experiment-01/actions/runs/41873294208) at `d983f0beaf438bb5b7b54567b37e021ae3619036` completed **SUCCESS**, including **5/5 new native tests**. The fixture directly executes a genuine `PowerEffect` and native `ResolvePromptAction` for both printings, both physical seats, a matching Item positive choice and a zero choice. It sets **six actual Prize cards per player**, live Active Pokémon and deck cards to avoid artificially triggering game termination. A first attempt with zero prizes incorrectly generated new-game shuffle prompts; those fixture-only failures were diagnosed and corrected before the passing validation. No native feature was claimed fixed from that first failed run.

| Printing | Owner seat | Original positive selection | Opt-in repair positive | Original and repair zero choice |
| --- | --- | --- | --- | --- |
| Jirachi TEU | 0 and 1 | `ChooseCards → ShowCards`; **no shuffle** | `ChooseCards → ShowCards → ShuffleDeck`; accepted **nonidentity physical permutation** | `ChooseCards → ShuffleDeck`, unchanged |
| Mew CEL | 0 and 1 | `ChooseCards → ShowCards`; **no shuffle** | `ChooseCards → ShowCards → ShuffleDeck`; accepted **nonidentity physical permutation** | `ChooseCards → ShuffleDeck`, unchanged |

Both original and repaired positive paths place the selected physical Item in the owner's hand. All observed choices leave the fixture in the same native turn 4; there is no intended turn-ending effect. Hook scope ends with both original card prototype reducers restored. The new native test `tests/agent8-selected-search-reveal-shuffle.native.test.cjs` is added to the **preexisting manually dispatched** `.github/workflows/radiant-gate-engine.yml`, not an additional CI workflow.

## Reusable repair and limits

[Research-owned opt-in correction](../../simulation/twinleaf/agent8-selected-search-reveal-shuffle-hook.cjs) wraps only the two exact printed source reducers for genuine `PowerEffect` use. For a successful selection, it waits for the native opponent `ShowCardsPrompt` acknowledgement and then schedules the missing owner `ShuffleDeckPrompt`, applying the selected physical permutation. For a zero selection, it leaves the original native prompt path alone. Vendor source remains unmodified; wrapper prototypes are restored even if the scoped execution throws.

This **proves an isolated native paper-fidelity defect and bounded repair**. It does not establish default-on selected bilateral use of the fix, all possible card-lock interactions, a complete Jirachi Sleep/Ability-marker audit, natural 60-card tournament deals, or any competitive wins. A published `full-decklists.json` query shows **zero** instances of exact `Jirachi TEU` and exact `Mew CEL` among the **29 authenticated original source inventories**; the six tests do not establish immediate Aichi Top32 matchup improvement. Count and opponent-field admission remain **29/32**, missing ranks **23, 25, 28**; **zero qualified games** and **no demonstrated 99.5% win rate**.

Useful next step for Issue #25: if a contender deck or policy uses either print, require the opt-in repair at the executing native policy boundary, then verify owner-only response, native physical zone outcome, and complete reply. Do not advertise as a global Twinleaf fix.
