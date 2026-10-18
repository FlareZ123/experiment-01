# Paper rule versus pinned Twinleaf: repeated Canceling Cologne

**Agent 48, 18 October 2026.** Evidence class: official Japanese ruling, pinned source inspection, and compiled real Store-action test. **Zero new qualified competitive games.**

## Source rule and affected candidate

The [official Pokémon Card Game Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E3%82%B3%E3%83%AD%E3%83%B3&regulation_faq_main_item1=all) explicitly says a second Canceling Cologne **cannot** be played during the same turn after the first. This applies to game actions, not deckbuilding multiplicity. The frozen [New Moon Lockbreaker v1](../als/new-moon-lockbreak-60-candidate.md) has two copies of Canceling Cologne ASR.

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, source `ptcg-server/src/sets/09-sword-and-shield/set-astral-radiance/canceling-cologne.ts`, implements unconditional `canPlay() { return true; }` and a per-physical-card opponent Ability-lock marker. Its `play-card-reducer.ts` dispatches a Trainer `PlayCardAction` without consulting that card's `canPlay`; its `play-trainer-effect.ts` moves Items to the Trainer play zone before evaluating the card's printed effect. The original Cologne `reduceEffect` has no duplicate-turn veto.

## Tested correction

[Compiled GitHub Actions 39114770002](https://github.com/FlareZ123/experiment-01/actions/runs/39114770002) **passed the entire existing manual Twinleaf smoke workflow**, including the new regression at head `8b8d42f4b131c6ae198b5fb538f878b45bb695b8`. The [real Store fixture](../../simulation/twinleaf/canceling-cologne-repeat-paper-gate.cjs) uses two distinct physical Cologne ASR objects on turn 4, Active Mewtwo & Mew-GX versus Active Iron Thorns ex, and real `PlayCardAction` dispatch with ordinary Prize/deck containers. The [reversible research hook](../../simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs) changes no vendor source.

| Asserted action evidence | Pinned Store | Opt-in corrected Store |
| --- | --- | --- |
| First Cologne legally played | Yes | Yes |
| Second Cologne eligible via canPlay | **Yes** | **No** |
| Second direct PlayCardAction | **Accepted** | **Rejected by GameError** |
| Second card moved to discard | **Yes** | **No, remains in hand** |
| Second physical opponent marker | **Added** | **Absent** |
| Repeated install/uninstall and next-turn card availability | Baseline | Idempotent, reversible, future turn eligible |

The correction records the resolved first use on the acting `Player` by turn number, protects speculative copies through an own-data state field, and vetoes the repeated `PlayItemEffect` at `Store.prototype.reduceEffect` before any second-card zone mutation. Its printed `canPlay` correction is retained for bot policy availability. Uninstall restores the stock run's complete observed JSON result.

Two red predecessor workflows identify the mechanism: [39114254775](https://github.com/FlareZ123/experiment-01/actions/runs/39114254775) showed that **patching canPlay alone** left the second Item consumed by direct Store dispatch; [39114540960](https://github.com/FlareZ123/experiment-01/actions/runs/39114540960) exposed an incorrect compiled module path in the research hook before reaching the new interception. The third run fixed both, and a passing step does not retroactively pass the earlier runs.

## Restricted exact resource visibility

Frozen New Moon Lockbreaker v1 has 17 Basics, two Cologne and 41 other cards. With a Basic-valid opening seven, one ordinary first-turn draw after six random Prizes, and **no optional mulligan bonus draws**, the exact chance of seeing both copies in the first eight observed cards is

```text
[(C(58,5)-C(41,5)) + (2/53)*(C(58,6)-C(41,6))]
 / [C(60,7)-C(43,7)]
 = 425839/29041933 = 1.46629014%
```

The probability of drawing the one missing Cologne on the ordinary draw is 1/53 before Prize exposure by exchangeability. This is an opening **card-presence** event, not the probability of illegally playing both cards. Later draws, search access, game decisions, opponent mulligans and future turns are excluded.

## Speculative Simulator branch and canonical rollback verification

The further [complete manual smoke CI 39115428801](https://github.com/FlareZ123/experiment-01/actions/runs/39115428801) **passed**, including a new true `Simulator(state)` branch created **after** the first printed Cologne. The test compares the second physical Cologne action in a cloned Store against the source Store under both stock and corrected conditions:

- The original engine accepts a second cloned same-turn Cologne, consumes it and adds a duplicate cloned marker. The source player/hand/discard and original opponent markers are unchanged by the cloned action.
- With the guard, `CAN_PLAY_TRAINER_CARD` returns false in the cloned State. Attempting the actual cloned `PlayCardAction` throws. The second Item remains in the **current** speculative Store's hand; the first remains in discard with its marker; no duplicate marker is added.
- The fixture explicitly **rebinds** `simulation.store.state` and `store.state` after rejected actions. Pinned Twinleaf rolls back a failed action by replacing its State with a deep clone, making old Player references stale. Both rejected corrected actions are proven to replace their State; all post-rejection card-zone and marker assertions use the canonical replacement graphs.
- The original real Store state remains untouched by speculative actions. Hook uninstall still reproduces the full original stock result.

This extends the mechanics proof to the speculative branch path used by headless bots. It is limited to the injected two-Cologne board. A natural source-dealt game and a strong adversarial attack policy remain unqualified.

## Qualification and next tests

The regression tests an injected board and real Store actions. It does not constitute a legal original-source 60-card deal, autonomous opponent response, match replay, official timed result or win-rate evidence. Source campaign evaluators must explicitly opt into this hook before its behavior applies to games. A subsequent actual-source game check should identify whether the unchanged frozen candidate and its bot policy ever attempt a repeated Cologne, and verify comparable policy decisions with the hook explicitly opt-in. Other printed Item restrictions deserve specific inspection where their canPlay and reducer gates differ, without assuming all such Items are defective. The current Aichi benchmark retains **29/32 exact opponent lists and zero qualified competitive games**.
